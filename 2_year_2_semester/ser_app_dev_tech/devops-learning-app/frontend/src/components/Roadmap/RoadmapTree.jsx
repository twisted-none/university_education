import React, { useState, useEffect } from 'react';
import RoadmapItem from './RoadmapItem';
import ProgressTracker from './ProgressTracker';
import api from '../../services/api';

const RoadmapTree = () => {
  const [roadmapData, setRoadmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedNodes, setCompletedNodes] = useState({});
  const [expandedNodes, setExpandedNodes] = useState({});

  useEffect(() => {
    fetchRoadmapTreeWithProgress();
  }, []);

  const fetchRoadmapTreeWithProgress = async () => {
    try {
      setLoading(true);
      const response = await api.get('/roadmap');
      setRoadmapData(response.data);
      
      // Инициализируем состояние завершенных узлов
      const completedMap = {};
      const expandedMap = {};
      
      // Рекурсивная функция для обработки узлов
      const processNode = (node) => {
        completedMap[node.id] = node.progress?.is_completed || false;
        expandedMap[node.id] = true; // По умолчанию все узлы развернуты
        if (node.children && node.children.length > 0) {
          node.children.forEach(processNode);
        }
      };
      
      response.data.forEach(processNode);
      
      setCompletedNodes(completedMap);
      setExpandedNodes(expandedMap);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching roadmap:', err);
      setError('Не удалось загрузить дорожную карту. Пожалуйста, попробуйте позже.');
      setLoading(false);
    }
  };

  const handleNodeToggle = (nodeId) => {
    console.log(`Toggle event for node ID: ${nodeId}`);
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const handleNodeComplete = async (nodeId, isCompleted) => {
    try {
      console.log(`Complete event for node ID: ${nodeId}, value: ${isCompleted}`);
      
      // Убедимся, что nodeId - это число
      const numericNodeId = typeof nodeId === 'string' ? parseInt(nodeId, 10) : nodeId;
      
      const payload = {
        node_id: numericNodeId,
        is_completed: Boolean(isCompleted)
      };
      
      console.log('Отправляю данные НОВЫЕ:', payload);
      
      const response = await api.post('/roadmap/progress', payload);
      console.log('Ответ сервера НОВЫЙ:', response.data);
      
      setCompletedNodes(prev => ({
        ...prev,
        [nodeId]: isCompleted
      }));
    } catch (err) {
      console.error('Ошибка обновления прогресса:', err);
      
      if (err.response) {
        console.error('Данные ответа:', err.response.data);
        console.error('Статус:', err.response.status);
        console.error('Заголовки:', err.response.headers);
      }
      
      alert('Не удалось обновить статус. Пожалуйста, попробуйте позже.');
    }
  };

  const calculateProgress = (nodes) => {
    let total = 0;
    let completed = 0;
    
    // Рекурсивная функция для подсчета узлов
    const countNodes = (nodeList) => {
      nodeList.forEach(node => {
        total++;
        if (completedNodes[node.id]) {
          completed++;
        }
        if (node.children && node.children.length > 0) {
          countNodes(node.children);
        }
      });
    };
    
    countNodes(nodes);
    
    return {
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  const progress = calculateProgress(roadmapData);

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
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold text-purple-800 mb-4">DevOps Roadmap</h1>
      
      <ProgressTracker 
        completed={progress.completed} 
        total={progress.total} 
        percentage={progress.percentage} 
      />
      
      <div className="mt-6">
        {roadmapData.map(node => (
          <RoadmapItem
            key={node.id}
            node={node}
            level={0}
            isExpanded={expandedNodes[node.id]}
            isCompleted={completedNodes[node.id]}
            onToggle={handleNodeToggle} // Передаем саму функцию
            onComplete={handleNodeComplete} // Передаем саму функцию
            expandedNodes={expandedNodes}
            completedNodes={completedNodes}
          />
        ))}
      </div>
    </div>
  );
};

export default RoadmapTree;