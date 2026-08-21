import React from 'react';

export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'dark' | 'ghost' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
  icon,
  onClick,
  type = 'button',
  disabled = false,
  ...props
}) => {
  let baseStyles = 'font-label-md font-bold uppercase transition-all duration-75 inline-flex items-center justify-center gap-2 cursor-pointer neo-border disabled:opacity-50 disabled:cursor-not-allowed';

  let variantStyles = '';
  switch (variant) {
    case 'primary':
      variantStyles = 'bg-primary-container text-on-surface neo-shadow neo-btn hover:bg-[#ffe173]';
      break;
    case 'secondary':
      variantStyles = 'bg-surface-container-lowest text-on-surface neo-shadow neo-btn hover:bg-surface-variant';
      break;
    case 'dark':
      variantStyles = 'bg-on-surface text-surface-container-lowest neo-shadow neo-btn hover:bg-[#303030]';
      break;
    case 'danger':
      variantStyles = 'bg-secondary text-white neo-shadow neo-btn hover:bg-[#8c1520]';
      break;
    case 'ghost':
      variantStyles = 'bg-transparent border-transparent hover:bg-surface-variant text-on-surface-variant hover:text-on-surface';
      break;
    default:
      variantStyles = 'bg-primary-container text-on-surface neo-shadow neo-btn';
  }

  let sizeStyles = '';
  switch (size) {
    case 'sm':
      sizeStyles = 'px-3 py-1.5 text-xs';
      break;
    case 'lg':
      sizeStyles = 'px-8 py-3 text-lg font-black';
      break;
    case 'md':
    default:
      sizeStyles = 'px-5 py-2.5 text-sm';
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {children}
      {icon && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
    </button>
  );
};
