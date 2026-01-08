import { useState, useRef } from 'react';
import { X, Tag, Plus } from 'lucide-react';

/**
 * TagInput - Component for adding/removing tags on transactions
 */
export const TagInput = ({ value = [], onChange, placeholder = 'Add tags...' }) => {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef(null);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
            removeTag(value.length - 1);
        }
    };

    const addTag = () => {
        const tag = inputValue.trim().toLowerCase();
        if (tag && !value.includes(tag)) {
            onChange([...value, tag]);
        }
        setInputValue('');
    };

    const removeTag = (index) => {
        const newTags = value.filter((_, i) => i !== index);
        onChange(newTags);
    };

    const tagColors = [
        'bg-blue-100 text-blue-700',
        'bg-green-100 text-green-700',
        'bg-purple-100 text-purple-700',
        'bg-pink-100 text-pink-700',
        'bg-yellow-100 text-yellow-700',
        'bg-indigo-100 text-indigo-700',
    ];

    const getTagColor = (index) => tagColors[index % tagColors.length];

    return (
        <div
            className="flex flex-wrap items-center gap-1.5 p-2 border border-gray-300 rounded-lg bg-white min-h-[42px] cursor-text"
            onClick={() => inputRef.current?.focus()}
        >
            {value.map((tag, index) => (
                <span
                    key={tag}
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTagColor(index)}`}
                >
                    <Tag size={10} className="mr-1" />
                    {tag}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            removeTag(index);
                        }}
                        className="ml-1 hover:opacity-70"
                    >
                        <X size={12} />
                    </button>
                </span>
            ))}
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={addTag}
                placeholder={value.length === 0 ? placeholder : ''}
                className="flex-1 min-w-[100px] border-0 outline-none text-sm bg-transparent"
            />
        </div>
    );
};

/**
 * TagBadge - Display a single tag
 */
export const TagBadge = ({ tag, onClick, removable = false, onRemove }) => {
    return (
        <span
            onClick={onClick}
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 ${onClick ? 'cursor-pointer hover:bg-gray-200' : ''
                }`}
        >
            <Tag size={10} className="mr-1" />
            {tag}
            {removable && onRemove && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="ml-1 hover:opacity-70"
                >
                    <X size={12} />
                </button>
            )}
        </span>
    );
};

/**
 * TagFilter - Filter tags component for transaction list
 */
export const TagFilter = ({ allTags, selectedTags, onToggle }) => {
    if (!allTags || allTags.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-1.5">
            {allTags.slice(0, 10).map((tag) => (
                <button
                    key={tag}
                    onClick={() => onToggle(tag)}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs transition-colors ${selectedTags.includes(tag)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    <Tag size={10} className="mr-1" />
                    {tag}
                </button>
            ))}
        </div>
    );
};

