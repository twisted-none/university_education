import React from 'react';

const ProgressTracker = ({ completed, total, percentage }) => {
  return (
    <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-purple-800">Ваш прогресс</h3>
        <span className="text-sm text-purple-700">{completed} из {total} пройдено</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-purple-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      <div className="mt-2 text-right">
        <span className="text-xs font-medium text-purple-700">{percentage}%</span>
      </div>
    </div>
  );
};

export default ProgressTracker;