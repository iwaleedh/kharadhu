import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

// Telegram-style Input
export const Input = forwardRef(({ label, error, className, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#8B9DA8] mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full px-4 py-3 bg-[#242F3D] border border-[#3D4D5C] rounded-lg text-white',
          'focus:outline-none focus:border-[#2AABEE] focus:ring-1 focus:ring-[#2AABEE]/30',
          'disabled:bg-[#1F2936] disabled:cursor-not-allowed disabled:text-[#6B7C85]',
          'placeholder:text-[#6B7C85] transition-all duration-200',
          error && 'border-[#FF5252] focus:ring-[#FF5252]/30 focus:border-[#FF5252]',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-[#FF5252]">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';

export const TextArea = forwardRef(({ label, error, className, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#8B9DA8] mb-1.5">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={cn(
          'w-full px-4 py-3 bg-[#242F3D] border border-[#3D4D5C] rounded-lg text-white',
          'focus:outline-none focus:border-[#2AABEE] focus:ring-1 focus:ring-[#2AABEE]/30',
          'disabled:bg-[#1F2936] disabled:cursor-not-allowed disabled:text-[#6B7C85]',
          'placeholder:text-[#6B7C85] transition-all duration-200',
          error && 'border-[#FF5252] focus:ring-[#FF5252]/30 focus:border-[#FF5252]',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-[#FF5252]">{error}</p>}
    </div>
  );
});
TextArea.displayName = 'TextArea';

export const Select = ({ label, error, options, className, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#8B9DA8] mb-1.5">
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full px-4 py-3 bg-[#242F3D] border border-[#3D4D5C] rounded-lg text-white',
          'focus:outline-none focus:border-[#2AABEE] focus:ring-1 focus:ring-[#2AABEE]/30',
          'disabled:bg-[#1F2936] disabled:cursor-not-allowed disabled:text-[#6B7C85]',
          'transition-all duration-200',
          error && 'border-[#FF5252] focus:ring-[#FF5252]/30 focus:border-[#FF5252]',
          className
        )}
        {...props}
      >
        {options?.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#242F3D]">
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs text-[#FF5252]">{error}</p>
      )}
    </div>
  );
};
