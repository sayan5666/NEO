import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'dark' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  disabled,
  ...props
}) => {
  const baseStyles =
    'neo-border font-bold uppercase transition-all inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'px-3 py-1.5 font-mono text-xs',
    md: 'px-5 py-2.5 font-mono text-sm',
    lg: 'px-8 py-3.5 font-headline text-base tracking-wide',
  };

  const variantStyles = {
    primary:
      'bg-[#ffd93d] text-[#1b1b1b] neo-shadow neo-btn hover:bg-[#ffe173]',
    secondary:
      'bg-[#ffffff] text-[#1b1b1b] neo-shadow neo-btn hover:bg-[#f3f3f3]',
    dark:
      'bg-[#1b1b1b] text-[#ffffff] neo-shadow neo-btn hover:bg-[#333333]',
    danger:
      'bg-[#ba1a1a] text-[#ffffff] neo-shadow neo-btn hover:bg-[#d92222]',
    ghost:
      'bg-transparent text-[#1b1b1b] border-transparent hover:border-[#1b1b1b] hover:bg-[#e2e2e2]',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
