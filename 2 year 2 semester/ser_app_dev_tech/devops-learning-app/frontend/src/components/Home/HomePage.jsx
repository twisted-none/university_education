import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../UI/Card';
import Button from '../UI/Button';
import api from '../../services/api';

const HomePage = () => {
  const [stats, setStats] = useState({
    roadmapProgress: 0,
    availableConfigs: 0
  });
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Получаем данные пользователя и статистику
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Пытаемся получить данные с сервера
        try {
          // Сначала пробуем основной путь
          let dashboardData;
          try {
            const response = await api.get('/users/dashboard');
            dashboardData = response.data;
          } catch (error) {
            if (error.response && error.response.status === 404) {
              throw error;
            }
          }
          
          setStats({
            roadmapProgress: dashboardData.roadmapProgress,
            availableConfigs: dashboardData.availableConfigs
          });
          setRecentActivities(dashboardData.recentActivities || []);
        } catch (apiError) {
          console.error('Error fetching data from API:', apiError);
          setError('Не удалось загрузить данные с сервера. Используем тестовые данные.');
          
          // Используем заглушечные данные для отладки
          setStats({
            roadmapProgress: 35,
            availableConfigs: 3
          });
          
          // Создаем тестовые данные для активностей
          setRecentActivities([
            {
              id: 1,
              title: "Просмотрел конфигурацию: Docker Compose (базовый)",
              type: "config",
              timestamp: new Date().toISOString()
            },
            {
              id: 2,
              title: "Завершил шаг: Основы Docker",
              type: "roadmap",
              timestamp: new Date(Date.now() - 86400000).toISOString() // Вчера
            }
          ]);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Произошла ошибка при загрузке данных');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Форматирование даты активности
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Возвращает иконку в зависимости от типа активности
  const getActivityIcon = (type) => {
    switch(type) {
      case 'roadmap':
        return (
          <div className="p-2 rounded-full bg-purple-100">
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        );
      case 'config':
        return (
          <div className="p-2 rounded-full bg-blue-100">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="p-2 rounded-full bg-gray-100">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold text-purple-900 mb-6">Главная страница</h1>
      
      {error && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <strong className="font-bold">Внимание!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      
      {/* Статистика - удалена карточка с задачами */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
          <div className="flex flex-col items-center py-4">
            <div className="text-3xl font-bold mb-1">{stats.roadmapProgress}%</div>
            <div className="text-sm">Прогресс по Roadmap</div>
            <div className="w-full bg-white bg-opacity-30 rounded-full h-2 mt-3">
              <div 
                className="bg-white rounded-full h-2" 
                style={{ width: `${stats.roadmapProgress}%` }}
              ></div>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-600 to-purple-800 text-white">
          <div className="flex flex-col items-center py-4">
            <div className="text-3xl font-bold mb-1">{stats.availableConfigs}</div>
            <div className="text-sm">Доступных конфигураций</div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3 border-white text-white hover:bg-purple-500"
            >
              <Link to="/configs">Открыть библиотеку</Link>
            </Button>
          </div>
        </Card>
      </div>
      
      {/* Быстрый доступ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Быстрый доступ - Improved for responsive design */}
          <Card title="Быстрый доступ">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/roadmap" className="block">
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 hover:bg-purple-100 transition-colors">
                  <div className="flex items-center text-purple-800">
                    <div className="flex-shrink-0 w-8 h-8 mr-2">
                      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <span className="font-medium block truncate">Roadmap</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Отслеживайте свой прогресс обучения</p>
                </div>
              </Link>
              
              <Link to="/configs" className="block">
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 hover:bg-purple-100 transition-colors">
                  <div className="flex items-center text-purple-800">
                    <div className="flex-shrink-0 w-8 h-8 mr-2">
                      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <span className="font-medium block truncate">Конфигурации</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Библиотека готовых конфигураций</p>
                </div>
              </Link>
            </div>
          </Card>
        
        <Card title="Полезные ресурсы">
          <ul className="space-y-3">
            <li>
              <a 
                href="https://roadmap.sh/devops" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-purple-700 hover:text-purple-900"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span>DevOps Roadmap 2023</span>
              </a>
            </li>
            <li>
              <a 
                href="https://kubernetes.io/docs/home/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-purple-700 hover:text-purple-900"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span>Документация Kubernetes</span>
              </a>
            </li>
            <li>
              <a 
                href="https://docs.docker.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-purple-700 hover:text-purple-900"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span>Документация Docker</span>
              </a>
            </li>
          </ul>
        </Card>
      </div>
      
      {/* Недавняя активность */}
      <Card title="Недавняя активность" className="mb-8">
        {recentActivities.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {recentActivities.map(activity => (
              <li key={activity.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start">
                  {getActivityIcon(activity.type)}
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center py-4">Нет недавней активности</p>
        )}
      </Card>
    </div>
  );
};

export default HomePage;