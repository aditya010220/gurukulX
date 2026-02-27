import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import SoftNavbar from '../ui/SoftNavbar';
import MinimalSidebar from '../ui/MinimalSidebar';

const AppLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const userData = {
    name: user?.fullName || user?.firstName || 'Guest User',
    email: user?.primaryEmailAddress?.emailAddress || 'guest@skillgarden.com',
    skillCoins: 1250,
  };

  const handleProfileClick = async (action) => {
    if (action === 'logout') {
      await signOut();
      navigate('/auth');
    } else if (action === 'profile') {
      navigate('/');
    } else if (action === 'settings') {
      navigate('/settings');
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SoftNavbar
        user={userData}
        skillCoins={userData.skillCoins}
        onProfileClick={handleProfileClick}
      />
      <MinimalSidebar
        onCollapseChange={(collapsed) => setSidebarCollapsed(collapsed)}
      />
      <main
        className={`${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'} pt-16 min-h-screen transition-all duration-300 overflow-x-hidden`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
