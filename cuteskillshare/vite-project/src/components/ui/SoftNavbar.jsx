import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import Icon from '../AppIcon';
import Input from './Input';


const SoftNavbar = ({ user, skillCoins, onProfileClick }) => {
  const [searchQuery, setSearchQuery] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  });
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [respondedStatus, setRespondedStatus] = useState({});
  
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  const navigate = useNavigate();

  // Convex notifications queries & mutations
  const notifications = useQuery(api.notifications.list);
  const markRead = useMutation(api.notifications.markRead);
  const markAllRead = useMutation(api.notifications.markAllRead);
  const respondConnection = useMutation(api.connections.respondBySender);

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;
  const normalizedSearchQuery = searchQuery.trim();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef?.current && !profileRef?.current?.contains(event?.target)) {
        setShowProfileMenu(false);
      }
      if (notificationsRef?.current && !notificationsRef?.current?.contains(event?.target)) {
        setShowNotifications(false);
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

              {/* Real-time Notifications Bell */}
              <div className="relative flex items-center" ref={notificationsRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/80 transition-all duration-200"
                  aria-label="Notifications"
                >
                  <Icon name="Bell" size={22} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-error text-error-foreground rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card rounded-2xl shadow-warm-lg border border-border/80 animate-slide-down z-[100] max-h-[480px] flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-border flex items-center justify-between bg-card">
                      <h3 className="font-heading font-semibold text-foreground text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAllRead().catch(console.error);
                          }}
                          className="text-xs text-[#B794F4] hover:text-primary font-semibold transition-colors"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-border/60">
                      {notifications && notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            className={`p-4 transition-all duration-200 text-left ${
                              n.isRead ? 'bg-card' : 'bg-primary/5 hover:bg-primary/10'
                            }`}
                            onClick={() => {
                              if (!n.isRead) {
                                markRead({ notificationId: n._id }).catch(console.error);
                              }
                            }}
                          >
                            <div className="flex gap-3">
                              <img
                                src={n.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'}
                                alt={n.senderName}
                                className="w-9 h-9 rounded-full object-cover border border-border"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <p className="text-xs font-semibold text-foreground truncate">{n.title}</p>
                                  <span className="text-[9px] text-muted-foreground/60">
                                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed break-words">{n.message}</p>
                                
                                {/* Accept/Reject Buttons for Connection Request */}
                                {n.type === "Connection Request" && (
                                  <div className="mt-3">
                                    {respondedStatus[n._id] ? (
                                      <p className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 ${
                                        respondedStatus[n._id] === "accepted"
                                          ? "bg-success/15 text-success"
                                          : "bg-error/15 text-error"
                                      }`}>
                                        <Icon name={respondedStatus[n._id] === "accepted" ? "CheckCircle" : "XCircle"} size={14} />
                                        {respondedStatus[n._id] === "accepted" ? "Okay! Request is accepted" : "Okay! Request is rejected"}
                                      </p>
                                    ) : (
                                      <div className="flex gap-2">
                                        <button
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            try {
                                              await respondConnection({ senderId: n.senderId, accept: true });
                                              await markRead({ notificationId: n._id });
                                              setRespondedStatus(prev => ({ ...prev, [n._id]: "accepted" }));
                                            } catch (err) {
                                              console.error("Failed to accept:", err);
                                            }
                                          }}
                                          className="px-3 py-1 bg-success hover:bg-success/90 text-success-foreground rounded-lg text-[11px] font-semibold transition-colors"
                                        >
                                          Accept
                                        </button>
                                        <button
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            try {
                                              await respondConnection({ senderId: n.senderId, accept: false });
                                              await markRead({ notificationId: n._id });
                                              setRespondedStatus(prev => ({ ...prev, [n._id]: "rejected" }));
                                            } catch (err) {
                                              console.error("Failed to reject:", err);
                                            }
                                          }}
                                          className="px-3 py-1 bg-muted hover:bg-border/60 text-muted-foreground border border-border rounded-lg text-[11px] font-semibold transition-colors"
                                        >
                                          Reject
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-muted-foreground">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2 opacity-60">
                            <Icon name="Bell" size={20} />
                          </div>
                          <p className="text-sm font-medium">All caught up!</p>
                          <p className="text-xs opacity-75 mt-0.5">No notifications yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative" ref={profileRef}>
                <button
                  onClick={handleProfileMenuToggle}
                  className="flex items-center gap-2 p-1 rounded-full hover-lift press-scale focus-ring-lavender"
                  aria-label="User menu"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-border" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <Icon name="User" size={20} color="var(--color-primary-foreground)" />
                    </div>
                  )}
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-card rounded-2xl shadow-warm-lg animate-slide-down overflow-hidden border border-border">
                    <div className="p-4 border-b border-border">
                      <div className="flex items-center gap-3">
                        {user?.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover border border-border" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                            <Icon name="User" size={24} color="var(--color-primary-foreground)" />
                          </div>
                        )}
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
                        onClick={() => handleProfileAction('share')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-smooth text-left"
                      >
                        <Icon name="Share2" size={20} color="var(--color-foreground)" />
                        <span className="text-foreground">Share</span>
                      </button>
                      <button
                        onClick={() => handleProfileAction('courses')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-smooth text-left"
                      >
                        <Icon name="BookOpen" size={20} color="var(--color-foreground)" />
                        <span className="text-foreground">View Courses</span>
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