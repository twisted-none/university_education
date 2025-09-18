import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle, 
  className = '', 
  headerClassName = '', 
  bodyClassName = '',
  footer,
  footerClassName = '',
  ...props 
}) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`} 
      {...props}
    >
      {(title || subtitle) && (
        <div className={`px-4 py-3 bg-purple-50 border-b border-gray-200 ${headerClassName}`}>
          {title && <h3 className="text-lg font-medium text-purple-900">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
        </div>
      )}
      <div className={`p-4 ${bodyClassName}`}>
        {children}
      </div>
      {footer && (
        <div className={`px-4 py-3 bg-gray-50 border-t border-gray-200 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;