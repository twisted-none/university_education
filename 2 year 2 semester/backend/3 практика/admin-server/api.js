const fs = require('fs');
const path = require('path');

// Путь к файлу с данными
const dataPath = path.join(__dirname, '..', 'client-server', 'data', 'products.json');

// Чтение данных из файла
function readData() {
  const rawData = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(rawData);
}

// Запись данных в файл
function writeData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
}

// Получение всех товаров
exports.getAllProducts = (req, res) => {
  try {
    const data = readData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при чтении данных' });
  }
};

// Получение товара по ID
exports.getProductById = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = readData();
    
    const product = data.products.find(p => p.id === id);
    
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при чтении данных' });
  }
};

// Добавление одного или нескольких товаров
exports.addProducts = (req, res) => {
  try {
    const data = readData();
    const newProducts = Array.isArray(req.body) ? req.body : [req.body];
    
    // Найдем максимальный ID в текущих товарах
    const maxId = data.products.reduce((max, product) => Math.max(max, product.id), 0);
    
    // Добавим новые товары с уникальными ID
    let nextId = maxId + 1;
    const productsToAdd = newProducts.map(product => {
      // Проверяем наличие обязательных полей
      if (!product.name || !product.price || !product.description || !product.categories) {
        throw new Error('Отсутствуют обязательные поля');
      }
      
      return {
        id: nextId++,
        name: product.name,
        price: parseFloat(product.price),
        description: product.description,
        categories: product.categories
      };
    });
    
    data.products = [...data.products, ...productsToAdd];
    writeData(data);
    
    res.status(201).json(productsToAdd);
  } catch (error) {
    res.status(400).json({ error: error.message || 'Ошибка при добавлении товаров' });
  }
};

// Обновление товара по ID
exports.updateProduct = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = readData();
    
    const productIndex = data.products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    
    // Обновляем данные товара
    data.products[productIndex] = {
      id,
      name: req.body.name || data.products[productIndex].name,
      price: req.body.price !== undefined ? parseFloat(req.body.price) : data.products[productIndex].price,
      description: req.body.description || data.products[productIndex].description,
      categories: req.body.categories || data.products[productIndex].categories
    };
    
    writeData(data);
    
    res.json(data.products[productIndex]);
  } catch (error) {
    res.status(400).json({ error: 'Ошибка при обновлении товара' });
  }
};

// Удаление товара по ID
exports.deleteProduct = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = readData();
    
    const productIndex = data.products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    
    // Удаляем товар из массива
    data.products.splice(productIndex, 1);
    writeData(data);
    
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении товара' });
  }
};

// Получение категорий
exports.getCategories = (req, res) => {
  try {
    const data = readData();
    res.json(data.categories);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при чтении данных' });
  }
};