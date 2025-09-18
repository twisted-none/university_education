import React, { useState, useEffect } from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import ConfigViewer from './ConfigViewer';
import api from '../../services/api';

const ConfigList = () => {
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка шаблонов и категорий
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Изменено: используем правильный путь API без /categories
        // Получаем категории из данных о шаблонах
        const templatesResponse = await api.get('/configs', {
          params: selectedCategory ? { category: selectedCategory } : {}
        });
        setTemplates(templatesResponse.data);
        
        // Извлекаем уникальные категории из данных о шаблонах
        const uniqueCategories = [...new Set(templatesResponse.data.map(template => template.category))].filter(Boolean);
        setCategories(uniqueCategories);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching config templates:', err);
        setError('Не удалось загрузить конфигурации. Пожалуйста, попробуйте позже.');
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory]);

  // Обработчик выбора категории
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // Обработчик выбора конфигурации
  const handleConfigSelect = (config) => {
    setSelectedConfig(config);
  };

  // Обработчик закрытия просмотра конфигурации
  const handleCloseConfigView = () => {
    setSelectedConfig(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-purple-800 mb-4">Библиотека конфигураций</h1>
        
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "primary" : "secondary"}
              size="sm"
              onClick={() => handleCategoryChange(null)}
            >
              Все
            </Button>
            
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "primary" : "secondary"}
                size="sm"
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card
              key={template.id}
              title={template.name}
              subtitle={`${template.category || 'Общая категория'} - ${template.file_type.toUpperCase()}`}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleConfigSelect(template)}
            >
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">{template.description}</p>
              <div className="flex justify-end">
                <Button size="sm" onClick={() => handleConfigSelect(template)}>
                  Просмотреть
                </Button>
              </div>
            </Card>
          ))}
        </div>
        
        {templates.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-600">Шаблонов не найдено.</p>
          </div>
        )}
      </div>
      
      {selectedConfig && (
        <ConfigViewer
          config={selectedConfig}
          onClose={handleCloseConfigView}
        />
      )}
    </div>
  );
};

export default ConfigList;