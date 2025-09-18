import React, { useState, useEffect } from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { getLanguageFromFileType } from '../../utils/helpers';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import api from '../../services/api';

const ConfigViewer = ({ config, onClose }) => {
  // Добавляем состояние для хранения содержимого конфигурации
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Загружаем соответствующий язык для подсветки синтаксиса
  const language = getLanguageFromFileType(config.file_type);
  
  // Загружаем содержимое конфигурации при открытии компонента
  useEffect(() => {
    const loadConfigContent = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/configs/${config.id}/content`);
        setContent(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading config content:', err);
        setError('Не удалось загрузить содержимое конфигурации');
        setIsLoading(false);
      }
    };
    
    loadConfigContent();
  }, [config.id]);
  
  // Функция для копирования содержимого в буфер обмена
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(content);
    alert('Конфигурация скопирована в буфер обмена');
  };
  
  if (isLoading) {
    return (
      <Card
        title={config.name}
        subtitle="Загрузка содержимого..."
        className="mt-4"
      >
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
        </div>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card
        title={config.name}
        subtitle="Ошибка"
        className="mt-4"
      >
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </Card>
    );
  }
  
  return (
    <Card
      title={config.name}
      subtitle={config.description}
      className="mt-4"
      bodyClassName="p-0" // Убираем стандартный padding тела карточки
      footer={
        <div className="flex justify-between">
          <Button variant="secondary" onClick={onClose}>
            Закрыть
          </Button>
          <Button onClick={handleCopyToClipboard}>
            Копировать
          </Button>
        </div>
      }
    >
      {/* Контейнер для содержимого конфигурации */}
      <div className="w-full">
        {/* Обертка для SyntaxHighlighter с контролем ширины и скроллинга */}
        <div className="w-full overflow-x-auto">
          <SyntaxHighlighter 
            language={language} 
            style={docco}
            customStyle={{
              margin: 0,
              borderRadius: 0,
              fontSize: '0.875rem',
              padding: '1rem',
              maxHeight: '400px',
              overflowY: 'auto',
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap'
            }}
            wrapLines={true}
            wrapLongLines={true}
          >
            {content}
          </SyntaxHighlighter>
        </div>
      </div>
      
      {/* Информация о файле */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span className="font-semibold">Тип файла:</span>
          <span>{config.file_type.toUpperCase()}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
          <span className="font-semibold">Категория:</span>
          <span>{config.category || 'Общая категория'}</span>
        </div>
      </div>
    </Card>
  );
};

export default ConfigViewer;