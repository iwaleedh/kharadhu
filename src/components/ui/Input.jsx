import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const Input = forwardRef(({ label, error, className, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-gray-300 mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100',
          'focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500',
          'disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-500',
          'placeholder:text-gray-600 transition-all duration-300',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';

export const TextArea = forwardRef(({ label, error, className, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-gray-300 mb-1">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={cn(
          'w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100',
          'focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500',
          'disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-500',
          'placeholder:text-gray-600 transition-all duration-300',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
});
TextArea.displayName = 'TextArea';

export const Select = ({ label, error, options, className, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-gray-300 mb-1">
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100',
          'focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500',
          'disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-500',
          'transition-all duration-300',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      >
        {options?.map((option) => (
          <option key={option.value} value={option.value} className="bg-gray-900">
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
};
