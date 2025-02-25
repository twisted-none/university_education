const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Обслуживание статических файлов из папки public
app.use(express.static(path.join(__dirname, 'public')));

// API для получения всех товаров
app.get('/api/products', (req, res) => {
  const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'products.json'), 'utf8'));
  res.json(productsData);
});

// API для получения товаров по категории
app.get('/api/products/category/:categoryId', (req, res) => {
  const categoryId = req.params.categoryId;
  const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'products.json'), 'utf8'));
  
  const filteredProducts = productsData.products.filter(product => 
    product.categories.includes(categoryId)
  );
  
  res.json({
    products: filteredProducts,
    categories: productsData.categories
  });
});

// Обработка GET запроса к корневому URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Клиентский сервер запущен на порту ${PORT}`);
  console.log(`Откройте http://localhost:${PORT} в браузере`);
});