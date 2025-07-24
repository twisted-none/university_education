// frontend/src/components/common/Header.tsx

import React, { useState } from 'react';
import { User, Sun, Moon, Monitor, LogOut, Settings } from 'lucide-react'; // ИЗМЕНЕНО: 'Menu' удалено
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext'; // <-- используем абсолютный путь

const Header: React.FC = () => {
  const { theme, effectiveTheme, setTheme } = useTheme(); // ИЗМЕНЕНО: 'toggleTheme' удалено
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return Sun;
      case 'dark':
        return Moon;
      case 'system':
        return Monitor;
      default:
        return Moon;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
      default:
        return 'Dark';
    }
  };

  const ThemeIcon = getThemeIcon();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 transition-all duration-300">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-500 rounded-lg flex items-center justify-center animate-pulse-neon">
                <span className="text-white font-bold text-sm">FC</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Football Championship
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Расширенный переключатель темы */}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 overflow-hidden group"
                aria-label={`Current theme: ${getThemeLabel()}`}
              >
                <div className="relative z-10 flex items-center space-x-2">
                  <ThemeIcon className={`w-5 h-5 transition-all duration-300 group-hover:rotate-12 ${
                    theme === 'light' ? 'text-yellow-500' : 
                    theme === 'dark' ? 'text-blue-400' : 
                    'text-gray-700 dark:text-gray-300'
                  }`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block">
                    {getThemeLabel()}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              {/* Выпадающее меню темы */}
              {showThemeMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <button
                    onClick={() => {
                      setTheme('light');
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      theme === 'light' 
                        ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span>Light</span>
                    {theme === 'light' && <div className="ml-auto w-2 h-2 bg-yellow-500 rounded-full"></div>}
                  </button>
                  
                  <button
                    onClick={() => {
                      setTheme('dark');
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      theme === 'dark' 
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span>Dark</span>
                    {theme === 'dark' && <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>}
                  </button>
                  
                  <button
                    onClick={() => {
                      setTheme('system');
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      theme === 'system' 
                        ? 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                    <span>System</span>
                    {theme === 'system' && <div className="ml-auto w-2 h-2 bg-gray-500 rounded-full"></div>}
                  </button>
                </div>
              )}

              {/* Индикатор активной темы */}
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse ${
                effectiveTheme === 'dark' ? 'bg-gradient-to-r from-blue-400 to-purple-500' : 'bg-gradient-to-r from-yellow-400 to-orange-500'
              }`}></div>
            </div>

            {/* Пользовательское меню */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 border-l border-gray-200 dark:border-gray-700 pl-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl p-2 transition-all duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center animate-pulse-neon">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.username}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user?.role}
                  </p>
                </div>
              </button>

              {/* Выпадающее меню пользователя */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                  
                  <button 
                    onClick={() => {
                      navigate('/settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  
                  <hr className="my-2 border-gray-200 dark:border-gray-700" />
                  
                  <button
                    onClick={logout}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Глобальный обработчик клика для закрытия меню */}
        {(showUserMenu || showThemeMenu) && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setShowUserMenu(false);
              setShowThemeMenu(false);
            }}
          />
        )}
      </header>

      {/* Спейсер для фиксированного хедера */}
      <div className="h-16"></div>
    </>
  );
};

export default Header;