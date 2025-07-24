import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system';
    
    const saved = localStorage.getItem('theme') as Theme;
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      return saved;
    }
    return 'system';
  });

  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  // Функция для определения эффективной темы
  const getEffectiveTheme = (currentTheme: Theme): 'light' | 'dark' => {
    if (currentTheme === 'system') {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'light';
    }
    return currentTheme;
  };

  // Применение темы к DOM
  const applyTheme = (newTheme: 'light' | 'dark') => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const body = document.body;

    // Удаляем все классы тем
    root.classList.remove('light', 'dark');
    body.classList.remove('light', 'dark');

    // Добавляем новый класс темы
    root.classList.add(newTheme);
    body.classList.add(newTheme);

    setEffectiveTheme(newTheme);
  };

  // Обработчик системных изменений темы
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        const newEffectiveTheme = getEffectiveTheme('system');
        applyTheme(newEffectiveTheme);
      }
    };

    // Добавляем слушатель
    mediaQuery.addEventListener('change', handleChange);

    // Очистка
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Основной эффект для применения темы
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Сохраняем в localStorage
    localStorage.setItem('theme', theme);

    // Определяем и применяем эффективную тему
    const newEffectiveTheme = getEffectiveTheme(theme);
    applyTheme(newEffectiveTheme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      switch (prev) {
        case 'light':
          return 'dark';
        case 'dark':
          return 'system';
        case 'system':
          return 'light';
        default:
          return 'dark';
      }
    });
  };

  const value = {
    theme,
    effectiveTheme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};