import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Input from './Input';


const SoftNavbar = ({ user, skillCoins, onProfileClick }) => {
  const [searchQuery, setSearchQuery] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  });
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  const normalizedSearchQuery = searchQuery.trim();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef?.current && !profileRef?.current?.contains(event?.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e?.target?.value);
  };

  const handleSearchSubmit = () => {
    if (normalizedSearchQuery.length < 2) return;
    navigate(`/search?q=${encodeURIComponent(normalizedSearchQuery)}`);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  const handleProfileMenuToggle = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleProfileAction = (action) => {
    console.log('Profile action:', action);
    setShowProfileMenu(false);
    if (onProfileClick) {
      onProfileClick(action);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-card shadow-warm transition-smooth">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="navbar-header">
              <div className="navbar-logo">
                <img src="/logo.png" alt="SkillGarden logo" className="w-10 h-10" />
              </div>
              <span className="font-heading font-semibold text-lg text-foreground hidden sm:block">
                SkillGarden
              </span>
            </div>

            <div className="flex items-center gap-4 flex-1 max-w-2xl mx-4">
              <div className="relative w-full">
                <Input
                  type="search"
                  placeholder="Search skills or users..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full navbar-search-input"
                />
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  aria-label="Search"
                >
                  <Icon name="Search" size={20} color="var(--color-muted-foreground)" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-secondary rounded-full cursor-pointer hover-lift press-scale">
                <Icon name="Coins" size={20} color="var(--color-secondary-foreground)" />
                <span className="font-mono font-medium text-secondary-foreground data-text">
                  {skillCoins || 0}
                </span>
              </div>

              <div className="relative" ref={profileRef}>
                <button
                  onClick={handleProfileMenuToggle}
                  className="flex items-center gap-2 p-1 rounded-full hover-lift press-scale focus-ring-lavender"
                  aria-label="User menu"
                >
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <Icon name="User" size={20} color="var(--color-primary-foreground)" />
                  </div>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-card rounded-2xl shadow-warm-lg animate-slide-down overflow-hidden">
                    <div className="p-4 border-b border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                          <Icon name="User" size={24} color="var(--color-primary-foreground)" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user?.name || 'Guest User'}</p>
                          <p className="text-sm text-muted-foreground">{user?.email || 'guest@skillgarden.com'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={() => handleProfileAction('profile')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-smooth text-left"
                      >
                        <Icon name="User" size={20} color="var(--color-foreground)" />
                        <span className="text-foreground">View Profile</span>
                      </button>
                      <button
                        onClick={() => handleProfileAction('settings')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-smooth text-left"
                      >
                        <Icon name="Settings" size={20} color="var(--color-foreground)" />
                        <span className="text-foreground">Settings</span>
                      </button>
                      <button
                        onClick={() => handleProfileAction('help')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-smooth text-left"
                      >
                        <Icon name="HelpCircle" size={20} color="var(--color-foreground)" />
                        <span className="text-foreground">Help & Support</span>
                      </button>
                    </div>

                    <div className="p-2 border-t border-border">
                      <button
                        onClick={() => handleProfileAction('logout')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-error/10 transition-smooth text-left"
                      >
                        <Icon name="LogOut" size={20} color="var(--color-error-foreground)" />
                        <span className="text-error-foreground">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default SoftNavbar;