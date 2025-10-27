// frontend/src/components/RegisterPage.js (Обновлено)

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api'; 
import './AuthPages.css';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Инженер'); // <-- ДОБАВЛЕНО: Состояние для роли
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Пароли не совпадают.');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов.');
      return;
    }

    setLoading(true);

    try {
      // ИСПРАВЛЕНО: Передаем роль в createUser
      await api.createUser(username, password, role); 
      setSuccess('Регистрация успешна! Перенаправление на страницу входа...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Ошибка регистрации. Пожалуйста, попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  // ИСПРАВЛЕНИЕ СТИЛЕЙ: Прямой стиль для Select и Option для видимости текста
  const selectStyle = {
      backgroundColor: '#1E1E1E', 
      color: '#E0E0E0', 
      border: '1px solid #03DAC6', 
      padding: '10px',
      borderRadius: '4px',
      width: '100%',
  };
  
  // Для обеспечения черного текста на светлом фоне в выпадающем списке
  const optionStyle = {
      color: 'black', 
      backgroundColor: 'white', 
  };


  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="gradient-text">Создать Аккаунт</h1>
          <p className="auth-subtitle">Заполните детали ниже</p>
        </div>
        
        <form onSubmit={handleRegister} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="input-group">
            <label className="input-label">Имя пользователя</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="auth-input"
              placeholder="Введите имя пользователя"
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
              placeholder="Создайте пароль"
              required
            />
          </div>
          
          <div className="input-group">
            <label className="input-label">Подтвердите Пароль</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="auth-input"
              placeholder="Повторите пароль"
              required
            />
          </div>
          
          <div className="input-group">
            <label className="input-label">Роль</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="auth-input" 
              style={selectStyle} // Применяем стиль для Select
              required
            >
              {/* Применяем стиль для Option */}
              <option value="Инженер" style={optionStyle}>Инженер (Просмотр дефектов)</option>
              <option value="Менеджер" style={optionStyle}>Менеджер (Создание дефектов)</option>
              <option value="Руководитель" style={optionStyle}>Руководитель (Изменение дефектов)</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            className="auth-button primary"
            disabled={loading}
          >
            {loading ? 'Создание Аккаунта...' : 'Создать Аккаунт'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Уже есть аккаунт?{' '}
            <Link to="/login" className="auth-link">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;