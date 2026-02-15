'use client';

import React, { useState } from 'react';
import { CreditCard, Wallet, Clock, Receipt, ShoppingBag, X, History, FileText } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTables } from '@/contexts/TablesContext';
import { useToast } from '@/contexts/ToastContext';
import { TableStatus, OrderStatus, OrderItem, Transaction } from '@/types';

export const CheckoutsTab: React.FC = () => {
  const { t } = useLanguage();
  const { tables, history, processCheckout } = useTables();
  const { showToast } = useToast();
  
  const [viewMode, setViewMode] = useState<'active' | 'history'>('active');
  const [selectedBill, setSelectedBill] = useState<{
    id: string | number;
    title: string;
    items: OrderItem[];
    total: number;
    timestamp: string;
    status: 'pending' | 'paid';
  } | null>(null);

  // Active Bills Logic
  const activeBills = tables
    .filter(t => t.status === TableStatus.NEEDS_BILL || (t.isTakeaway && t.status === TableStatus.OCCUPIED))
    .filter(t => t.isTakeaway ? t.currentOrders && t.currentOrders.length > 0 : t.status === TableStatus.NEEDS_BILL)
    .map(t => {
      const total = t.currentOrders?.reduce((sum, item) => {
         return item.status !== OrderStatus.VOID ? sum + (item.price * item.quantity) : sum;
      }, 0) || 0;
      return {
        tableId: t.id,
        isTakeaway: t.isTakeaway,
        totalDue: total,
        timeRequested: t.startTime || new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        items: t.currentOrders || []
      };
    });

  const handlePayment = (e: React.MouseEvent, id: number, isTakeaway?: boolean) => {
    e.stopPropagation();
    processCheckout(id);
    const label = isTakeaway ? `Takeaway #${id}` : `Table #${id}`;
    showToast(`Payment received for ${label}`, 'success');
  };

  const handlePrint = (e: React.MouseEvent, id: string | number, items: OrderItem[], total: number, isTakeaway?: boolean) => {
    e.stopPropagation();
    const validItems = items.filter(i => i.status !== OrderStatus.VOID);
    
    if (validItems.length === 0) {
        showToast('No valid items to print', 'error');
        return;
    }

    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (!printWindow) {
        showToast('Popup blocked. Please allow popups to print.', 'error');
        return;
    }

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt ${isTakeaway ? 'Takeaway' : 'Table'} #${id}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 20px; font-size: 12px; color: #000; max-width: 300px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 15px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
            .logo { font-size: 16px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; }
            .meta { font-size: 10px; color: #333; margin-bottom: 2px; }
            .items { margin-bottom: 15px; }
            .item { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .item-name { flex: 1; }
            .item-price { margin-left: 10px; }
            .total-section { border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 4px; font-weight: bold; font-size: 14px; }
            .footer { text-align: center; margin-top: 20px; font-size: 10px; color: #555; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Sanskar Palace</div>
            <div style="font-size:10px;color:#888;letter-spacing:2px;">HOTEL &amp; RESORT</div>
            <div class="meta">Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
            <div class="meta">${isTakeaway ? 'Order Type: Takeaway' : 'Order Type: Dine In'}</div>
            <div class="meta">${isTakeaway ? 'Order' : 'Table'}: #${id}</div>
          </div>
          <div class="items">
            ${validItems.map(item => `
              <div class="item">
                <span class="item-name">${item.quantity} x ${item.name}</span>
                <span class="item-price">₹${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
          <div class="total-section">
            <div class="row">
              <span>TOTAL</span>
              <span>₹${total.toFixed(2)}</span>
            </div>
          </div>
          <div class="footer">
            <p>Thank you for dining with us!</p>
            <p>*** Customer Copy ***</p>
          </div>
          <script>
            window.onload = () => { window.print(); setTimeout(() => window.close(), 500); };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
    showToast('Printing bill...', 'info');
  };

  const openActiveBill = (bill: typeof activeBills[0]) => {
    setSelectedBill({
        id: bill.tableId,
        title: bill.isTakeaway ? `Takeaway #${bill.tableId}` : `Table #${bill.tableId}`,
        items: bill.items,
        total: bill.totalDue,
        timestamp: bill.timeRequested,
        status: 'pending'
    });
  };

  const openHistoryBill = (txn: Transaction) => {
    setSelectedBill({
        id: txn.id,
        title: txn.isTakeaway ? `Takeaway #${txn.tableId}` : `Table #${txn.tableId}`,
        items: txn.items,
        total: txn.totalAmount,
        timestamp: txn.timestamp,
        status: 'paid'
    });
  };

  return (
    <div className="p-4 bg-bg-light min-h-screen pb-24">
      {/* View Toggle */}
      <div className="flex bg-white p-1.5 rounded-xl shadow-sm border border-stone-200 mb-6 relative">
         <button 
           onClick={() => setViewMode('active')}
           className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'active' ? 'bg-brown text-white shadow-md' : 'text-stone-500 hover:bg-stone-50'}`}
         >
            <Receipt size={16} />
            {t('activeBills')}
         </button>
         <button 
           onClick={() => setViewMode('history')}
           className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'history' ? 'bg-brown text-white shadow-md' : 'text-stone-500 hover:bg-stone-50'}`}
         >
            <History size={16} />
            {t('history')}
         </button>
      </div>

      {viewMode === 'active' ? (
        // ACTIVE BILLS VIEW
        <>
        {activeBills.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Wallet size={48} className="mb-2 opacity-50" />
            <p>{t('noActiveBills')}</p>
            </div>
        ) : (
            <div className="space-y-4">
            {activeBills.map((bill) => (
                <div 
                key={bill.tableId} 
                onClick={() => openActiveBill(bill)}
                className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-peach animate-fade-in cursor-pointer hover:shadow-md transition-shadow"
                >
                <div className="flex justify-between items-start mb-4">
                    <div>
                    <h3 className="text-xl font-bold text-brown-dark flex items-center gap-2">
                        {bill.isTakeaway ? (
                            <>
                            <ShoppingBag size={20} className="text-peach" />
                            Takeaway #{bill.tableId}
                            </>
                        ) : (
                            <>
                            {t('tables')} #{bill.tableId}
                            </>
                        )}
                    </h3>
                    <div className="flex items-center text-gray-500 text-sm mt-1">
                        <Clock size={14} className="mr-1" />
                        <span>{bill.isTakeaway ? 'Started' : t('requested')}: {bill.timeRequested}</span>
                    </div>
                    </div>
                    <div className="text-right">
                    <span className="block text-sm text-gray-500 uppercase tracking-wide">{t('totalDue')}</span>
                    <span className="block text-2xl font-bold text-brown">₹{bill.totalDue.toFixed(2)}</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button 
                    onClick={(e) => handlePrint(e, bill.tableId, bill.items, bill.totalDue, bill.isTakeaway)}
                    className="flex-1 bg-stone-100 text-stone-600 font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors hover:bg-stone-200"
                    >
                    <Receipt size={18} className="mr-2" />
                    Print
                    </button>
                    <button 
                    onClick={(e) => handlePayment(e, bill.tableId, bill.isTakeaway)}
                    className="flex-[2] bg-peach hover:bg-peach-dark text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors shadow-sm active:scale-95"
                    >
                    <CreditCard size={18} className="mr-2" />
                    {t('processPayment')}
                    </button>
                </div>
                </div>
            ))}
            </div>
        )}
        </>
      ) : (
        // HISTORY VIEW
        <div className="space-y-3 animate-fade-in">
            {history.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <FileText size={48} className="mb-2 opacity-50" />
                    <p>No transaction history yet.</p>
                 </div>
            ) : (
                history.map((txn) => (
                    <div 
                      key={txn.id} 
                      onClick={() => openHistoryBill(txn)}
                      className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 flex justify-between items-center cursor-pointer hover:bg-stone-50"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-stone-100 p-2.5 rounded-lg text-stone-400">
                                {txn.isTakeaway ? <ShoppingBag size={20} /> : <Receipt size={20} />}
                            </div>
                            <div>
                                <h4 className="font-bold text-brown-dark text-sm">
                                    {txn.isTakeaway ? 'Takeaway' : 'Table'} #{txn.tableId}
                                </h4>
                                <div className="text-xs text-stone-400 flex flex-col gap-0.5 mt-0.5">
                                    <span>{txn.id}</span>
                                    <span>{new Date(txn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                             <div className="text-green-600 text-xs font-bold uppercase bg-green-50 px-2 py-0.5 rounded-md mb-1 inline-block">Paid</div>
                             <div className="font-bold text-brown text-lg">₹{txn.totalAmount.toFixed(2)}</div>
                        </div>
                    </div>
                ))
            )}
        </div>
      )}

      {/* Bill Details Modal */}
      {selectedBill && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden animate-slide-up shadow-2xl flex flex-col max-h-[80vh]">
              <div className="p-4 bg-brown text-white flex justify-between items-center shrink-0">
                 <div>
                    <h3 className="font-bold">{t('orderDetails')}</h3>
                    <p className="text-xs opacity-80">{selectedBill.title} • {selectedBill.status === 'paid' ? 'Completed' : 'Pending'}</p>
                 </div>
                 <button onClick={() => setSelectedBill(null)}><X size={20}/></button>
              </div>
              <div className="p-4 overflow-y-auto">
                 <div className="space-y-3">
                    {selectedBill.items.map(item => (
                       <div key={item.id} className={`flex justify-between items-center p-3 rounded-lg border ${item.status === OrderStatus.VOID ? 'bg-red-50 border-red-100' : 'bg-stone-50 border-stone-100'}`}>
                          <div className="flex items-center gap-3">
                             <div className="font-bold text-brown-dark w-6 h-6 bg-white rounded flex items-center justify-center shadow-sm text-sm border border-stone-200">
                                {item.quantity}
                             </div>
                             <div>
                                <p className={`font-medium ${item.status === OrderStatus.VOID ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                                    {item.name}
                                </p>
                                <p className="text-[10px] text-stone-400 uppercase tracking-wide">{item.status}</p>
                             </div>
                          </div>
                          <span className={`font-bold ${item.status === OrderStatus.VOID ? 'text-stone-400' : 'text-brown'}`}>
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                       </div>
                    ))}
                 </div>
                 <div className="mt-6 border-t border-dashed border-stone-300 pt-4 flex justify-between items-center">
                    <span className="font-bold text-lg text-stone-600">Total</span>
                    <span className="font-black text-2xl text-brown-dark">₹{selectedBill.total.toFixed(2)}</span>
                 </div>
              </div>
              <div className="p-4 border-t border-stone-100 flex gap-3">
                 <button onClick={() => setSelectedBill(null)} className="flex-1 py-3 bg-stone-100 text-stone-600 font-bold rounded-xl hover:bg-stone-200">
                    {t('close')}
                 </button>
                 {selectedBill.status === 'paid' && (
                     <button 
                        onClick={(e) => handlePrint(e, selectedBill.id, selectedBill.items, selectedBill.total, selectedBill.title.includes('Takeaway'))}
                        className="flex-1 py-3 bg-brown text-white font-bold rounded-xl hover:bg-brown-dark flex items-center justify-center gap-2"
                     >
                        <Receipt size={18} /> Reprint
                     </button>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Summary Note */}
      <div className="mt-8 bg-blue-50 text-blue-800 p-4 rounded-lg text-sm flex gap-3 items-start">
        <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center shrink-0 text-xs font-bold">i</div>
        <p>{t('paymentNote')}</p>
      </div>
    </div>
  );
};
