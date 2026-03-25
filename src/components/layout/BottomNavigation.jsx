import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  List as ListIcon,
  BarChart3
} from 'lucide-react';

const BottomNavigation = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();

  const tabs = [
    { id: 'calendar', label: 'Calendar', Icon: CalendarIcon },
    { id: 'list', label: 'List', Icon: ListIcon },
    { id: 'dashboard', label: 'Dashboard', Icon: BarChart3 }
  ];

  const handleTabChange = (tabId) => {
    onTabChange(tabId);
    navigate(`/${tabId}`);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-base-100/70 backdrop-blur-lg border-t border-base-200 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-around h-16">
          {tabs.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                className={`
                  flex-1 flex flex-col items-center justify-center
                  transition-all duration-300
                  ${isActive ? 'text-primary' : 'text-base-content/60 hover:text-base-content'}
                `}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
              >
                <div
                  className={`
                    p-2 rounded-full transition-transform duration-300
                    ${isActive ? 'scale-110 bg-primary/10' : 'scale-100'}
                  `}
                >
                  <Icon
                    size={24}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? 'text-primary' : 'text-base-content/60'}
                  />
                </div>
                <span className="text-xs font-medium mt-1">{label}</span>
                {isActive && (
                  <div className="absolute bottom-0 w-8 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
