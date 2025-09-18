const fs = require('fs/promises');
const path = require('path');

const CACHE_DIR = path.join(__dirname, '../cache');
const CACHE_TTL = 60 * 1000; // 1 минута

/**
 * Получить данные из кэша
 * @param {string} key - Ключ кэша
 * @returns {Promise<{data: any, isCached: boolean}>} - Данные и флаг, были ли они взяты из кэша
 */
async function getFromCache(key) {
  const cacheFile = path.join(CACHE_DIR, `${key}.json`);
  
  try {
    // Проверяем существование файла
    await fs.access(cacheFile);
    
    // Читаем содержимое кэша
    const fileContent = await fs.readFile(cacheFile, 'utf8');
    const cacheData = JSON.parse(fileContent);
    
    // Проверяем не истекло ли время жизни кэша
    if (Date.now() - cacheData.timestamp < CACHE_TTL) {
      return { data: cacheData.data, isCached: true };
    }
  } catch (error) {
    // Файл не существует или ошибка чтения/парсинга
    console.log(`Cache miss for key: ${key}`, error.code);
  }
  
  return { data: null, isCached: false };
}

/**
 * Сохранить данные в кэш
 * @param {string} key - Ключ кэша
 * @param {any} data - Данные для сохранения
 */
async function saveToCache(key, data) {
  const cacheFile = path.join(CACHE_DIR, `${key}.json`);
  
  const cacheData = {
    data,
    timestamp: Date.now()
  };
  
  try {
    await fs.writeFile(cacheFile, JSON.stringify(cacheData));
    console.log(`Cache saved for key: ${key}`);
  } catch (error) {
    console.error(`Error saving cache for key: ${key}`, error);
  }
}

module.exports = {
  getFromCache,
  saveToCache
};