'use client';

import React, { useState } from 'react';
import { LoginScreen } from '@/components/LoginScreen';
import { OwnerDashboard } from '@/components/OwnerDashboard';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { TablesTab } from '@/components/TablesTab';
import { MenuTab } from '@/components/MenuTab';
import { CheckoutsTab } from '@/components/CheckoutsTab';
import { ProfileTab } from '@/components/ProfileTab';
import { KitchenTab } from '@/components/KitchenTab';
import { TabName, UserRole } from '@/types';

const ServerApp: React.FC<{ userName: string; userId: number; userRole: UserRole; loginTime: Date; onLogout: () => void; isOwnerView?: boolean; onBackToDashboard?: () => void }> = ({ userName, userId, userRole, loginTime, onLogout, isOwnerView, onBackToDashboard }) => {
  const [activeTab, setActiveTab] = useState<TabName>(userRole === 'BILLING' ? TabName.CHECKOUTS : TabName.TABLES);

  const renderContent = () => {
    switch (activeTab) {
      case TabName.TABLES:
        return <TablesTab />;
      case TabName.MENU:
        return <MenuTab />;
      case TabName.KITCHEN:
        return <KitchenTab />;
      case TabName.CHECKOUTS:
        return <CheckoutsTab />;
      case TabName.PROFILE:
        return <ProfileTab userName={userName} userId={userId} loginTime={loginTime} onLogout={onLogout} userRole={isOwnerView ? 'OWNER' : userRole} />;
      default:
        return <TablesTab />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-light text-brown-dark font-sans">
      <Header userName={userName} isOwnerView={isOwnerView} onBackToDashboard={onBackToDashboard} />
      <main className="pt-16 animate-fade-in pb-20">
        {renderContent()}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} userRole={isOwnerView ? 'OWNER' : userRole} />
    </div>
  );
};

export const MainApp: React.FC = () => {
  const [user, setUser] = useState<{id: number, name: string, role: UserRole, loginTime: Date} | null>(null);

  const handleLogin = (id: number, name: string, role: UserRole) => {
    const loginTime = new Date();
    localStorage.setItem('loginTime', loginTime.toISOString());
    setUser({ id, name, role, loginTime });
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('loginTime');
  };

  const [ownerManagerView, setOwnerManagerView] = useState(false);

  return (
    <>
      {!user ? (
        <LoginScreen onLogin={handleLogin} />
      ) : user.role === 'OWNER' ? (
        ownerManagerView ? (
          <ServerApp 
            userName={user.name} 
            userId={user.id}
            userRole={user.role}
            loginTime={user.loginTime} 
            onLogout={handleLogout} 
            isOwnerView={true}
            onBackToDashboard={() => setOwnerManagerView(false)}
          />
        ) : (
          <OwnerDashboard 
            userName={user.name} 
            userId={user.id}
            onLogout={handleLogout} 
            onSwitchToManagerView={() => setOwnerManagerView(true)}
          />
        )
      ) : (
        <ServerApp userName={user.name} userId={user.id} userRole={user.role} loginTime={user.loginTime} onLogout={handleLogout} />
      )}
    </>
  );
};
