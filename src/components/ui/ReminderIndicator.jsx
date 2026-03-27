import React from 'react';

const ReminderIndicator = ({ count }) => {
  const getColor = () => {
    if (count <= 3) return 'var(--primary)';
    if (count <= 6) return 'var(--success)';
    if (count <= 9) return 'var(--warning)';
    return 'var(--error)';
  };

  return (
    <div className="flex items-center justify-center gap-1 animate-fade-in">
      <div 
        className="w-2 h-2 rounded-full shadow-sm" 
        style={{ backgroundColor: getColor() }}
      />
      {count > 1 && (
        <span 
          className="text-[10px] font-bold"
          style={{ color: getColor() }}
        >
          {count}
        </span>
      )}
    </div>
  );
};

export default ReminderIndicator;