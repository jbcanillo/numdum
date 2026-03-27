import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  List as ListIcon,
  BarChart3,
  BookOpen
} from 'lucide-react';

const BottomNavigation = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();

  const tabs = [
    { id: 'calendar', label: 'Calendar', Icon: CalendarIcon },
    { id: 'list', label: 'List', Icon: ListIcon },
    { id: 'dashboard', label: 'Stats', Icon: BarChart3 }
  ];

  const handleTabChange = (tabId) => {
    onTabChange(tabId);
    navigate(`/${tabId}`);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-40 
                 bg-[var(--bg-elevated)]/80 backdrop-blur-xl 
                 border-t border-[var(--border)] 
                 shadow-[var(--shadow-md)] safe-area-inset-bottom"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-around h-16">
          {tabs.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                className={`
                  flex-1 flex flex-col items-center justify-center gap-1
                  transition-all duration-300 ease-out
                  relative focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                  focus-visible:ring-[var(--primary)]
                  ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-tertiary)]'}
                `}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Active indicator background */}
                <div
                  className={`
                    absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1
                    rounded-b-full transition-all duration-300
                    ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
                    bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]`
                  }
                />

                {/* Icon container */}
                <div
                  className={`
                    p-2 rounded-full transition-all duration-300
                    ${isActive 
                      ? 'bg-[var(--primary-light)] scale-110' 
                      : 'hover:bg-[var(--bg-tertiary)] scale-100'
                    }
                  `}
                >
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? 'text-[var(--primary)]' : 'text-[var(--text-tertiary)]'}
                  />
                </div>

                {/* Label */}
                <span 
                  className={`
                    text-xs font-medium transition-all duration-300
                    ${isActive ? 'font-semibold scale-105' : 'scale-100'}
                  `}
                  style={{ letterSpacing: '-0.01em' }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
