'use client';

import React, { useState } from 'react';
import { ArrowLeft, Plus, ArrowRightLeft, Receipt, CheckCircle2, AlertCircle, ChefHat, Clock, Users, X, ArrowRight, Utensils, Bell, Trash2, Minus } from 'lucide-react';
import { Table, TableStatus, OrderStatus, MenuItem } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTables } from '@/contexts/TablesContext';
import { useMenu } from '@/hooks/useMenu';
import { useToast } from '@/contexts/ToastContext';
import { MenuModal } from './MenuModal';

interface TableDetailViewProps {
  table: Table;
  onBack: () => void;
}

export const TableDetailView: React.FC<TableDetailViewProps> = ({ table, onBack }) => {
  const { t } = useLanguage();
  const { updateTable, addOrderItem, sendToKitchen, moveTable, updateOrderItemStatus, tables } = useTables();
  const { menu } = useMenu();
  const { showToast } = useToast();
  const [isAddingItems, setIsAddingItems] = useState(false);
  const [isMovingTable, setIsMovingTable] = useState(false);

  // Filter empty tables for Move functionality
  const emptyTables = tables.filter(t => t.status === TableStatus.EMPTY && t.id !== table.id);

  const calculateSubtotal = () => {
    if (!table.currentOrders) return 0;
    return table.currentOrders.reduce((sum, item) => {
      if (item.status === OrderStatus.VOID) return sum;
      return sum + item.price;
    }, 0);
  };

  const hasDraftItems = table.currentOrders?.some(item => item.status === OrderStatus.ORDERING);
  const subtotal = calculateSubtotal();
  
  // Check if all items are served (required for bill)
  const allItemsServed = table.currentOrders && table.currentOrders.length > 0 
    ? table.currentOrders.every(item => item.status === OrderStatus.SERVED || item.status === OrderStatus.VOID)
    : false;
  
  // Check if any items are being prepared or served (blocks table move)
  const hasActiveOrders = table.currentOrders?.some(item => 
    item.status === OrderStatus.PREPARING || 
    item.status === OrderStatus.READY || 
    item.status === OrderStatus.SERVED
  ) ?? false;

  const handleRequestBill = () => {
    if (!allItemsServed) {
      showToast('Cannot request bill until all items are served', 'error');
      return;
    }
    updateTable(table.id, { status: TableStatus.NEEDS_BILL });
    showToast('Bill requested. Notification sent to Cashier.', 'info');
  };

  const handleSendToKitchen = () => {
    sendToKitchen(table.id);
    showToast('Order sent to Kitchen!', 'success');
  };

  const handleMoveTable = (targetId: number) => {
    if (hasActiveOrders) {
      showToast('Cannot move table with active orders', 'error');
      setIsMovingTable(false);
      return;
    }
    moveTable(table.id, targetId);
    setIsMovingTable(false);
    onBack(); 
    showToast(`Table moved to #${targetId}`, 'success');
  };

  const handleServeItem = (itemId: number, itemName: string) => {
    updateOrderItemStatus(table.id, itemId, OrderStatus.SERVED);
    showToast(`${itemName} marked as served`, 'success');
  };

  const handleRemoveItem = (itemId: number, itemName: string) => {
    if (!table.currentOrders) return;
    const updatedOrders = table.currentOrders.filter(order => order.id !== itemId);
    updateTable(table.id, { currentOrders: updatedOrders });
    showToast(`${itemName} removed`, 'info');
  };

  const handleRemoveOneItem = (menuId: number) => {
    if (!table.currentOrders) return;
    const itemIndex = table.currentOrders.findIndex(order => order.menuId === menuId);
    if (itemIndex === -1) return;
    
    const updatedOrders = [...table.currentOrders];
    updatedOrders.splice(itemIndex, 1);
    updateTable(table.id, { currentOrders: updatedOrders });
  };

  const handleAddOneMore = (item: { menuId: number; name: string; price: number }) => {
    const menuItem: MenuItem = {
      id: item.menuId,
      name: item.name,
      price: item.price,
      category: '',
      description: '',
      available: true
    };
    addOrderItem(table.id, menuItem);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.ORDERING: return 'text-amber-600 bg-amber-50 border-amber-200';
      case OrderStatus.PREPARING: return 'text-peach-dark bg-peach/10 border-peach/20';
      case OrderStatus.READY: return 'text-green-700 bg-green-100 border-green-300 ring-1 ring-green-300';
      case OrderStatus.SERVED: return 'text-stone-500 bg-stone-100 border-stone-200';
      case OrderStatus.VOID: return 'text-red-700 bg-red-100 border-red-200 opacity-60 line-through decoration-red-700/50';
      default: return 'text-gray-500';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.ORDERING: return t('statusOrdering');
      case OrderStatus.PREPARING: return t('statusPreparing');
      case OrderStatus.READY: return t('statusReady');
      case OrderStatus.SERVED: return t('statusServed');
      case OrderStatus.VOID: return t('statusVoid');
      default: return '';
    }
  };

  if (isAddingItems) {
    const addedItemIds = table.currentOrders?.map(order => order.menuId) || [];
    return (
      <MenuModal 
        onClose={() => setIsAddingItems(false)} 
        onAdd={(item) => addOrderItem(table.id, item)} 
        onRemove={handleRemoveOneItem}
        addedItemIds={addedItemIds} 
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-stone-50 flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-stone-200">
        <div className="p-4 pt-6 pb-2">
            <div className="flex items-center gap-4 mb-4">
                <button onClick={onBack} className="p-2 -ml-2 hover:bg-stone-100 rounded-full transition-colors text-brown-dark">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-brown-dark leading-none">{t('table')} <span className="text-3xl">{table.id}</span></h2>
                </div>
                <div className="ml-auto flex flex-col items-end">
                    <div className="flex items-center gap-1.5 text-stone-500 font-medium text-sm">
                        <Users size={16} />
                        <span>{table.guests}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-400 text-xs mt-1">
                        <Clock size={14} />
                        <span>{table.startTime}</span>
                    </div>
                </div>
            </div>

            {/* Action Chips */}
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                <button 
                  onClick={() => setIsAddingItems(true)}
                  className="flex-1 min-w-[100px] bg-brown text-white py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold shadow-md active:scale-95 transition-all"
                >
                    <Plus size={16} />
                    {t('addItem')}
                </button>
                <button 
                  onClick={() => setIsMovingTable(true)}
                  disabled={hasActiveOrders}
                  className={`flex-1 min-w-[110px] py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold border transition-all ${
                    hasActiveOrders
                      ? 'bg-stone-50 text-stone-300 border-stone-100 cursor-not-allowed opacity-60'
                      : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200 active:scale-95'
                  }`}
                  title={hasActiveOrders ? 'Cannot move table with active orders' : ''}
                >
                    <ArrowRightLeft size={16} />
                    {t('moveTable')}
                </button>
                <button 
                    onClick={handleRequestBill}
                    disabled={!allItemsServed && table.status !== TableStatus.NEEDS_BILL}
                    className={`flex-1 min-w-[110px] py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold shadow-sm transition-all border ${
                    table.status === TableStatus.NEEDS_BILL 
                        ? 'bg-green-100 text-green-700 border-green-200 cursor-default' 
                        : allItemsServed
                        ? 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200 active:scale-95'
                        : 'bg-stone-50 text-stone-300 border-stone-100 cursor-not-allowed opacity-60'
                    }`}
                    title={!allItemsServed && table.status !== TableStatus.NEEDS_BILL ? 'All items must be served first' : ''}
                >
                    <Receipt size={16} />
                    {table.status === TableStatus.NEEDS_BILL ? t('billSent') : t('requestBill')}
                </button>
            </div>
        </div>
      </div>

      {/* Order List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-[200px]">
        {!table.currentOrders || table.currentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-stone-400">
            <div className="bg-stone-100 p-6 rounded-full mb-4">
                <Receipt size={48} className="opacity-50" />
            </div>
            <p className="font-medium text-lg">{t('empty')}</p>
            <p className="text-sm mt-1">Add items to start the order</p>
          </div>
        ) : (
          (() => {
            // Group items by menuId and status
            const groupedItems = table.currentOrders.reduce((acc, item) => {
              const key = `${item.menuId}-${item.status}`;
              if (!acc[key]) {
                acc[key] = {
                  ...item,
                  quantity: 1,
                  items: [item]
                };
              } else {
                acc[key].quantity += 1;
                acc[key].items.push(item);
              }
              return acc;
            }, {} as Record<string, any>);
            
            return Object.values(groupedItems).map((groupedItem: any) => (
            <div key={`${groupedItem.menuId}-${groupedItem.status}`} className={`bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex flex-col gap-3 ${groupedItem.status === OrderStatus.ORDERING ? 'ring-1 ring-amber-300 bg-amber-50/30' : ''}`}>
              <div className="flex justify-between items-start">
                <div className="flex gap-3 items-start">
                    <div className={`text-brown-dark font-bold w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${groupedItem.status === OrderStatus.ORDERING ? 'bg-amber-100 text-amber-800' : 'bg-stone-100'}`}>
                        {groupedItem.quantity}
                    </div>
                    <div>
                        <h4 className={`font-bold text-stone-800 text-lg leading-tight ${groupedItem.status === OrderStatus.VOID ? 'line-through opacity-50' : ''}`}>
                            {groupedItem.name}
                        </h4>
                        {/* Subtitle/Description */}
                        {(() => {
                          const menuItem = menu.find(m => m.id === groupedItem.menuId);
                          return menuItem?.description ? (
                            <p className="text-xs text-stone-400 font-medium line-clamp-1 mt-0.5">
                                {menuItem.description}
                            </p>
                          ) : null;
                        })()}
                        {groupedItem.modifications && (
                            <p className="text-xs text-peach-dark font-medium italic mt-1">
                                &quot;{groupedItem.modifications}&quot;
                            </p>
                        )}
                    </div>
                </div>
                <span className={`font-bold text-brown text-lg ${groupedItem.status === OrderStatus.VOID ? 'opacity-50 line-through' : ''}`}>
                  ₹{(groupedItem.price * groupedItem.quantity).toFixed(0)}
                </span>
              </div>
              
              <div className="flex justify-between items-center border-t border-stone-50 pt-3 mt-1">
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${getStatusColor(groupedItem.status)}`}>
                  {groupedItem.status === OrderStatus.PREPARING && <ChefHat size={14} className="animate-pulse" />}
                  {groupedItem.status === OrderStatus.ORDERING && <Clock size={14} />}
                  {groupedItem.status === OrderStatus.READY && <Bell size={14} className="text-green-600 animate-bounce" />}
                  {groupedItem.status === OrderStatus.SERVED && <CheckCircle2 size={14} />}
                  {groupedItem.status === OrderStatus.VOID && <AlertCircle size={14} />}
                  {getStatusLabel(groupedItem.status)}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Quantity controls - only for ORDERING status */}
                  {groupedItem.status === OrderStatus.ORDERING && (
                      <div className="flex items-center gap-2">
                        <button 
                            onClick={() => handleRemoveOneItem(groupedItem.menuId)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 active:scale-95 transition-all border border-red-200"
                        >
                            <Minus size={16} />
                        </button>
                        <button 
                            onClick={() => handleAddOneMore({ menuId: groupedItem.menuId, name: groupedItem.name, price: groupedItem.price })}
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-50 text-green-600 hover:bg-green-100 active:scale-95 transition-all border border-green-200"
                        >
                            <Plus size={16} />
                        </button>
                      </div>
                  )}

                  {/* 1. If READY -> Serve Button */}
                  {groupedItem.status === OrderStatus.READY && (
                      <button 
                          onClick={() => handleServeItem(groupedItem.items[0].id, groupedItem.name)}
                          className="flex items-center gap-1 bg-green-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold uppercase shadow-sm hover:bg-green-600 active:scale-95 transition-all"
                      >
                          <Utensils size={14} />
                          {t('serve')}
                      </button>
                  )}

                  {/* 2. If PREPARING -> Show Text (Chef handles prep) */}
                  {groupedItem.status === OrderStatus.PREPARING && (
                      <span className="text-xs font-medium text-stone-400 italic">
                          Processing...
                      </span>
                  )}
                </div>
              </div>
            </div>
            ));
          })()
        )}
      </div>

      {/* Floating Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-stone-200 p-5 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-[100] rounded-t-3xl">
        <div className="flex justify-between items-end mb-4 text-brown-dark">
          <div className="flex flex-col">
            <span className="text-stone-400 font-bold uppercase tracking-wider text-xs">{t('subtotal')}</span>
            <span className="text-3xl font-black tracking-tight">₹{subtotal.toFixed(2)}</span>
          </div>
        </div>
        <button 
          onClick={handleSendToKitchen}
          disabled={!hasDraftItems}
          className={`w-full font-bold py-4 rounded-2xl shadow-xl active:scale-[0.98] transition-all text-lg flex items-center justify-center gap-3 ${
            hasDraftItems 
              ? 'bg-gradient-to-r from-brown to-brown-light hover:from-brown-dark hover:to-brown text-white shadow-brown/20'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
        >
          <ChefHat size={22} />
          {t('sendToKitchen')}
        </button>
      </div>

      {/* Move Table Modal */}
      {isMovingTable && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden animate-slide-up shadow-2xl">
              <div className="p-4 bg-brown text-white flex justify-between items-center">
                 <h3 className="font-bold">{t('moveTableTitle')}</h3>
                 <button onClick={() => setIsMovingTable(false)}><X size={20}/></button>
              </div>
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                 <p className="text-stone-500 mb-4">{t('moveTableDesc')}</p>
                 <div className="grid grid-cols-3 gap-3">
                    {emptyTables.map(t => (
                        <button 
                          key={t.id}
                          onClick={() => handleMoveTable(t.id)}
                          className="p-4 border border-stone-200 rounded-xl hover:bg-peach/10 hover:border-peach flex flex-col items-center justify-center gap-2 transition-all"
                        >
                           <span className="text-2xl font-bold text-brown-dark">{t.id}</span>
                           <span className="text-xs text-stone-400">Cap: {t.capacity}</span>
                        </button>
                    ))}
                 </div>
                 {emptyTables.length === 0 && <p className="text-center text-stone-400 py-4">No empty tables available.</p>}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
