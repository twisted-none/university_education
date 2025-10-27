// frontend/src/components/LoginForm.js (Обновленный)

import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { api, API_URL } from '../api'; 
import { useAuth } from '../App'; // <--- Импортируем useAuth
import './AuthPages.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth(); // <--- Используем хук аутентификации

  const from = location.state?.from?.pathname || "/defects";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Используем реальный API вызов для логина
      const data = await api.login(username, password);
      
      // ИСПРАВЛЕНИЕ: Теперь передаем полный набор данных о пользователе в login
      // Предполагается, что data содержит access_token, role, user_id и username
      auth.login(data.access_token, data.role, data.user_id, data.username); 

      // Перенаправляем на предыдущий или основной роут
      navigate(from, { replace: true });

    } catch (err) {
      console.error(err);
      setError(err.message || 'Вход не удался. Проверьте учетные данные.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="gradient-text">С возвращением</h1>
          <p className="auth-subtitle">Войдите в свой аккаунт</p>
        </div>
        
        <form onSubmit={handleLogin} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="input-group">
            <label className="input-label">Имя пользователя</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="auth-input"
              placeholder="инженер_тест"
              required
            />
          </div>
          
          <div className="input-group">
            <label className="input-label">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              placeholder="password"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button primary"
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Нет аккаунта?{' '}
            <Link to="/register" className="auth-link">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;