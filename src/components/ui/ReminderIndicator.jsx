import React from 'react';

const ReminderIndicator = ({ count }) => {
  return (
    <div className="flex items-center justify-center">
      <div className={`w-2 h-2 rounded-full ${
        count <= 3 ? 'bg-info' : 
        count <= 6 ? 'bg-success' : 
        count <= 9 ? 'bg-warning' : 
        'bg-error'
      }`} />
      {count > 1 && (
        <span className="text-xs text-base-content/60 ml-1">{count}</span>
      )}
    </div>
  );
};

export default ReminderIndicator;