// frontend/src/App.js (Обновленный)

import React, { useState, useContext, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './components/LoginForm'; 
import RegisterPage from './components/RegisterPage'; 
import DefectsPage from './components/DefectsPage';
import './App.css'; 

// --- 1. Создание Auth Context ---
const AuthContext = createContext(null);

// Хук для удобного использования контекста
export const useAuth = () => {
  return useContext(AuthContext);
};

// --- 2. Компонент-провайдер ---
export const AuthProvider = ({ children }) => {
  // Получаем токен и роль из localStorage при старте
  const [userToken, setUserToken] = useState(localStorage.getItem('userToken'));
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));
  
  // !!! ИСПРАВЛЕНИЕ: Хранение и загрузка полного объекта user
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Обновлена функция login для приема user ID и username
  const login = (token, role, userId, username) => {
    localStorage.setItem('userToken', token);
    localStorage.setItem('userRole', role);
    
    // Создаем объект пользователя и сохраняем его
    const newUser = { id: userId, username: username, role: role }; 
    localStorage.setItem('user', JSON.stringify(newUser));
    
    setUserToken(token);
    setUserRole(role);
    setUser(newUser); // Устанавливаем полный объект пользователя
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user'); // Удаляем объект пользователя
    setUserToken(null);
    setUserRole(null);
    setUser(null); // Сбрасываем объект пользователя
  };

  const value = {
    userToken,
    userRole,
    user, // <-- ВАЖНО: Добавляем user в контекст
    isAuthenticated: !!userToken,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- 3. Компонент для защиты маршрутов ---
const RequireAuth = ({ children }) => {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// --- 4. Основной компонент App ---
function App() {
  return (
    <Router>
      <AuthProvider> {/* Оборачиваем все в провайдер */}
        <div className="App">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            {/* Защищаем страницу дефектов */}
            <Route path="/defects" element={
              <RequireAuth>
                <DefectsPage />
              </RequireAuth>
            } />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;