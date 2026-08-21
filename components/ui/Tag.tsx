import React from 'react';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'yellow' | 'purple' | 'pink' | 'gray' | 'dark' | 'red' | 'outline';
  size?: 'xs' | 'sm' | 'md';
  children: React.ReactNode;
}

export const Tag: React.FC<TagProps> = ({
  variant = 'gray',
  size = 'sm',
  className = '',
  children,
  ...props
}) => {
  const sizeStyles = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs',
  };

  const variantStyles = {
    yellow: 'bg-[#ffd93d] text-[#1b1b1b] border-[#1b1b1b]',
    purple: 'bg-[#625595] text-[#ffffff] border-[#1b1b1b]',
    pink: 'bg-[#e0d6ff] text-[#645797] border-[#1b1b1b]',
    gray: 'bg-[#e2e2e2] text-[#1b1b1b] border-[#1b1b1b]',
    dark: 'bg-[#1b1b1b] text-[#ffffff] border-[#1b1b1b]',
    red: 'bg-[#ffdad8] text-[#ba1a1a] border-[#1b1b1b]',
    outline: 'bg-transparent text-[#1b1b1b] border-[#1b1b1b]',
  };

  return (
    <span
      className={`border-[2px] font-mono font-bold uppercase inline-flex items-center gap-1 shrink-0 ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
