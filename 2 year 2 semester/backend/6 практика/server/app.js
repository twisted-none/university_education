const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

// Создаем директорию для кэша, если не существует
const cacheDir = path.join(__dirname, 'cache');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

// Импортируем роуты
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');

const app = express();
const PORT = process.env.PORT || 3000;

// Промежуточное ПО для безопасности
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Настройка сессий
app.use(session({
  secret: 'secret-key-for-session', // В продакшене должен быть из переменных окружения
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production', // в продакшене только по HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 часа
  }
}));

// Статические файлы
app.use(express.static(path.join(__dirname, '../public')));

// Регистрация маршрутов
app.use('/', authRoutes);
app.use('/', dataRoutes);

// Обработка 404
app.use((req, res) => {
  res.status(404).send('Not Found');
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Internal Server Error');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;