const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const router = express.Router();

// Временное хранение пользователей в памяти
const users = [];

// Регистрация
router.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Проверка существования пользователя
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Пользователь уже существует' });
  }

  // Добавление пользователя
  users.push({ username, password });

  res.status(201).json({ message: 'Регистрация успешна' });
});

// Вход
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Проверка credentials
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(400).json({ error: 'Неверные учетные данные' });
  }

  // Генерация JWT токена
  const token = jwt.sign(
    { username: user.username }, 
    config.JWT_SECRET, 
    { expiresIn: config.JWT_EXPIRATION }
  );

  res.json({ token });
});

module.exports = router;