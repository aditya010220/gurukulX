import React, { useState, useEffect, useRef } from 'react';
import Icon from '../AppIcon';
import Input from './Input';


const SoftNavbar = ({ user, skillCoins, onProfileClick }) => {
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const searchRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef?.current && !searchRef?.current?.contains(event?.target)) {
        setSearchExpanded(false);
      }
      if (profileRef?.current && !profileRef?.current?.contains(event?.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery?.length > 2) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        const mockResults = [
          { type: 'skill', title: 'React Development', subtitle: 'Web Development', skillLevel: 'Advanced' },
          { type: 'skill', title: 'UI/UX Design', subtitle: 'Design', skillLevel: 'Intermediate' },
          { type: 'user', title: 'Sarah Chen', subtitle: 'Full Stack Developer', avatar: '/assets/images/no_image.png' },
          { type: 'user', title: 'Michael Torres', subtitle: 'Product Designer', avatar: '/assets/images/no_image.png' },
        ]?.filter(item => 
          item?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
          item?.subtitle?.toLowerCase()?.includes(searchQuery?.toLowerCase())
        );
        setSearchResults(mockResults);
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleSearchFocus = () => {
    setSearchExpanded(true);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e?.target?.value);
  };

  const handleResultClick = (result) => {
    console.log('Selected:', result);
    setSearchExpanded(false);
    setSearchQuery('');
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
                <Icon name="Sprout" size={24} color="var(--color-primary-foreground)" />
              </div>
              <span className="font-heading font-semibold text-lg text-foreground hidden sm:block">
                SkillGarden
              </span>
            </div>

            <div className="flex items-center gap-4 flex-1 max-w-2xl mx-4" ref={searchRef}>
              <div className="relative w-full">
                <Input
                  type="search"
                  placeholder="Search skills or users..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  className="w-full"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Icon name="Search" size={20} color="var(--color-muted-foreground)" />
                </div>
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
      {searchExpanded && searchQuery?.length > 0 && (
        <div className="fixed inset-0 z-[200] pt-16">
          <div className="absolute inset-0 bg-background" onClick={() => setSearchExpanded(false)} />
          <div className="relative max-w-2xl mx-auto mt-2 px-4">
            <div className="bg-card rounded-2xl shadow-warm-xl overflow-hidden animate-slide-down">
              {isSearching ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin">
                    <Icon name="Loader2" size={32} color="var(--color-primary)" />
                  </div>
                  <p className="mt-4 text-muted-foreground">Searching...</p>
                </div>
              ) : searchResults?.length > 0 ? (
                <div className="max-h-[480px] overflow-y-auto scrollbar-warm">
                  {searchResults?.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => handleResultClick(result)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-muted transition-smooth text-left border-b border-border last:border-b-0"
                    >
                      {result?.type === 'user' ? (
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <Icon name="User" size={24} color="var(--color-primary-foreground)" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                          <Icon name="BookOpen" size={24} color="var(--color-secondary-foreground)" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{result?.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{result?.subtitle}</p>
                      </div>
                      {result?.skillLevel && (
                        <span className="px-3 py-1 bg-accent rounded-full text-xs font-medium text-accent-foreground flex-shrink-0">
                          {result?.skillLevel}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Icon name="Search" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
                  <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
                  <p className="text-sm text-muted-foreground mt-2">Try searching for skills or users</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SoftNavbar;