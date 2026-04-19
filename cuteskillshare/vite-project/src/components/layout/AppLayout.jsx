import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import SoftNavbar from '../ui/SoftNavbar';
import MinimalSidebar from '../ui/MinimalSidebar';

const AppLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  // Convex: sync user and get real data
  const getOrCreate = useMutation(api.users.getOrCreate);
  const convexUser = useQuery(api.users.getCurrent);
  const balance = useQuery(api.wallet.getBalance);

  // Sync Clerk user to Convex on mount/change
  useEffect(() => {
    if (user) {
      getOrCreate({
        name: user.fullName || user.firstName || 'Guest User',
        email: user.primaryEmailAddress?.emailAddress || '',
      }).catch(console.error);
    }
  }, [user?.id]);

  const userData = {
    name: convexUser?.name || user?.fullName || user?.firstName || 'Guest User',
    email: convexUser?.email || user?.primaryEmailAddress?.emailAddress || 'guest@skillgarden.com',
    skillCoins: balance ?? convexUser?.skillCoins ?? 0,
  };

  const handleProfileClick = async (action) => {
    if (action === 'logout') {
      await signOut();
      navigate('/auth');
    } else if (action === 'profile') {
      navigate('/profile');
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
