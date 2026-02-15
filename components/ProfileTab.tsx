'use client';

import React, { useState, useEffect } from 'react';
import { LogOut, Settings, Award, Clock, ListOrdered, Store, Power } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOwnerData } from '@/hooks/useOwnerData';
import { useTables } from '@/contexts/TablesContext';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/contexts/ToastContext';

interface ProfileTabProps {
  userName: string;
  userId: number;
  loginTime: Date;
  onLogout: () => void;
  userRole?: string;
  isRestroOpen?: boolean;
  toggleRestro?: (onBlocked?: () => void) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ userName, userId, loginTime, onLogout, userRole, isRestroOpen, toggleRestro }) => {
  const { t } = useLanguage();
  const { history } = useTables();
  const { staff } = useOwnerData();
  const { showToast } = useToast();
  const [shiftStatus, setShiftStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip shift fetching for owners
    if (userRole === 'OWNER') {
      setLoading(false);
      return;
    }

    const fetchShiftStatus = async () => {
      try {
        const status = await apiClient.getShiftStatus(userId);
        setShiftStatus(status);
      } catch (error) {
        console.error('Error fetching shift status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShiftStatus();
    const interval = setInterval(fetchShiftStatus, 60000);
    return () => clearInterval(interval);
  }, [userId, userRole]);

  const toDate = (value: string | Date | null | undefined) => {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const staffMember = staff.find(s => s.name.toLowerCase() === userName.toLowerCase());

  const isSameDay = (a: Date | null, b: Date) => {
    if (!a) return false;
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  };

  // Get online hours — fallback to time since login
  const hoursWorked = shiftStatus?.hoursWorked ?? 
    ((new Date().getTime() - loginTime.getTime()) / (1000 * 60 * 60));

  const today = new Date();

  // Filter orders from today
  const todaysOrders = history.filter(txn => {
    const txnDate = toDate(txn.timestamp);
    return txnDate && isSameDay(txnDate, today);
  });
  
  const ordersServed = todaysOrders.length;

  const chartData = (() => {
    const now = new Date();
    const hours = Array.from({ length: 5 }, (_, idx) => {
      const d = new Date(now);
      d.setHours(now.getHours() - (4 - idx), 0, 0, 0);
      return d;
    });

    // Use today's orders for the chart
    const counts = new Map<number, number>();
    todaysOrders.forEach(txn => {
      const txnDate = toDate(txn.timestamp);
      if (!txnDate) return;
      const hourKey = txnDate.getHours();
      counts.set(hourKey, (counts.get(hourKey) ?? 0) + 1);
    });

    return hours.map(h => ({
      name: h.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      orders: counts.get(h.getHours()) ?? 0,
    }));
  })();

  return (
    <div className="p-4 bg-bg-light min-h-screen pb-24">
      {/* Header Profile */}
      <div className="bg-brown text-white rounded-2xl p-6 shadow-md mb-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-peach-light text-brown-dark flex items-center justify-center text-xl font-bold border-2 border-white">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold">{userName}</h2>
          <p className="text-peach-light text-sm">{userRole === 'OWNER' ? 'Owner' : userRole === 'BILLING' ? 'Billing' : 'Captain'} • ID: #{staffMember?.id ?? '—'}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <h3 className="font-bold text-brown-dark mb-3 px-1">{t('today')}</h3>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white p-3 rounded-xl shadow-sm text-center border border-gray-100">
          <Clock className="w-6 h-6 mx-auto text-peach mb-2" />
          <div className="text-lg font-bold text-gray-800">{hoursWorked.toFixed(1)}h</div>
          <div className="text-[10px] text-gray-500 uppercase font-medium">{t('online')}</div>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm text-center border border-gray-100">
          <ListOrdered className="w-6 h-6 mx-auto text-blue-500 mb-2" />
          <div className="text-lg font-bold text-gray-800">{ordersServed}</div>
          <div className="text-[10px] text-gray-500 uppercase font-medium">{t('orders')}</div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 h-64 border border-gray-100">
        <h4 className="text-sm font-semibold text-gray-600 mb-4">{t('ordersPerHour')}</h4>
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              cursor={{ fill: 'transparent' }}
            />
            <Bar dataKey="orders" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 2 ? '#D84315' : '#FFAB91'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Restaurant Status Toggle */}
      {toggleRestro && (
        <div className={`p-4 rounded-2xl shadow-sm border flex items-center justify-between transition-all mb-6 ${
          isRestroOpen 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              isRestroOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
            }`}>
              <Store size={20} />
            </div>
            <div>
              <h3 className={`font-bold text-sm ${
                isRestroOpen ? 'text-green-800' : 'text-red-700'
              }`}>
                {isRestroOpen ? t('restroOpen') : t('restroClosed')}
              </h3>
            </div>
          </div>
          <button
            onClick={() => toggleRestro?.(() => showToast(t('restroCloseBlocked'), 'error'))}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm ${
              isRestroOpen 
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <Power size={14} />
            {isRestroOpen ? t('restroClose') : t('openRestro')}
          </button>
        </div>
      )}

      {/* Settings List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <button className="w-full flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <Settings size={20} className="text-gray-500" />
            <span className="text-gray-700 font-medium">{t('appSettings')}</span>
          </div>
        </button>
        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <Award size={20} className="text-gray-500" />
            <span className="text-gray-700 font-medium">{t('achievements')}</span>
          </div>
        </button>
      </div>

      {/* Logout */}
      <button 
        onClick={() => onLogout()}
        className="w-full mt-6 bg-red-50 text-red-600 font-bold py-3 rounded-xl border border-red-100 flex items-center justify-center hover:bg-red-100 transition-colors"
      >
        <LogOut size={18} className="mr-2" />
        {t('logout')}
      </button>
    </div>
  );
};
