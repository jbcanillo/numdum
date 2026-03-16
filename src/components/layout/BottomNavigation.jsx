import React from 'react';
import { useNavigate } from 'react-router-dom';

const BottomNavigation = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();

  const tabs = [
    { id: 'calendar', label: 'Calendar', icon: '⏰' },
    { id: 'list', label: 'List', icon: '📋' },
    { id: 'camera', label: 'Camera', icon: '📷' },
    { id: 'contacts', label: 'Contacts', icon: '👥' },
    { id: 'map', label: 'Map', icon: '🗺️' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊' }
  ];

  const handleTabChange = (tabId) => {
    onTabChange(tabId);
    navigate(`/${tabId}`);
  };

  return (
    <nav className="bg-white border-t shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-around h-16">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 bg-blue-50 rounded-t-lg'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-2xl">{tab.icon}</span>
              <span className="text-xs font-medium mt-1">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;