import React from 'react';
import { Link } from 'react-router-dom';
import { closeTelegramWebApp } from '../../services/telegram';
import Button from '../UI/Button';

const Header = ({ user, toggleMobileMenu }) => {
  const handleBack = () => {
    // Закрываем WebApp и возвращаемся в Telegram
    closeTelegramWebApp();
  };

  return (
    <header className="bg-purple-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {/* Кнопка мобильного меню */}
            <button 
              className="mr-2 md:hidden text-white focus:outline-none" 
              onClick={toggleMobileMenu}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* Изменено: добавлена иконка дома вместо колокола */}
            <Link to="/home" className="text-white hover:text-purple-100 mr-2">
              <div className="relative">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
            </Link>
            
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl hidden sm:inline">DevOps Learning</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <span className="text-sm hidden sm:inline">{user.username || 'Пользователь'}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-white text-white hover:bg-purple-600"
                  onClick={handleBack}
                >
                  <span className="hidden sm:inline">Назад в Telegram</span>
                  <span className="sm:hidden">Назад</span>
                </Button>
              </div>
            ) : (
              <span className="text-sm">Не авторизован</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;