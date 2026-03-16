import React from 'react';

const ReminderIndicator = ({ count }) => {
  return (
    <div className="flex items-center justify-center">
      <div className={`w-2 h-2 rounded-full ${
        count <= 3 ? 'bg-blue-500' : 
        count <= 6 ? 'bg-green-500' : 
        count <= 9 ? 'bg-yellow-500' : 
        'bg-red-500'
      }`} />
      {count > 1 && (
        <span className="text-xs text-gray-600 ml-1">{count}</span>
      )}
    </div>
  );
};

export default ReminderIndicator;