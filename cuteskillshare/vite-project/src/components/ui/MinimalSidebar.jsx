import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import { cn } from '../../utils/cn';
import NewExchangeModal from '../NewExchangeModal';

const menuItems = [
  { icon: 'LayoutGrid', label: 'Dashboard', href: '/' },
  { icon: 'Plus', label: 'New Exchange', href: null, isModal: true },
  { icon: 'Sparkles', label: 'Smart Matches', href: '/matches' },
  { icon: 'Bot', label: 'AI Assistant', href: '/assistant' },
  { icon: 'ArrowLeftRight', label: 'My Swaps', href: '/swaps' },
  { icon: 'Users', label: 'Groups', href: '/groups' },
  { icon: 'Store', label: 'Marketplace', href: '/marketplace' },
  { icon: 'Wallet', label: 'Wallet', href: '/wallet' },
];

const bottomItems = [
  { icon: 'Settings', label: 'Settings', href: '/settings' },
  { icon: 'LogOut', label: 'Logout', href: '/logout' },
];

const MinimalSidebar = ({ onCollapseChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    if (onCollapseChange) onCollapseChange(next);
  };

  const isActive = (href) => location.pathname === href;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 w-12 h-12 bg-card rounded-2xl shadow-warm-md flex items-center justify-center hover-lift press-scale focus-ring-lavender"
        aria-label="Toggle sidebar"
      >
        <Icon name={isOpen ? 'X' : 'Menu'} size={24} color="var(--color-foreground)" />
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen bg-card border-r border-border p-5 overflow-y-auto flex flex-col z-[90] transition-all duration-300",
          isCollapsed ? "w-20" : "w-64",
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo & Toggle */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className={cn("flex items-center gap-2.5 group", isCollapsed && "mx-auto")}>
            <div className="w-9 h-9 rounded-2xl bg-primary flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
              <Icon name="Sprout" size={20} color="var(--color-primary-foreground)" />
            </div>
            {!isCollapsed && <span className="text-lg font-bold text-foreground">SkillGarden</span>}
          </Link>
          <button
            onClick={(e) => { e.preventDefault(); toggleCollapse(); }}
            className="flex w-8 h-8 items-center justify-center rounded-lg hover:bg-muted transition-colors border border-border"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Icon name={isCollapsed ? 'ChevronsRight' : 'ChevronsLeft'} size={18} color="var(--color-muted-foreground)" />
          </button>
        </div>

        {/* Main Nav */}
        <div className="flex-1 space-y-1">
          {!isCollapsed && (
            <p className="text-[10px] font-semibold text-muted-foreground mb-3 uppercase tracking-widest px-4">
              Menu
            </p>
          )}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const active = !item.isModal && isActive(item.href);
              const sharedClasses = cn(
                "flex items-center gap-3 py-2.5 rounded-full text-sm font-medium transition-all duration-300 w-full",
                isCollapsed ? "px-3 justify-center" : "px-4",
                active
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                hoveredItem === item.label && !active && !isCollapsed && "translate-x-1"
              );

              if (item.isModal) {
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setExchangeModalOpen(true)}
                    onMouseEnter={() => setHoveredItem(item.label)}
                    onMouseLeave={() => setHoveredItem(null)}
                    title={isCollapsed ? item.label : undefined}
                    className={sharedClasses}
                  >
                    <Icon name={item.icon} size={18} color="currentColor" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </button>
                );
              }

              return (
                <Link
                  key={item.label}
                  to={item.href}
                  onMouseEnter={() => setHoveredItem(item.label)}
                  onMouseLeave={() => setHoveredItem(null)}
                  title={isCollapsed ? item.label : undefined}
                  className={sharedClasses}
                >
                  <Icon 
                    name={item.icon} 
                    size={18} 
                    color={active ? 'var(--color-primary)' : 'currentColor'} 
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Nav */}
        <div className="pt-4 border-t border-border space-y-1">
          {bottomItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                to={item.href}
                onMouseEnter={() => setHoveredItem(item.label)}
                onMouseLeave={() => setHoveredItem(null)}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                  isCollapsed ? "px-3 justify-center" : "px-4",
                  active
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  hoveredItem === item.label && !active && !isCollapsed && "translate-x-1"
                )}
              >
                <Icon 
                  name={item.icon} 
                  size={18} 
                  color={active ? 'var(--color-primary)' : 'currentColor'} 
                />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-[85]"
          onClick={toggleSidebar}
        />
      )}

      {/* New Exchange Modal */}
      <NewExchangeModal
        isOpen={exchangeModalOpen}
        onClose={() => setExchangeModalOpen(false)}
      />
    </>
  );
};

export default MinimalSidebar;