import { cn } from '../../lib/utils';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-98';

  // Telegram-style button variants
  const variants = {
    primary: 'bg-[#2AABEE] hover:bg-[#3BB5F0] active:bg-[#1E96D1] text-white',
    secondary: 'bg-[#2B3845] hover:bg-[#3D4D5C] text-white border border-[#3D4D5C]',
    success: 'bg-[#4CAF50] hover:bg-[#5CBF60] text-white',
    danger: 'bg-[#FF5252] hover:bg-[#FF6B6B] text-white',
    outline: 'border-2 border-[#2AABEE] text-[#2AABEE] hover:bg-[#2AABEE]/10',
    ghost: 'hover:bg-[#2B3845] text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
