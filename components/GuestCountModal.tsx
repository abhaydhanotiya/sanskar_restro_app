'use client';

import React, { useState } from 'react';
import { Users, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Table } from '@/types';

interface GuestCountModalProps {
  table: Table;
  onClose: () => void;
  onConfirm: (count: number) => void;
}

export const GuestCountModal: React.FC<GuestCountModalProps> = ({ table, onClose, onConfirm }) => {
  const { t } = useLanguage();
  const [count, setCount] = useState<number>(2); // Default to 2 for easier flow
  const [error, setError] = useState<string>('');

  const handleConfirm = () => {
    if (count < 1 || count > table.capacity) {
      setError(t('errorGuestCount').replace('{cap}', table.capacity.toString()));
      return;
    }
    onConfirm(count);
  };

  const handleIncrement = () => {
    if (count < table.capacity) setCount(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (count > 1) setCount(prev => prev - 1);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-brown-dark/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl transform transition-all animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="bg-white p-5 border-b border-stone-100 flex justify-between items-center">
          <div className="flex items-center gap-3 text-brown-dark">
            <div className="bg-peach/20 p-2 rounded-full">
                <Users size={20} className="text-peach-dark" />
            </div>
            <div>
                <h3 className="font-bold text-lg leading-none">{t('selectGuests')}</h3>
                <p className="text-xs text-stone-400 mt-1">{t('table')} #{table.id} • Max {table.capacity}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-stone-100 rounded-full p-2 transition-colors text-stone-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          <p className="text-stone-500 mb-8 text-center font-medium">{t('enterGuestCount')}</p>
          
          <div className="flex items-center justify-center gap-8 mb-10">
            <button 
              onClick={handleDecrement}
              className="w-16 h-16 rounded-2xl border-2 border-stone-200 text-stone-400 flex items-center justify-center text-3xl font-bold hover:bg-stone-50 hover:border-stone-300 hover:text-stone-600 transition-all active:scale-95"
            >
              -
            </button>
            <div className="text-6xl font-black text-brown-dark w-24 text-center tracking-tighter">
              {count}
            </div>
            <button 
              onClick={handleIncrement}
              className="w-16 h-16 rounded-2xl bg-peach text-white flex items-center justify-center text-3xl font-bold hover:bg-peach-dark transition-all shadow-lg shadow-peach/30 active:scale-95"
            >
              +
            </button>
          </div>

          {error && (
            <div className="flex items-center justify-center gap-2 text-red-500 text-sm font-semibold bg-red-50 p-3 rounded-xl mb-6 animate-pulse">
                <span>{error}</span>
            </div>
          )}

          <button 
            onClick={handleConfirm}
            className="w-full py-4 bg-brown text-white font-bold rounded-2xl shadow-xl shadow-brown/20 hover:bg-brown-dark transition-all active:scale-[0.98] text-lg"
          >
            {t('confirm')}
          </button>
          
          <button 
            onClick={onClose}
            className="w-full mt-3 py-3 text-stone-400 font-semibold hover:text-stone-600 transition-colors text-sm"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};
