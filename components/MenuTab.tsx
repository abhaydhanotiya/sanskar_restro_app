'use client';

import React, { useState } from 'react';
import { Search, Plus, Sparkles, X, Send, Utensils, ChefHat, ArrowRight, ShoppingBag } from 'lucide-react';
import { MENU_CATEGORIES } from '@/constants';
import { askMenuAssistant } from '@/services/geminiService';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTables } from '@/contexts/TablesContext';
import { useToast } from '@/contexts/ToastContext';
import { useMenu } from '@/hooks/useMenu';
import { MenuItem, TableStatus } from '@/types';

export const MenuTab: React.FC = () => {
  const { t, language } = useLanguage();
  const { tables, addOrderItem, updateTable, createTakeawayOrder } = useTables();
  const { showToast } = useToast();
  const { menu, loading: menuLoading } = useMenu();
  
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Local Cart State
  const [cartItems, setCartItems] = useState<MenuItem[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  
  // AI State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const filteredMenu = menu.filter(item => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);

  const getCartCount = (itemId: number) => {
    return cartItems.filter(i => i.id === itemId).length;
  };

  const addToCart = (item: MenuItem) => {
    setCartItems(prev => [...prev, item]);
    showToast(`${item.name} added to temporary cart`, 'success');
  };

  const handleAssignToTable = (tableId: number) => {
    // Determine if table needs to be set to occupied
    const targetTable = tables.find(t => t.id === tableId);
    if (!targetTable) return;

    if (targetTable.status === TableStatus.EMPTY) {
      const now = new Date().toISOString();
      updateTable(tableId, { status: TableStatus.OCCUPIED, guests: 2, startTime: now, currentOrders: [] });
    }

    // Add all items
    cartItems.forEach(item => {
        addOrderItem(tableId, item);
    });

    setCartItems([]);
    setShowAssignModal(false);
    showToast(`Order assigned to Table #${tableId}`, 'success');
  };

  const handleCreateTakeaway = () => {
    const newId = createTakeawayOrder(cartItems);
    setCartItems([]);
    setShowAssignModal(false);
    showToast(`Takeaway Order #${newId} created & sent to kitchen!`, 'success');
  };

  const handleAiAsk = async () => {
    if (!aiQuery.trim()) return;
    setIsThinking(true);
    setAiResponse(null);
    const menuContext = menu.map(i => `${i.name} (${i.description})`).join(", ");
    const finalQuery = language === 'hi' ? `${aiQuery} (Please answer in Hindi)` : aiQuery;
    const response = await askMenuAssistant(finalQuery, menuContext);
    setAiResponse(response);
    setIsThinking(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-72px)] bg-stone-50">
      {/* Sticky Header */}
      <div className="bg-white px-4 py-3 shadow-sm z-10 sticky top-16">
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text" 
            placeholder={t('searchPlaceholder')} 
            className="w-full bg-stone-100 border-none rounded-xl py-3 pl-11 pr-4 text-brown-dark font-medium placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-peach/50 focus:bg-white transition-all shadow-inner"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar mask-fade-right">
          {MENU_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                selectedCategory === cat 
                  ? 'bg-brown text-white shadow-md transform scale-105' 
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24">
        {filteredMenu.map(item => {
          const count = getCartCount(item.id);
          return (
            <div key={item.id} className={`group relative bg-white rounded-2xl p-4 flex gap-4 shadow-sm border border-stone-100 hover:shadow-md transition-all duration-300 ${!item.available ? 'opacity-60 grayscale' : ''}`}>
              
              {/* Selection Count Badge */}
              {count > 0 && (
                <div className="absolute -top-2 -right-2 bg-peach text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md z-20 animate-scale-in">
                  {count}
                </div>
              )}

              {/* Placeholder Image Icon */}
              <div className="w-20 h-20 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
                 <Utensils className="text-stone-300" size={24} />
              </div>
              
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                      <h3 className="font-bold text-brown-dark text-lg leading-tight">{item.name}</h3>
                      <span className="font-bold text-brown bg-peach/10 px-2 py-1 rounded-lg text-sm">₹{item.price.toFixed(0)}</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                </div>
                
                <div className="flex justify-end mt-2">
                  {item.available ? (
                    <button 
                      onClick={() => addToCart(item)}
                      className="w-9 h-9 rounded-full bg-stone-100 text-brown-dark flex items-center justify-center hover:bg-peach hover:text-white active:scale-90 transition-all shadow-sm"
                    >
                      <Plus size={20} />
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded border border-red-100">{t('soldOut')}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Persistent Cart Footer */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-24 left-4 right-4 bg-brown-dark text-white rounded-2xl p-4 shadow-2xl flex justify-between items-center animate-bounce-in z-30 ring-4 ring-white/20">
          <div className="flex items-center gap-3">
            <div className="bg-peach text-brown-dark w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
              {cartItems.length}
            </div>
            <div className="flex flex-col">
               <span className="font-bold text-sm text-peach-light uppercase tracking-wide">{t('currentOrder')}</span>
               <span className="text-xs text-stone-400">Tap to assign</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-bold text-xl">₹{cartTotal.toFixed(2)}</span>
            <button 
                onClick={() => setShowAssignModal(true)}
                className="text-brown-dark bg-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide hover:bg-gray-100 cursor-pointer transition-colors shadow-md flex items-center gap-2"
            >
                Assign Table <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Assign Table Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
           <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden animate-slide-up shadow-2xl flex flex-col max-h-[85vh]">
              <div className="p-4 bg-brown text-white flex justify-between items-center shrink-0">
                 <h3 className="font-bold">Select Table or Order Type</h3>
                 <button onClick={() => setShowAssignModal(false)}><X size={20}/></button>
              </div>
              
              <div className="p-4 overflow-y-auto">
                 {/* Takeaway Option */}
                 <button 
                    onClick={handleCreateTakeaway}
                    className="w-full bg-peach-light/20 border-2 border-peach border-dashed rounded-xl p-4 flex items-center justify-center gap-3 mb-6 hover:bg-peach-light/40 transition-colors"
                 >
                    <div className="bg-peach text-white p-2 rounded-full">
                        <ShoppingBag size={24} />
                    </div>
                    <div className="text-left">
                        <span className="block font-bold text-brown-dark text-lg">Takeaway / Dine Out</span>
                        <span className="text-xs text-brown">Create a new manual order</span>
                    </div>
                 </button>

                 <p className="text-stone-500 mb-4 text-sm font-medium border-t border-stone-100 pt-4">Or assign to Table:</p>
                 <div className="grid grid-cols-3 gap-3">
                    {tables.filter(t => !t.isTakeaway).map(t => (
                        <button 
                          key={t.id}
                          onClick={() => handleAssignToTable(t.id)}
                          className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                              t.status === TableStatus.EMPTY 
                              ? 'border-stone-200 hover:border-peach hover:bg-peach/5' 
                              : 'border-peach bg-peach/10 hover:bg-peach/20'
                          }`}
                        >
                           <span className={`text-xl font-bold ${t.status === TableStatus.EMPTY ? 'text-stone-600' : 'text-brown-dark'}`}>{t.id}</span>
                           <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${t.status === TableStatus.EMPTY ? 'bg-stone-100 text-stone-500' : 'bg-peach text-white'}`}>
                               {t.status === TableStatus.EMPTY ? 'Empty' : 'Active'}
                           </span>
                        </button>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* AI Assistant Button */}
      <button 
        onClick={() => setShowAiModal(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-white border border-peach text-peach-dark rounded-full shadow-xl flex items-center justify-center z-30 hover:scale-105 active:scale-95 transition-transform"
      >
        <Sparkles size={24} className="animate-pulse-slow" />
      </button>

      {/* AI Assistant Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-slide-up">
            <div className="bg-peach p-5 flex justify-between items-center">
              <div className="flex items-center gap-3 text-brown-dark">
                <div className="bg-white/30 p-2 rounded-full">
                    <Sparkles size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-lg leading-none">{t('assistantTitle')}</h3>
                    <p className="text-xs opacity-80 mt-1">Powered by Gemini</p>
                </div>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-brown-dark hover:bg-white/20 rounded-full p-2 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto min-h-[250px] bg-stone-50">
              {!aiResponse && !isThinking && (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                    <Sparkles size={48} className="text-peach mb-4" />
                    <p className="text-stone-500 font-medium">{t('assistantHint')}</p>
                </div>
              )}
              {isThinking && (
                <div className="flex justify-center items-center h-full space-x-2">
                   <div className="w-3 h-3 bg-peach rounded-full animate-bounce"></div>
                   <div className="w-3 h-3 bg-peach rounded-full animate-bounce delay-100"></div>
                   <div className="w-3 h-3 bg-peach rounded-full animate-bounce delay-200"></div>
                </div>
              )}
              {aiResponse && (
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 text-stone-800 leading-relaxed font-medium">
                  {aiResponse}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-stone-100 bg-white flex gap-3">
              <input 
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiAsk()}
                placeholder={t('assistantPlaceholder')}
                className="flex-1 bg-stone-100 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-peach/50 transition-all"
              />
              <button 
                onClick={handleAiAsk}
                disabled={!aiQuery.trim() || isThinking}
                className="bg-brown hover:bg-brown-dark text-white p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
