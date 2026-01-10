/**
 * Gemini Flash OCR Service
 * Uses Google Gemini 2.0 Flash for multilingual receipt text extraction
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Storage key for API key
const API_KEY_STORAGE = 'kharadhu_gemini_api_key';

/**
 * Get stored Gemini API key
 */
export const getGeminiApiKey = () => {
    return localStorage.getItem(API_KEY_STORAGE);
};

/**
 * Save Gemini API key
 */
export const setGeminiApiKey = (apiKey) => {
    if (apiKey) {
        localStorage.setItem(API_KEY_STORAGE, apiKey.trim());
    } else {
        localStorage.removeItem(API_KEY_STORAGE);
    }
};

/**
 * Check if Gemini API is configured
 */
export const isGeminiConfigured = () => {
    const key = getGeminiApiKey();
    return key && key.length > 0;
};

/**
 * Convert image file to base64
 */
const imageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // Remove the data:image/xxx;base64, prefix
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Extract receipt data using Gemini Flash
 * @param {File} imageFile - The receipt image file
 * @returns {Promise<{merchant: string, date: string, total: number, items: Array, rawText: string}>}
 */
export const extractReceiptWithGemini = async (imageFile) => {
    const apiKey = getGeminiApiKey();

    if (!apiKey) {
        throw new Error('Gemini API key not configured. Please add your API key in Settings.');
    }

    try {
        const base64Image = await imageToBase64(imageFile);
        const mimeType = imageFile.type || 'image/jpeg';

        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        {
                            text: `Analyze this receipt image and extract the following information. The receipt may be in any language (English, Dhivehi, Arabic, etc.). Please extract:

1. Merchant/Store name
2. Date of transaction (in YYYY-MM-DD format if possible)
3. Total amount (just the number)
4. List of items with their prices

Return the data in this exact JSON format:
{
  "merchant": "Store Name",
  "date": "YYYY-MM-DD",
  "total": 123.45,
  "items": [
    {"name": "Item 1", "price": 10.00, "quantity": 1},
    {"name": "Item 2", "price": 20.00, "quantity": 2}
  ],
  "rawText": "Full extracted text from receipt"
}

If you cannot extract a field, use null for that field. Always try to extract the total amount.`
                        },
                        {
                            inline_data: {
                                mime_type: mimeType,
                                data: base64Image
                            }
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.1,
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 2048,
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 400) {
                throw new Error('Invalid API key or request. Please check your Gemini API key.');
            }
            if (response.status === 429) {
                throw new Error('API rate limit exceeded. Please try again later.');
            }
            throw new Error(errorData.error?.message || `API error: ${response.status}`);
        }

        const data = await response.json();

        // Extract the text response
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) {
            throw new Error('No response from Gemini API');
        }

        // Parse the JSON from the response
        // Try to find JSON in the response (it might be wrapped in markdown code blocks)
        let jsonMatch = textResponse.match(/```json\s*([\s\S]*?)\s*```/);
        let jsonStr = jsonMatch ? jsonMatch[1] : textResponse;

        // If no code block, try to find raw JSON
        if (!jsonMatch) {
            jsonMatch = textResponse.match(/\{[\s\S]*\}/);
            jsonStr = jsonMatch ? jsonMatch[0] : textResponse;
        }

        try {
            const result = JSON.parse(jsonStr);
            return {
                merchant: result.merchant || '',
                date: result.date || '',
                total: typeof result.total === 'number' ? result.total : parseFloat(result.total) || 0,
                items: Array.isArray(result.items) ? result.items : [],
                rawText: result.rawText || textResponse
            };
        } catch {
            // If JSON parsing fails, return with raw text only
            return {
                merchant: '',
                date: '',
                total: 0,
                items: [],
                rawText: textResponse
            };
        }

    } catch (error) {
        console.error('Gemini OCR error:', error);
        throw error;
    }
};

/**
 * Test the Gemini API key
 */
export const testGeminiApiKey = async (apiKey) => {
    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: 'Say "OK" if you can read this.'
                    }]
                }]
            })
        });

        if (!response.ok) {
            return { valid: false, error: 'Invalid API key' };
        }

        return { valid: true };
    } catch (error) {
        return { valid: false, error: error.message };
    }
};

