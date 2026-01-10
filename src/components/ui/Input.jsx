import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

// Modern blue-themed Input
export const Input = forwardRef(({ label, error, className, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-400 mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white',
          'focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
          'disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-500',
          'placeholder:text-slate-500 transition-all duration-200',
          error && 'border-red-500 focus:ring-red-500/20 focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';

export const TextArea = forwardRef(({ label, error, className, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-400 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={cn(
          'w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white',
          'focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
          'disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-500',
          'placeholder:text-slate-500 transition-all duration-200',
          error && 'border-red-500 focus:ring-red-500/20 focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
});
TextArea.displayName = 'TextArea';

export const Select = ({ label, error, options, className, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-400 mb-1.5">
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white',
          'focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
          'disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-500',
          'transition-all duration-200',
          error && 'border-red-500 focus:ring-red-500/20 focus:border-red-500',
          className
        )}
        {...props}
      >
        {options?.map((option) => (
          <option key={option.value} value={option.value} className="bg-slate-800">
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1.5 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
};
