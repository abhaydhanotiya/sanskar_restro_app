'use client';

import React from 'react';
import { LayoutGrid, UtensilsCrossed, Receipt, User, ChefHat, BedDouble } from 'lucide-react';
import { TabName, UserRole } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface BottomNavProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
  userRole?: UserRole;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, userRole }) => {
  const { t } = useLanguage();

  const allNavItems = [
    { id: TabName.TABLES, label: t('tables'), icon: LayoutGrid },
    { id: TabName.MENU, label: t('menu'), icon: UtensilsCrossed },
    { id: TabName.KITCHEN, label: t('kitchen'), icon: ChefHat },
    { id: TabName.CHECKOUTS, label: t('checkouts'), icon: Receipt },
    { id: TabName.ROOMS, label: t('rooms'), icon: BedDouble },
    { id: TabName.PROFILE, label: t('profile'), icon: User },
  ];

  // Filter tabs based on role
  // Captain: restaurant only (tables, menu, kitchen)
  // Billing: restaurant checkouts only
  // Hotel Manager: rooms only
  // Owner: everything (restaurant + rooms)
  const navItems = userRole === 'BILLING'
    ? allNavItems.filter(item => [TabName.CHECKOUTS, TabName.PROFILE].includes(item.id))
    : userRole === 'CAPTAIN'
    ? allNavItems.filter(item => [TabName.TABLES, TabName.MENU, TabName.KITCHEN, TabName.PROFILE].includes(item.id))
    : userRole === 'HOTEL_MANAGER'
    ? allNavItems.filter(item => [TabName.ROOMS, TabName.PROFILE].includes(item.id))
    : allNavItems; // OWNER sees all (including rooms)

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[72px] bg-white/90 backdrop-blur-md border-t border-stone-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 flex justify-around items-center px-2 pb-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`group relative flex flex-col items-center justify-center w-14 sm:w-16 h-full transition-all duration-300 ${
              isActive ? '-translate-y-1' : ''
            }`}
          >
            <div className={`p-2 rounded-2xl transition-all duration-300 ${
              isActive ? 'bg-peach/10 text-peach-dark' : 'text-stone-400 hover:text-stone-600'
            }`}>
              <Icon 
                size={isActive ? 24 : 22} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}
              />
            </div>
            <span className={`text-[9px] font-semibold mt-0.5 transition-colors duration-300 ${
              isActive ? 'text-peach-dark' : 'text-stone-400'
            }`}>
              {item.label}
            </span>
            
            {/* Active Indicator Dot */}
            {isActive && (
              <span className="absolute bottom-2 w-1 h-1 rounded-full bg-peach-dark animate-fade-in"></span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
