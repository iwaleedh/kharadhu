import { cn } from '../../lib/utils';

export const Card = ({ children, className, hover = false, ...props }) => {
  return (
    <div
      className={cn(
        'bg-gradient-to-br from-gray-900 to-gray-950 rounded-xl shadow-lg border border-gray-800 p-4',
        hover && 'hover:shadow-xl hover:border-gray-700 transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className }) => {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className }) => {
  return (
    <h3 className={cn('text-xl font-bold bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent', className)}>
      {children}
    </h3>
  );
};

export const CardContent = ({ children, className }) => {
  return (
    <div className={cn(className)}>
      {children}
    </div>
  );
};
