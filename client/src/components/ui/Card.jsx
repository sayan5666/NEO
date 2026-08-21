import React from 'react';

export const Card = ({
  children,
  className = '',
  shadow = true,
  bg = 'bg-surface-container-lowest',
  hover = false,
  onClick,
}) => {
  const shadowClass = shadow ? 'neo-shadow' : '';
  const hoverClass = hover ? 'hover:-translate-y-1 hover:translate-x-0.5 transition-transform cursor-pointer' : '';

  return (
    <div
      onClick={onClick}
      className={`neo-border ${bg} ${shadowClass} ${hoverClass} p-6 relative ${className}`}
    >
      {children}
    </div>
  );
};
