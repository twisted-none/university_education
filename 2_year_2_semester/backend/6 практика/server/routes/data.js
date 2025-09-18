const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const { getFromCache, saveToCache } = require('../utils/cache');

const router = express.Router();

// Функция генерации тестовых данных
function generateData() {
  return {
    timestamp: new Date().toISOString(),
    randomValue: Math.random(),
    items: Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      value: Math.floor(Math.random() * 100)
    }))
  };
}

// Получение данных с кэшированием (защищенный роут)
router.get('/data', isAuthenticated, async (req, res) => {
  try {
    // Пытаемся получить данные из кэша
    const cacheKey = 'app-data';
    const { data, isCached } = await getFromCache(cacheKey);
    
    // Если данные в кэше и они актуальны
    if (isCached && data) {
      return res.json({
        source: 'cache',
        data
      });
    }
    
    // Если кэш отсутствует или устарел, генерируем новые данные
    const newData = generateData();
    
    // Сохраняем в кэш
    await saveToCache(cacheKey, newData);
    
    res.json({
      source: 'generated',
      data: newData
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

module.exports = router;