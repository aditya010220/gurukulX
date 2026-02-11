import React, { useState } from 'react';
import Icon from '../AppIcon';


const MinimalSidebar = ({ activeContext, onActionClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const quickActions = [
    { action: 'new-exchange', label: 'New Exchange', icon: 'Plus', context: 'exchanges' },
    { action: 'find-match', label: 'Find Match', icon: 'Users', context: 'exchanges' },
    { action: 'browse-skills', label: 'Browse Skills', icon: 'BookOpen', context: 'marketplace' },
    { action: 'community-feed', label: 'Community', icon: 'MessageSquare', context: 'community' },
  ];

  const filters = [
    { id: 'all', label: 'All Exchanges', icon: 'LayoutGrid' },
    { id: 'active', label: 'Active', icon: 'Activity' },
    { id: 'pending', label: 'Pending', icon: 'Clock' },
    { id: 'completed', label: 'Completed', icon: 'CheckCircle' },
  ];

  const handleActionClick = (action) => {
    if (onActionClick) {
      onActionClick(action);
    }
  };

  const handleFilterClick = (filterId) => {
    setSelectedFilter(filterId);
    if (onActionClick) {
      onActionClick({ type: 'filter', value: filterId });
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 w-12 h-12 bg-card rounded-2xl shadow-warm-md flex items-center justify-center hover-lift press-scale focus-ring-lavender"
        aria-label="Toggle sidebar"
      >
        <Icon name={isOpen ? 'X' : 'Menu'} size={24} color="var(--color-foreground)" />
      </button>
      <aside
        className={`
          fixed lg:fixed top-0 left-0 h-full z-[90] bg-card shadow-warm-lg transition-smooth
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-64 lg:w-60
        `}
      >
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Icon name="Sprout" size={28} color="var(--color-primary-foreground)" />
          </div>
          <div className="hidden lg:block">
            <p className="font-heading font-semibold text-foreground">SkillGarden</p>
            <p className="text-xs text-muted-foreground caption">Your Learning Hub</p>
          </div>
        </div>

        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground caption mb-3 px-2">Quick Actions</h3>
            <div className="space-y-1">
              {quickActions?.map((action) => (
                <button
                  key={action?.action}
                  onClick={() => handleActionClick(action)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-smooth text-left
                    ${activeContext === action?.context 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted text-foreground'
                    }
                  `}
                >
                  <Icon 
                    name={action?.icon} 
                    size={20} 
                    color={activeContext === action?.context ? 'var(--color-primary-foreground)' : 'var(--color-foreground)'} 
                  />
                  <span className="font-medium">{action?.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground caption mb-3 px-2">Filter Exchanges</h3>
            <div className="space-y-1">
              {filters?.map((filter) => (
                <button
                  key={filter?.id}
                  onClick={() => handleFilterClick(filter?.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-smooth text-left
                    ${selectedFilter === filter?.id 
                      ? 'bg-secondary text-secondary-foreground' 
                      : 'hover:bg-muted text-foreground'
                    }
                  `}
                >
                  <Icon 
                    name={filter?.icon} 
                    size={20} 
                    color={selectedFilter === filter?.id ? 'var(--color-secondary-foreground)' : 'var(--color-foreground)'} 
                  />
                  <span className="font-medium">{filter?.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <button
              onClick={() => handleActionClick({ action: 'notifications', context: 'general' })}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-muted transition-smooth text-left"
            >
              <div className="relative">
                <Icon name="Bell" size={20} color="var(--color-foreground)" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full" />
              </div>
              <span className="font-medium text-foreground">Notifications</span>
              <span className="ml-auto px-2 py-0.5 bg-error rounded-full text-xs font-medium text-error-foreground">
                3
              </span>
            </button>

            <button
              onClick={() => handleActionClick({ action: 'help', context: 'general' })}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-muted transition-smooth text-left mt-1"
            >
              <Icon name="HelpCircle" size={20} color="var(--color-foreground)" />
              <span className="font-medium text-foreground">Help & Support</span>
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-2xl">
            <Icon name="Lightbulb" size={20} color="var(--color-warning-foreground)" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Learning Tip</p>
              <p className="text-xs text-muted-foreground caption truncate">
                Practice daily for best results
              </p>
            </div>
          </div>
        </div>
      </aside>
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background z-[85]"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default MinimalSidebar;