import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  List as ListIcon,
  Camera,
  Users,
  BarChart3
} from 'lucide-react';

const BottomNavigation = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();

  const tabs = [
    { id: 'calendar', label: 'Calendar', Icon: CalendarIcon },
    { id: 'list', label: 'List', Icon: ListIcon },
    { id: 'camera', label: 'Camera', Icon: Camera },
    { id: 'contacts', label: 'Contacts', Icon: Users },
    { id: 'dashboard', label: 'Dashboard', Icon: BarChart3 }
  ];

  const handleTabChange = (tabId) => {
    onTabChange(tabId);
    navigate(`/${tabId}`);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/70 backdrop-blur-lg border-t border-slate-200/60 shadow-[0_-4px_20px_-2px_rgba(0,0,0,0.05)]">
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
                  transition-all duration-300 ease-out
                  ${isActive ? 'text-primary-600' : 'text-slate-500 hover:text-slate-700'}
                `}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
              >
                <div
                  className={`
                    p-2 rounded-full transition-transform duration-300
                    ${isActive ? 'scale-110 bg-primary-50' : 'scale-100'}
                  `}
                >
                  <Icon
                    size={24}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`
                      ${isActive ? 'text-primary-600' : 'text-slate-500'}
                    `}
                  />
                </div>
                <span className="text-xs font-medium mt-1">{label}</span>
                {isActive && (
                  <div className="absolute bottom-0 w-8 h-0.5 rounded-full bg-gradient-to-r from-primary-500 to-accent" />
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
