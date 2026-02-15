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
import { RoomsTab } from '@/components/RoomsTab';
import { TabName, UserRole, TableStatus, Table } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTables } from '@/contexts/TablesContext';
import { useToast } from '@/contexts/ToastContext';
import { apiClient } from '@/lib/api-client';
import { Store, Power, LogOut } from 'lucide-react';

// --- Restaurant Closed Screen (shown to all roles when restro is closed) ---
const RestaurantClosedScreen: React.FC<{ userName: string; onOpenRestro: () => void; onLogout: () => void }> = ({ userName, onOpenRestro, onLogout }) => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-bg-light flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-lg p-8 max-w-sm w-full text-center space-y-6 border border-stone-100">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto border-2 border-red-100">
          <Store size={40} className="text-red-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-brown-dark mb-1">{t('restroClosed')}</h2>
          <p className="text-stone-400 text-sm">Welcome, {userName}</p>
        </div>
        <p className="text-stone-500 text-sm leading-relaxed">
          {t('openRestroMessage')}
        </p>
        <button
          onClick={onOpenRestro}
          className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold text-lg py-3.5 rounded-xl shadow-md hover:bg-green-700 active:scale-95 transition-all"
        >
          <Power size={20} />
          {t('openRestro')}
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-500 font-semibold py-2.5 rounded-xl border border-red-100 hover:bg-red-100 transition-colors text-sm"
        >
          <LogOut size={16} />
          {t('logout')}
        </button>
      </div>
    </div>
  );
};

const ServerApp: React.FC<{ userName: string; userId: number; userRole: UserRole; loginTime: Date; onLogout: () => void; isOwnerView?: boolean; onBackToDashboard?: () => void; isRestroOpen?: boolean; toggleRestro?: (onBlocked?: () => void) => void }> = ({ userName, userId, userRole, loginTime, onLogout, isOwnerView, onBackToDashboard, isRestroOpen, toggleRestro }) => {
  const [activeTab, setActiveTab] = useState<TabName>(userRole === 'BILLING' ? TabName.CHECKOUTS : userRole === 'HOTEL_MANAGER' ? TabName.ROOMS : TabName.TABLES);

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
      case TabName.ROOMS:
        return <RoomsTab />;
      case TabName.PROFILE:
        return <ProfileTab userName={userName} userId={userId} loginTime={loginTime} onLogout={onLogout} userRole={isOwnerView ? 'OWNER' : userRole} isRestroOpen={isRestroOpen} toggleRestro={toggleRestro} />;
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
  const [ownerManagerView, setOwnerManagerView] = useState(false);
  const { tables } = useTables();
  const { showToast } = useToast();
  const { t } = useLanguage();

  // --- Restaurant Open/Close state (shared across all roles) ---
  const [isRestroOpen, setIsRestroOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('restroOpen') === 'true';
    }
    return false;
  });
  const [restroOpenTime, setRestroOpenTime] = useState<Date | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('restroOpenTime');
      return saved ? new Date(saved) : null;
    }
    return null;
  });

  const toggleRestro = (onBlocked?: () => void) => {
    if (isRestroOpen) {
      // Fetch fresh table data from API before closing
      fetch('/api/tables')
        .then(res => res.json())
        .then((data: Table[]) => {
          const currentTables = Array.isArray(data) ? data : tables;
          const activeTables = currentTables.filter((tbl: any) => 
            tbl.status !== 'EMPTY' || 
            (tbl.currentOrders && tbl.currentOrders.length > 0)
          );
          if (activeTables.length > 0) {
            if (onBlocked) onBlocked();
          } else {
            setIsRestroOpen(false);
            setRestroOpenTime(null);
            localStorage.removeItem('restroOpen');
            localStorage.removeItem('restroOpenTime');
          }
        })
        .catch(() => {
          // Fallback: check context tables
          const activeTables = tables.filter((tbl: any) => 
            tbl.status !== 'EMPTY' || 
            (tbl.currentOrders && tbl.currentOrders.length > 0)
          );
          if (activeTables.length > 0) {
            if (onBlocked) onBlocked();
          } else {
            setIsRestroOpen(false);
            setRestroOpenTime(null);
            localStorage.removeItem('restroOpen');
            localStorage.removeItem('restroOpenTime');
          }
        });
    } else {
      const now = new Date();
      setIsRestroOpen(true);
      setRestroOpenTime(now);
      localStorage.setItem('restroOpen', 'true');
      localStorage.setItem('restroOpenTime', now.toISOString());
    }
  };

  const openRestro = () => {
    const now = new Date();
    setIsRestroOpen(true);
    setRestroOpenTime(now);
    localStorage.setItem('restroOpen', 'true');
    localStorage.setItem('restroOpenTime', now.toISOString());
  };

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

  // Not logged in
  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Owner flow
  if (user.role === 'OWNER') {
    if (ownerManagerView) {
      return (
        <ServerApp 
          userName={user.name} 
          userId={user.id}
          userRole={user.role}
          loginTime={user.loginTime} 
          onLogout={handleLogout} 
          isOwnerView={true}
          onBackToDashboard={() => setOwnerManagerView(false)}
          isRestroOpen={isRestroOpen}
          toggleRestro={toggleRestro}
        />
      );
    }
    return (
      <OwnerDashboard 
        userName={user.name} 
        userId={user.id}
        onLogout={handleLogout} 
        onSwitchToManagerView={() => setOwnerManagerView(true)}
        isRestroOpen={isRestroOpen}
        restroOpenTime={restroOpenTime}
        toggleRestro={toggleRestro}
      />
    );
  }

  // Hotel Manager — always allowed (rooms are independent of restaurant state)
  if (user.role === 'HOTEL_MANAGER') {
    return (
      <ServerApp 
        userName={user.name} 
        userId={user.id} 
        userRole={user.role} 
        loginTime={user.loginTime} 
        onLogout={handleLogout}
      />
    );
  }

  // Captain / Billing — block everything when restaurant is closed
  if (!isRestroOpen) {
    return (
      <RestaurantClosedScreen 
        userName={user.name} 
        onOpenRestro={openRestro} 
        onLogout={handleLogout} 
      />
    );
  }

  return (
    <ServerApp 
      userName={user.name} 
      userId={user.id} 
      userRole={user.role} 
      loginTime={user.loginTime} 
      onLogout={handleLogout}
      isRestroOpen={isRestroOpen}
      toggleRestro={toggleRestro}
    />
  );
};
