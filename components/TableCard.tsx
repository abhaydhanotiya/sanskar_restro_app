'use client';

import React from 'react';
import { Users, Clock } from 'lucide-react';
import { Table, TableStatus } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface TableCardProps {
  table: Table;
  onClick: (table: Table) => void;
}

export const TableCard: React.FC<TableCardProps> = ({ table, onClick }) => {
  const { t } = useLanguage();

  const getStatusConfig = () => {
    switch (table.status) {
      case TableStatus.EMPTY:
        return {
          bg: 'bg-white',
          border: 'border-stone-200',
          badgeBg: 'bg-stone-100',
          badgeText: 'text-stone-500',
          text: 'text-stone-400',
          idColor: 'text-stone-700'
        };
      case TableStatus.OCCUPIED:
        return {
          bg: 'bg-white',
          border: 'border-peach',
          badgeBg: 'bg-peach',
          badgeText: 'text-brown-dark',
          text: 'text-brown-dark',
          idColor: 'text-brown-dark'
        };
      case TableStatus.NEEDS_SERVICE:
        return {
          bg: 'bg-white',
          border: 'border-red-400',
          badgeBg: 'bg-red-500',
          badgeText: 'text-white animate-pulse',
          text: 'text-brown-dark',
          idColor: 'text-red-600'
        };
      case TableStatus.NEEDS_BILL:
        return {
          bg: 'bg-green-50',
          border: 'border-green-500',
          badgeBg: 'bg-green-500',
          badgeText: 'text-white',
          text: 'text-green-900',
          idColor: 'text-green-800'
        };
      default:
        return {
          bg: 'bg-white',
          border: 'border-gray-200',
          badgeBg: 'bg-gray-100',
          badgeText: 'text-gray-500',
          text: 'text-gray-500',
          idColor: 'text-gray-700'
        };
    }
  };

  const statusLabel = () => {
    switch (table.status) {
      case TableStatus.EMPTY: return t('empty');
      case TableStatus.OCCUPIED: return t('ordering');
      case TableStatus.NEEDS_SERVICE: return t('service');
      case TableStatus.NEEDS_BILL: return t('billReady');
    }
  };

  const config = getStatusConfig();

  return (
    <div 
      onClick={() => onClick(table)}
      className={`relative rounded-2xl p-4 flex flex-col justify-between aspect-square shadow-sm hover:shadow-lg active:scale-95 transition-all duration-300 cursor-pointer border-2 ${config.bg} ${config.border}`}
    >
      <div className="flex justify-between items-start">
        <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${config.badgeBg} ${config.badgeText}`}>
          {statusLabel()}
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-4xl font-black ${config.idColor}`}>
          {table.id}
        </span>
      </div>

      <div className="flex justify-between items-end z-10">
        <div className={`flex items-center gap-1.5 text-xs font-semibold ${config.text}`}>
          <Users size={14} />
          <span>{table.guests ? `${table.guests}/${table.capacity}` : table.capacity}</span>
        </div>
        
        {table.startTime && (
          <div className={`flex items-center gap-1 text-[10px] font-medium opacity-80 ${config.text}`}>
            <Clock size={12} />
            <span>{table.startTime}</span>
          </div>
        )}
      </div>
    </div>
  );
};