/**
 * Parse SMS transaction using Gemini AI
 * Supports multilingual SMS (Dhivehi, Arabic, English) from various banks
 * @param {string} smsText - The SMS text to parse
 * @returns {Promise<{type: string, amount: number, merchant: string, date: string, balance: number, bank: string, accountNumber: string, rawText: string}>}
 */
export const parseSmsWithGemini = async (smsText) => {
    const apiKey = getGeminiApiKey();

    if (!apiKey) {
        throw new Error('Gemini API key not configured. Please add your API key in Settings.');
    }

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Parse this bank SMS message and extract transaction details. The SMS may be in English, Dhivehi (Thaana script), or Arabic. Common banks include BML (Bank of Maldives), MIB (Maldives Islamic Bank), HDFC, and others.

SMS Text:
"""
${smsText}
"""

Extract the following information and return as JSON:
{
  "type": "debit" or "credit" (debit for purchases/withdrawals/payments, credit for deposits/transfers received),
  "amount": 123.45 (just the number, no currency symbol),
  "merchant": "Store or description" (who/what the transaction was for),
  "date": "YYYY-MM-DD" (if found, otherwise today's date),
  "time": "HH:MM" (if found, otherwise null),
  "balance": 456.78 (remaining balance if mentioned, otherwise null),
  "bank": "Bank name" (BML, MIB, HDFC, etc.),
  "accountNumber": "last 4 digits if found" (e.g., "1234"),
  "cardNumber": "last 4 digits of card if mentioned" (e.g., "5678"),
  "reference": "reference number if any",
  "category": "suggested category" (Food & Dining, Shopping, Transfer, ATM, etc.)
}

Rules:
- "Purchase", "Spent", "Paid", "Debited", "Withdrawn" = type "debit"
- "Received", "Credited", "Deposited", "Transfer In" = type "credit"
- MVR is Maldivian Rufiyaa currency
- Look for patterns like "MVR 100.00" or "Rf.100" or just numbers near transaction keywords
- Always try to extract the amount, this is the most important field`
                    }]
                }],
                generationConfig: {
                    temperature: 0.1,
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 1024,
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 400) {
                throw new Error('Invalid API key or request.');
            }
            if (response.status === 429) {
                throw new Error('API rate limit exceeded. Please try again later.');
            }
            throw new Error(errorData.error?.message || `API error: ${response.status}`);
        }

        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) {
            throw new Error('No response from Gemini API');
        }

        // Parse JSON from response
        let jsonMatch = textResponse.match(/```json\s*([\s\S]*?)\s*```/);
        let jsonStr = jsonMatch ? jsonMatch[1] : textResponse;

        if (!jsonMatch) {
            jsonMatch = textResponse.match(/\{[\s\S]*\}/);
            jsonStr = jsonMatch ? jsonMatch[0] : textResponse;
        }

        try {
            const result = JSON.parse(jsonStr);
            return {
                type: result.type === 'credit' ? 'credit' : 'debit',
                amount: typeof result.amount === 'number' ? result.amount : parseFloat(result.amount) || 0,
                merchant: result.merchant || '',
                date: result.date || new Date().toISOString().split('T')[0],
                time: result.time || null,
                balance: result.balance ? parseFloat(result.balance) : null,
                bank: result.bank || '',
                accountNumber: result.accountNumber || '',
                cardNumber: result.cardNumber || '',
                reference: result.reference || '',
                category: result.category || (result.type === 'credit' ? 'Income' : 'Other'),
                rawText: smsText
            };
        } catch {
            throw new Error('Failed to parse SMS. Please check the message format.');
        }

    } catch (error) {
        console.error('Gemini SMS parse error:', error);
        throw error;
    }
};

/**
 * Parse multiple SMS messages in batch
 * @param {string[]} smsMessages - Array of SMS texts
 * @returns {Promise<Array>}
 */
export const parseSmsArrayWithGemini = async (smsMessages) => {
    const results = [];
    for (const sms of smsMessages) {
        try {
            const parsed = await parseSmsWithGemini(sms);
            results.push({ success: true, data: parsed });
        } catch (error) {
            results.push({ success: false, error: error.message, rawText: sms });
        }
    }
    return results;
};
