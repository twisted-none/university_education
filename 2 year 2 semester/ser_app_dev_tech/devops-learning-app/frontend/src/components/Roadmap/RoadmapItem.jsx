// RoadmapItem.jsx
import React from 'react';

const RoadmapItem = ({ 
  node, 
  level = 0, 
  isExpanded, 
  isCompleted,
  onToggle, 
  onComplete,
  expandedNodes,
  completedNodes
}) => {
  const hasChildren = node.children && node.children.length > 0;
  
  // Стили в зависимости от уровня и состояния
  const levelColors = [
    'bg-purple-100 border-purple-300',  // Уровень 0
    'bg-purple-50 border-purple-200',   // Уровень 1
    'bg-white border-purple-100',       // Уровень 2
    'bg-gray-50 border-gray-200',       // Уровень 3+
  ];
  
  const backgroundColor = levelColors[Math.min(level, 3)];
  const marginLeft = level > 0 ? `${level * 1.5}rem` : '0';
  
  // Прямая обработка текущего узла
  const handleToggle = (e) => {
    e.stopPropagation();
    console.log(`Toggle clicked for node ID: ${node.id}`); 
    onToggle(node.id); // Передаем ID текущего узла
  };
  
  const handleComplete = (e) => {
    e.stopPropagation();
    const isChecked = e.target.checked;
    console.log(`Checkbox clicked for node ID: ${node.id}, value: ${isChecked}`); 
    onComplete(node.id, isChecked); // Передаем ID текущего узла и состояние
  };
  
  return (
    <div className="mb-2">
      <div 
        className={`rounded-lg border ${backgroundColor} p-3 transition-all duration-200 hover:shadow-md ${isCompleted ? 'border-green-500' : ''}`}
        style={{ marginLeft }}
        data-node-id={node.id}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-grow">
            {hasChildren && (
              <button 
                onClick={handleToggle}
                className="mr-2 text-purple-700 hover:text-purple-900 focus:outline-none"
                data-node-id={node.id}
              >
                {isExpanded ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                )}
              </button>
            )}
            
            <h3 className={`font-medium ${hasChildren ? 'text-purple-900' : 'text-purple-700'}`}>
              {node.title}
            </h3>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={handleComplete}
              className="h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
              data-node-id={node.id}
            />
          </div>
        </div>
        
        {node.description && (
          <p className="mt-1 text-sm text-gray-600">{node.description}</p>
        )}
        
        {node.metadata && node.metadata.resources && (
          <div className="mt-2">
            <p className="text-xs text-purple-600 font-medium">Ресурсы:</p>
            <ul className="mt-1 text-xs text-gray-600">
              {node.metadata.resources.map((resource, index) => (
                <li key={index} className="mb-1">
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:underline">
                    {resource.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {hasChildren && isExpanded && (
        <div className="ml-2 pl-2 border-l border-purple-200">
          {node.children.map(childNode => (
            <RoadmapItem
              key={childNode.id}
              node={childNode}
              level={level + 1}
              isExpanded={expandedNodes[childNode.id]}
              isCompleted={completedNodes[childNode.id]}
              onToggle={onToggle} // Напрямую передаем функцию без обертки
              onComplete={onComplete} // Напрямую передаем функцию без обертки
              expandedNodes={expandedNodes}
              completedNodes={completedNodes}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RoadmapItem;