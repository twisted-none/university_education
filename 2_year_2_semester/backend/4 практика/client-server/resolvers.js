const fs = require('fs');
const path = require('path');

// Функция для чтения данных из файла
const readData = () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'data', 'products.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Ошибка при чтении данных:', error);
    return { products: [], categories: [] };
  }
};

// Резолверы для GraphQL запросов
const resolvers = {
  Query: {
    // Получить все товары
    products: () => {
      const data = readData();
      return data.products;
    },
    
    // Получить товар по ID
    product: (_, { id }) => {
      const data = readData();
      return data.products.find(p => p.id === parseInt(id));
    },
    
    // Получить товары по категории
    productsByCategory: (_, { categoryId }) => {
      const data = readData();
      return data.products.filter(product => 
        product.categories.includes(categoryId)
      );
    },
    
    // Получить все категории
    categories: () => {
      const data = readData();
      return data.categories;
    }
  }
};

module.exports = resolvers;