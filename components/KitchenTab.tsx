'use client';

import React from 'react';
import { ChefHat, CheckCircle2, Clock, ShoppingBag, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTables } from '@/contexts/TablesContext';
import { useToast } from '@/contexts/ToastContext';
import { OrderStatus } from '@/types';

export const KitchenTab: React.FC = () => {
  const { t } = useLanguage();
  const { tables, updateOrderItemStatus } = useTables();
  const { showToast } = useToast();

  // Helper to get items for a table by status
  const getItemsByStatus = (table: any, status: OrderStatus) => {
    return table.currentOrders?.filter((o: any) => o.status === status) || [];
  };

  // 1. Tables with PREPARING items (For Chef)
  const preparingTables = tables
    .map(table => ({ ...table, items: getItemsByStatus(table, OrderStatus.PREPARING) }))
    .filter(table => table.items.length > 0);

  // 2. Tables with READY items (For Waiter)
  const readyTables = tables
    .map(table => ({ ...table, items: getItemsByStatus(table, OrderStatus.READY) }))
    .filter(table => table.items.length > 0);

  const handleMarkReady = (tableId: number, itemId: number, itemName: string) => {
    updateOrderItemStatus(tableId, itemId, OrderStatus.READY);
    showToast(`${itemName} marked as READY`, 'info');
  };

  const handleServeItem = (tableId: number, itemId: number, itemName: string) => {
    updateOrderItemStatus(tableId, itemId, OrderStatus.SERVED);
    showToast(`${itemName} SERVED`, 'success');
  };

  return (
    <div className="p-4 bg-bg-light min-h-screen pb-24 space-y-8">
      
      {/* SECTION 1: PREPARING (Chef View) */}
      <div>
        <div className="flex items-center gap-3 mb-4">
            <div className="bg-peach/20 p-2.5 rounded-full text-peach-dark">
                <ChefHat size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-brown-dark">{t('statusPreparing')}</h2>
                <p className="text-xs text-stone-500 font-medium">Chef's Queue</p>
            </div>
        </div>

        {preparingTables.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center border border-stone-100 shadow-sm text-stone-400">
                <CheckCircle2 size={32} className="mx-auto mb-2 opacity-50" />
                <p>No active orders in preparation.</p>
            </div>
        ) : (
            <div className="grid gap-4">
            {preparingTables.map((table) => (
                <div key={`prep-${table.id}`} className="bg-white rounded-xl shadow-sm border-l-4 border-l-peach animate-fade-in">
                    <div className="bg-stone-50 px-4 py-2 border-b border-stone-100 flex justify-between items-center rounded-tr-xl">
                        <span className="font-bold text-brown-dark flex items-center gap-2">
                            {table.isTakeaway ? <ShoppingBag size={16}/> : null} 
                            #{table.id}
                        </span>
                        <span className="text-xs text-stone-400 font-mono">{table.startTime}</span>
                    </div>
                    <div className="p-2">
                        {table.items.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between p-3 border-b border-stone-50 last:border-0">
                                <div className="flex gap-3">
                                    <span className="font-bold text-peach-dark w-6">{item.quantity}x</span>
                                    <div>
                                        <p className="font-bold text-stone-800 text-sm leading-tight">{item.name}</p>
                                        {item.modifications && <p className="text-[10px] text-red-500 italic mt-0.5">{item.modifications}</p>}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleMarkReady(table.id, item.id, item.name)}
                                    className="px-3 py-1.5 bg-stone-100 hover:bg-green-100 text-stone-600 hover:text-green-700 rounded-lg text-xs font-bold transition-colors border border-stone-200 hover:border-green-200 flex items-center gap-1"
                                >
                                    {t('markReady')} <ArrowRight size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            </div>
        )}
      </div>

      {/* SECTION 2: READY TO SERVE (Waiter View) */}
      <div>
        <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-2.5 rounded-full text-green-700">
                <CheckCircle2 size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-brown-dark">{t('statusReady')} to Serve</h2>
                <p className="text-xs text-stone-500 font-medium">Pickup & Serve</p>
            </div>
        </div>

        {readyTables.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center border border-stone-100 shadow-sm text-stone-400">
                <Clock size={32} className="mx-auto mb-2 opacity-50" />
                <p>No orders waiting for pickup.</p>
            </div>
        ) : (
            <div className="grid gap-4">
            {readyTables.map((table) => (
                <div key={`ready-${table.id}`} className="bg-white rounded-xl shadow-md border-l-4 border-l-green-500 animate-slide-up">
                    <div className="bg-green-50/50 px-4 py-2 border-b border-stone-100 flex justify-between items-center rounded-tr-xl">
                        <span className="font-bold text-green-900 flex items-center gap-2">
                            {table.isTakeaway ? <ShoppingBag size={16}/> : null} 
                            #{table.id}
                        </span>
                        <span className="text-xs text-green-700 font-bold uppercase tracking-wider">Pickup Now</span>
                    </div>
                    <div className="p-2">
                        {table.items.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between p-3 border-b border-stone-50 last:border-0">
                                <div className="flex gap-3">
                                    <span className="font-bold text-green-700 w-6">{item.quantity}x</span>
                                    <div>
                                        <p className="font-bold text-stone-800 text-sm leading-tight">{item.name}</p>
                                        {item.modifications && <p className="text-[10px] text-red-500 italic mt-0.5">{item.modifications}</p>}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleServeItem(table.id, item.id, item.name)}
                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold transition-colors shadow-sm active:scale-95 flex items-center gap-1"
                                >
                                    <UtensilsIcon /> {t('serve')}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            </div>
        )}
      </div>

    </div>
  );
};

const UtensilsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
);

