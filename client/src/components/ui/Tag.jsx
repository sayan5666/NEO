import React from 'react';

export const Tag = ({
  children,
  variant = 'default', // 'default' | 'yellow' | 'purple' | 'red' | 'dark'
  className = '',
}) => {
  let colorStyles = 'bg-surface-variant text-on-surface';
  if (variant === 'yellow') colorStyles = 'bg-primary-container text-on-surface';
  if (variant === 'purple') colorStyles = 'bg-tertiary-container text-on-tertiary-container';
  if (variant === 'red') colorStyles = 'bg-secondary-fixed text-on-secondary-container';
  if (variant === 'dark') colorStyles = 'bg-on-surface text-surface-container-lowest';

  return (
    <span
      className={`border-[2px] border-[#1b1b1b] px-2 py-0.5 font-label-sm text-xs font-mono uppercase tracking-wider ${colorStyles} ${className}`}
    >
      {children}
    </span>
  );
};
