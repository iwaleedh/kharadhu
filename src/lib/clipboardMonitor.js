import { parseSMS } from './smsParser';

// Check if text looks like a bank SMS
export const isBankSMS = (text) => {
  if (!text || typeof text !== 'string') return false;
  
  // BML patterns
  const bmlPattern1 = /Transaction from.*for MVR.*was processed/i;
  const bmlPattern2 = /BML.*account.*ending.*\d{4}.*MVR\s*[\d,]+/i;
  
  // MIB patterns
  const mibPattern = /MIB.*A\/C.*\*+\d{4}.*MVR\s*[\d,]+/i;
  
  return bmlPattern1.test(text) || bmlPattern2.test(text) || mibPattern.test(text);
};

// Clipboard monitoring class
export class ClipboardMonitor {
  constructor(onSMSDetected) {
    this.onSMSDetected = onSMSDetected;
    this.lastClipboard = '';
    this.isMonitoring = false;
    this.intervalId = null;
    this.hasPermission = false;
  }

  // Check clipboard permission
  async checkPermission() {
    try {
      const permission = await navigator.permissions.query({ 
        name: 'clipboard-read' 
      });
      this.hasPermission = permission.state === 'granted' || permission.state === 'prompt';
      return this.hasPermission;
    } catch (error) {
      // Clipboard API not supported or permission denied
      console.log('Clipboard permission check failed:', error);
      return false;
    }
  }

  // Read clipboard
  async readClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      return text;
    } catch {
      // Silent fail - clipboard access denied or not available
      return null;
    }
  }

  // Check clipboard for bank SMS
  async checkForBankSMS() {
    const text = await this.readClipboard();
    
    if (!text) return;
    
    // Check if clipboard changed
    if (text !== this.lastClipboard) {
      this.lastClipboard = text;
      
      // Check if it's a bank SMS
      if (isBankSMS(text)) {
        try {
          // Parse the SMS
          const transaction = parseSMS(text);
          
          // Notify callback
          if (this.onSMSDetected) {
            this.onSMSDetected(transaction, text);
          }
        } catch (error) {
          console.error('Failed to parse SMS:', error);
        }
      }
    }
  }

  // Start monitoring
  async start() {
    if (this.isMonitoring) return;
    
    // Check permission first
    const hasPermission = await this.checkPermission();
    if (!hasPermission) {
      console.log('Clipboard monitoring: No permission');
      return false;
    }
    
    this.isMonitoring = true;
    
    // Check clipboard every 2 seconds
    this.intervalId = setInterval(() => {
      this.checkForBankSMS();
    }, 2000);
    
    console.log('Clipboard monitoring started');
    return true;
  }

  // Stop monitoring
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isMonitoring = false;
    console.log('Clipboard monitoring stopped');
  }

  // Get monitoring status
  isActive() {
    return this.isMonitoring;
  }
}

// Create singleton instance
let monitorInstance = null;

export const createClipboardMonitor = (onSMSDetected) => {
  if (monitorInstance) {
    monitorInstance.stop();
  }
  monitorInstance = new ClipboardMonitor(onSMSDetected);
  return monitorInstance;
};

export const getClipboardMonitor = () => {
  return monitorInstance;
};
