// backend/server.js
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const { authMiddleware } = require('./middleware/authMiddleware');
const config = require('./config/config');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Protected route example
app.get('/api/protected', authMiddleware, (req, res) => {
  // Декодируем токен для получения дополнительной информации
  const token = req.headers.authorization.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    res.json({ 
      message: 'Доступ к защищенному ресурсу разрешен', 
      user: {
        username: decoded.username,
        tokenExpiresAt: decoded.exp // Unix timestamp истечения токена
      },
      token: token // Возвращаем сам токен
    });
  } catch (error) {
    res.status(403).json({ error: 'Недействительный токен' });
  }
});

const PORT = config.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

module.exports = app;