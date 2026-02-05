'use client';

import React, { useState, useMemo } from 'react';
import { Search, Plus, X, Utensils, Check, Minus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { MenuItem } from '@/types';
import { useToast } from '@/contexts/ToastContext';
import { useMenu } from '@/hooks/useMenu';

interface MenuModalProps {
  onClose: () => void;
  onAdd: (item: MenuItem) => void;
  onRemove?: (menuId: number) => void;
  addedItemIds?: number[];
}

export const MenuModal: React.FC<MenuModalProps> = ({ onClose, onAdd, onRemove, addedItemIds = [] }) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { menu, loading: menuLoading } = useMenu();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => {
    const unique = Array.from(new Set(menu.map(item => item.category).filter(Boolean)));
    return ['All', ...unique];
  }, [menu]);

  const filteredMenu = menu.filter(item => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddItem = (item: MenuItem) => {
    onAdd(item);
    showToast(`${item.name} added to order`, 'success');
  };

  const handleRemoveItem = (item: MenuItem) => {
    if (onRemove) {
      onRemove(item.id);
      showToast(`${item.name} removed from order`, 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-stone-50 flex flex-col animate-slide-up">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm z-10 flex flex-col gap-4">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-brown-dark">{t('addItem')}</h2>
            <button onClick={onClose} className="bg-stone-100 p-2 rounded-full hover:bg-stone-200">
                <X size={20} className="text-stone-600" />
            </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text" 
            placeholder={t('searchPlaceholder')} 
            className="w-full bg-stone-100 border-none rounded-xl py-3 pl-11 pr-4 text-brown-dark font-medium placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-peach/50 focus:bg-white transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
                selectedCategory === cat 
                  ? 'bg-brown text-white shadow-md' 
                  : 'bg-white border border-stone-200 text-stone-500 hover:bg-stone-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-safe">
        {menuLoading ? (
          <div className="text-center text-stone-400 py-12">{t('loading') ?? 'Loading...'}</div>
        ) : filteredMenu.length === 0 ? (
          <div className="text-center text-stone-400 py-12">{t('noResults') ?? 'No items found.'}</div>
        ) : filteredMenu.map(item => {
          const itemCount = addedItemIds.filter(id => id === item.id).length;
          const isAdded = itemCount > 0;
          return (
          <div key={item.id} className={`group bg-white rounded-xl p-3 flex gap-3 shadow-sm border items-center transition-all ${!item.available ? 'opacity-50 grayscale pointer-events-none' : ''} ${isAdded ? 'border-green-300 bg-green-50/30' : 'border-stone-100'}`}>
            <div className={`w-14 h-14 rounded-lg flex items-center justify-center shrink-0 ${isAdded ? 'bg-green-100' : 'bg-stone-100'}`}>
               <Utensils className={isAdded ? 'text-green-600' : 'text-stone-300'} size={20} />
            </div>
            
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-brown-dark leading-tight truncate">{item.name}</h3>
                  {isAdded && (
                    <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      <Check size={10} />
                      Added ×{itemCount}
                    </div>
                  )}
                </div>
                <p className="text-xs text-stone-400 line-clamp-1">{item.description}</p>
                <div className="font-bold text-peach-dark text-sm mt-1">₹{item.price.toFixed(0)}</div>
            </div>
            
            <div className="flex items-center gap-2">
              {isAdded && onRemove && (
                <button 
                    onClick={() => handleRemoveItem(item)}
                    className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-all bg-red-50 text-red-600 hover:bg-red-100"
                >
                    <Minus size={20} />
                </button>
              )}
              <button 
                  onClick={() => handleAddItem(item)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-all ${isAdded ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-peach/10 text-peach-dark hover:bg-peach hover:text-white'}`}
              >
                  <Plus size={20} />
              </button>
            </div>
          </div>
        )})}
        <div className="h-12"></div>
      </div>
      
      {/* Footer hint */}
      <div className="bg-white/90 backdrop-blur border-t border-stone-200 p-4 text-center">
        <button onClick={onClose} className="text-brown-dark font-bold text-sm">
            Done Adding
        </button>
      </div>
    </div>
  );
};
