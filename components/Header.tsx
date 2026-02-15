'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Clock, ArrowLeft, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface HeaderProps {
  userName: string;
  isOwnerView?: boolean;
  onBackToDashboard?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ userName, isOwnerView, onBackToDashboard }) => {
  const [time, setTime] = useState(new Date());
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <header className={`fixed top-0 left-0 right-0 h-16 backdrop-blur-sm text-white shadow-lg z-50 flex items-center justify-between px-4 transition-all duration-300 ${isOwnerView ? 'bg-brown-dark/95' : 'bg-brown/95'}`}>
      {/* Left: Server Info */}
      <div className="flex items-center gap-2">
        {isOwnerView && onBackToDashboard && (
          <button 
            onClick={onBackToDashboard}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors active:scale-95 mr-1"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold tracking-wide">{t('welcome')}, {userName}</span>
            {isOwnerView && (
              <span className="bg-peach/90 text-brown-dark text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">Owner</span>
            )}
          </div>
          <div className="flex items-center text-xs text-peach-light gap-1.5 opacity-90">
            <Clock size={12} />
            <span className="font-medium">{formatTime(time)}</span>
          </div>
        </div>
      </div>

      {/* Center: Title */}
      <h1 className="text-lg font-bold tracking-tight text-white/90">{isOwnerView ? 'Manager View' : t('appTitle')}</h1>

      {/* Right: Notifications */}
      <button className="relative p-2.5 rounded-full hover:bg-white/10 transition-colors active:scale-95">
        <Bell size={22} />
        <span className="absolute top-2 right-2.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-brown"></span>
      </button>
    </header>
  );
};
