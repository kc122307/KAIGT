import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showText?: boolean;
  textClassName?: string;
  onClick?: () => void;
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8', 
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20',
  '2xl': 'w-24 h-24'
};

const textSizeClasses = {
  xs: 'text-sm',
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
  xl: 'text-2xl',
  '2xl': 'text-3xl'
};

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  className, 
  showText = false, 
  textClassName,
  onClick 
}) => {
  const logoElement = (
    <div 
      className={cn(
        "flex items-center gap-2",
        onClick && "cursor-pointer hover:opacity-80 transition-opacity",
        className
      )}
      onClick={onClick}
    >
      <img
        src="/Kaigt.png"
        alt="KAIGT Logo"
        className={cn(
          "object-contain",
          sizeClasses[size]
        )}
        onError={(e) => {
          // Fallback if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
      {showText && (
        <span 
          className={cn(
            "font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent",
            textSizeClasses[size],
            textClassName
          )}
        >
          KAIGT
        </span>
      )}
    </div>
  );

  return logoElement;
};

export default Logo;