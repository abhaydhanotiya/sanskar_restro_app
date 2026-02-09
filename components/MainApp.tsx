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

const ServerApp: React.FC<{ userName: string; userId: number; shiftStartTime: Date; onLogout: () => void }> = ({ userName, userId, shiftStartTime, onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabName>(TabName.TABLES);

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
        return <ProfileTab userName={userName} userId={userId} shiftStartTime={shiftStartTime} onLogout={onLogout} />;
      default:
        return <TablesTab />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-light text-brown-dark font-sans">
      <Header userName={userName} />
      <main className="pt-16 animate-fade-in pb-20">
        {renderContent()}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export const MainApp: React.FC = () => {
  const [user, setUser] = useState<{id: number, name: string, role: UserRole, shiftStartTime: Date} | null>(null);

  const handleLogin = (id: number, name: string, role: UserRole) => {
    setUser({ id, name, role, shiftStartTime: new Date() });
  };

  const handleLogout = () => {
    setUser(null);
    // Clear auth token
    localStorage.removeItem('authToken');
    localStorage.removeItem('shiftStartTime');
  };

  return (
    <>
      {!user ? (
        <LoginScreen onLogin={handleLogin} />
      ) : user.role === 'OWNER' ? (
        <OwnerDashboard userName={user.name} onLogout={handleLogout} />
      ) : (
        <ServerApp userName={user.name} userId={user.id} shiftStartTime={user.shiftStartTime} onLogout={handleLogout} />
      )}
    </>
  );
};
