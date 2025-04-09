const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// Хранилище пользователей (в реальном приложении - база данных)
const users = {};

// Домашняя страница - форма входа/регистрации
router.get('/', (req, res) => {
  // Если пользователь уже вошел, перенаправляем на профиль
  if (req.session && req.session.userId) {
    return res.redirect('/profile');
  }
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Страница профиля (защищена)
router.get('/profile', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/profile.html'));
});

// Роут для регистрации
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Проверяем данные
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    
    // Проверяем, не занято ли имя пользователя
    if (users[username]) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    
    // Хэшируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Создаем пользователя
    const userId = uuidv4();
    users[username] = {
      id: userId,
      username,
      password: hashedPassword
    };
    
    // Устанавливаем сессию
    req.session.userId = userId;
    req.session.username = username;
    
    res.status(201).json({ 
      message: 'Registration successful',
      user: { 
        id: userId, 
        username 
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Роут для входа
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Проверяем данные
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Проверяем, существует ли пользователь
    const user = users[username];
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Проверяем пароль
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Устанавливаем сессию
    req.session.userId = user.id;
    req.session.username = username;
    
    res.json({ 
      message: 'Login successful',
      user: { 
        id: user.id, 
        username 
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Роут для выхода
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout successful' });
  });
});

// Получение информации о текущем пользователе
router.get('/user', isAuthenticated, (req, res) => {
  res.json({
    id: req.session.userId,
    username: req.session.username
  });
});

module.exports = router;