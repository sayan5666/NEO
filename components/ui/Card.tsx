import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  shadow?: 'none' | 'sm' | 'md' | 'static';
  bg?: string;
  badge?: {
    text: string;
    variant?: 'yellow' | 'purple' | 'pink' | 'gray' | 'dark' | 'red';
  };
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  shadow = 'md',
  bg = 'bg-[#ffffff]',
  badge,
  className = '',
  children,
  ...props
}) => {
  const shadowStyles = {
    none: '',
    sm: 'neo-shadow-sm',
    md: 'neo-shadow',
    static: 'neo-shadow-static',
  };

  const badgeVariants = {
    yellow: 'bg-[#ffd93d] text-[#1b1b1b]',
    purple: 'bg-[#625595] text-[#ffffff]',
    pink: 'bg-[#e0d6ff] text-[#645797]',
    gray: 'bg-[#e2e2e2] text-[#1b1b1b]',
    dark: 'bg-[#1b1b1b] text-[#ffffff]',
    red: 'bg-[#ffdad8] text-[#ba1a1a]',
  };

  return (
    <div className={`relative ${badge ? 'pt-3' : ''}`}>
      {badge && (
        <div
          className={`absolute top-0 left-3 md:left-4 z-10 font-mono text-xs font-bold uppercase px-3 py-1 neo-border ${
            badgeVariants[badge.variant || 'gray']
          }`}
        >
          {badge.text}
        </div>
      )}
      <div
        className={`neo-border ${bg} ${shadowStyles[shadow]} ${className}`}
        {...props}
      >
        {children}
      </div>
    </div>
  );
};
