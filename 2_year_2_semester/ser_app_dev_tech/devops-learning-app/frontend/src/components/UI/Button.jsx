import React from 'react';

const Button = ({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false, 
  onClick, 
  ...props 
}) => {
  // Классы для вариантов кнопок
  const variants = {
    primary: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-purple-500',
    outline: 'bg-transparent text-purple-600 border border-purple-600 hover:bg-purple-50 focus:ring-purple-500',
    text: 'bg-transparent text-purple-600 hover:text-purple-700 hover:underline focus:ring-purple-500',
  };
  
  // Классы для размеров кнопок
  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs rounded',
    md: 'px-4 py-2 text-sm rounded-md',
    lg: 'px-6 py-3 text-base rounded-md',
  };
  
  return (
    <button
      type={type}
      className={`
        inline-flex items-center justify-center 
        font-medium focus:outline-none focus:ring-2 focus:ring-offset-2
        ${variants[variant]} ${sizes[size]} 
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        ${className}
      `}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;