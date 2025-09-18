// backend/routes/authRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');

const router = express.Router();

// Временное хранение пользователей в памяти
const users = [];

// Регистрация
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Проверка длины и сложности пароля
  if (password.length < 6) {
    return res.status(400).json({ error: 'Пароль должен содержать не менее 6 символов' });
  }

  // Проверка существования пользователя
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Пользователь уже существует' });
  }

  try {
    // Хэширование пароля
    const hashedPassword = await hashPassword(password);

    // Добавление пользователя
    users.push({ 
      username, 
      password: hashedPassword 
    });

    res.status(201).json({ message: 'Регистрация успешна' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
});

// Вход
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Проверка credentials
  const user = users.find(u => u.username === username);

  if (!user) {
    return res.status(400).json({ error: 'Неверные учетные данные' });
  }

  try {
    // Проверка пароля
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Неверные учетные данные' });
    }

    // Генерация JWT токена
    const token = jwt.sign(
      { username: user.username }, 
      config.JWT_SECRET, 
      { expiresIn: config.JWT_EXPIRATION }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при входе' });
  }
});

module.exports = router;