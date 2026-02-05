'use client';

import React, { useState } from 'react';
import { Plus, ShoppingBag } from 'lucide-react';
import { TableCard } from './TableCard';
import { TableDetailView } from './TableDetailView';
import { GuestCountModal } from './GuestCountModal';
import { Table, TableStatus } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTables } from '@/contexts/TablesContext';

export const TablesTab: React.FC = () => {
  const { t } = useLanguage();
  const { tables, updateTable } = useTables();
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [tableToOccupy, setTableToOccupy] = useState<Table | null>(null);

  const handleTableClick = (table: Table) => {
    if (table.status === TableStatus.EMPTY) {
      // Open guest count modal for empty tables
      setTableToOccupy(table);
    } else {
      // Open detail view for occupied/service/billing tables
      setSelectedTableId(table.id);
    }
  };

  const handleFabClick = () => {
    const firstEmpty = tables.find(t => t.status === TableStatus.EMPTY && !t.isTakeaway);
    if (firstEmpty) {
        setTableToOccupy(firstEmpty);
    }
  };

  const handleGuestConfirm = (count: number) => {
    if (tableToOccupy) {
      const now = new Date().toISOString();
      
      updateTable(tableToOccupy.id, {
        status: TableStatus.OCCUPIED,
        guests: count,
        startTime: now,
        currentOrders: [] // Initialize empty order list
      });

      // Close modal and open detail view
      const id = tableToOccupy.id;
      setTableToOccupy(null);
      setSelectedTableId(id);
    }
  };

  // Separating Physical Tables from Takeaways
  const physicalTables = tables.filter(t => !t.isTakeaway);
  const takeawayOrders = tables.filter(t => t.isTakeaway);

  // Find the selected table object from the context
  const selectedTable = tables.find(t => t.id === selectedTableId);

  if (selectedTable) {
    return <TableDetailView table={selectedTable} onBack={() => setSelectedTableId(null)} />;
  }

  return (
    <div className="p-4 pb-24 min-h-screen bg-bg-light">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-2xl font-bold text-brown-dark">{t('floorPlan')}</h2>
        <div className="flex gap-2 text-xs">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-peach-light border border-peach"></div> {t('occ')}</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full border-2 border-peach"></div> {t('svc')}</div>
        </div>
      </div>

      {/* Takeaway Section (only if exists) */}
      {takeawayOrders.length > 0 && (
        <div className="mb-6">
           <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-3">Active Takeaways</h3>
           <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {takeawayOrders.map(t => (
                  <button 
                    key={t.id}
                    onClick={() => setSelectedTableId(t.id)}
                    className="min-w-[140px] bg-white rounded-xl p-3 shadow-sm border border-peach-light flex flex-col gap-2 hover:shadow-md transition-all active:scale-95"
                  >
                     <div className="flex justify-between items-start">
                        <div className="bg-peach/20 p-1.5 rounded-lg text-peach-dark">
                            <ShoppingBag size={16} />
                        </div>
                        <span className="text-xs font-bold text-stone-400">{t.startTime}</span>
                     </div>
                     <div>
                        <span className="text-lg font-bold text-brown-dark">#{t.id}</span>
                        <p className="text-xs text-stone-500">{t.currentOrders?.length || 0} items</p>
                     </div>
                  </button>
              ))}
           </div>
        </div>
      )}

      {/* Physical Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {physicalTables.map(table => (
          <TableCard key={table.id} table={table} onClick={handleTableClick} />
        ))}
      </div>

      {/* Guest Modal */}
      {tableToOccupy && (
        <GuestCountModal 
          table={tableToOccupy} 
          onClose={() => setTableToOccupy(null)} 
          onConfirm={handleGuestConfirm} 
        />
      )}

      {/* FAB */}
      <button 
        onClick={handleFabClick}
        className="fixed bottom-20 right-4 w-14 h-14 bg-peach hover:bg-peach-dark text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-40 active:scale-90"
      >
        <Plus size={28} />
      </button>
    </div>
  );
};
