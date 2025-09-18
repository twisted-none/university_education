const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');

const app = express();
const PORT = 8080;

// Подключение Swagger UI
const swaggerDocument = JSON.parse(fs.readFileSync(path.join(__dirname, 'swagger.json'), 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Импорт модуля API
const api = require('./api');

// API маршруты
app.get('/api/products', api.getAllProducts);
app.get('/api/products/:id', api.getProductById);
app.post('/api/products', api.addProducts);
app.put('/api/products/:id', api.updateProduct);
app.delete('/api/products/:id', api.deleteProduct);
app.get('/api/categories', api.getCategories);

// Обработка GET запроса к корневому URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Административный сервер запущен на порту ${PORT}`);
  console.log(`Откройте http://localhost:${PORT} в браузере`);
  console.log(`API документация доступна на http://localhost:${PORT}/api-docs`);
});