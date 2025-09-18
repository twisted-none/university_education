  // Функция для вычисления процента выполнения
  export const calculatePercentage = (completed, total) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };
  
  // Функция для получения цвета в зависимости от прогресса
  export const getProgressColor = (percentage) => {
    if (percentage < 25) return 'bg-red-500';
    if (percentage < 50) return 'bg-yellow-500';
    if (percentage < 75) return 'bg-blue-500';
    return 'bg-green-500';
  };
  
  // Подсветка синтаксиса для различных форматов конфигурационных файлов

/**
 * Определяет язык подсветки синтаксиса на основе типа файла
 * @param {string} fileType - расширение или тип файла
 * @returns {string} - язык для подсветки синтаксиса
 */
export const getLanguageFromFileType = (fileType) => {
    // Преобразуем к нижнему регистру для правильного сравнения
    const type = fileType.toLowerCase();
    
    // Маппинг типов файлов на языки для подсветки синтаксиса
    const languageMap = {
      'yml': 'yaml',
      'yaml': 'yaml',
      'json': 'json',
      'js': 'javascript',
      'jsx': 'jsx',
      'ts': 'typescript',
      'tsx': 'tsx',
      'py': 'python',
      'sh': 'bash',
      'bash': 'bash',
      'ini': 'ini',
      'conf': 'nginx',
      'nginx': 'nginx',
      'dockerfile': 'dockerfile',
      'toml': 'toml',
      'xml': 'xml',
      'sql': 'sql',
      'hcl': 'hcl',
      'tf': 'hcl',
      'md': 'markdown',
      'css': 'css',
      'html': 'html',
      'Dockerfile': 'dockerfile',
      'docker-compose': 'yaml',
      'prometheus': 'yaml',
      'grafana': 'ini'
    };
    
    return languageMap[type] || 'plaintext';
  };
  
  /**
   * Форматирует дату в удобочитаемый формат
   * @param {string|Date} date - дата для форматирования
   * @returns {string} - отформатированная дата
   */
  export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  /**
   * Проверяет, является ли строка JSON
   * @param {string} str - строка для проверки
   * @returns {boolean} - результат проверки
   */
  export const isJsonString = (str) => {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  };