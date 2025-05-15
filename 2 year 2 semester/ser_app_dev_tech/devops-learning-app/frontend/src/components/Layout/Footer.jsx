import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-purple-800 text-white py-4 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <p className="text-sm">© {currentYear} DevOps Learning. Все права защищены.</p>
          <div className="text-sm">
            <span>Версия 1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;