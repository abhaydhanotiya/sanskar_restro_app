'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Table, MenuItem, OrderStatus, TableStatus, OrderItem, Transaction } from '@/types';
import { apiClient } from '@/lib/api-client';

interface TablesContextType {
  tables: Table[];
  history: Transaction[];
  loading: boolean;
  updateTable: (id: number, updates: Partial<Table>) => Promise<void>;
  addOrderItem: (tableId: number, item: MenuItem) => Promise<void>;
  createTakeawayOrder: (items: MenuItem[]) => Promise<number>;
  updateOrderItemStatus: (tableId: number, itemId: number, newStatus: OrderStatus) => Promise<void>;
  sendToKitchen: (tableId: number) => Promise<void>;
  moveTable: (fromId: number, toId: number) => Promise<void>;
  processCheckout: (tableId: number) => Promise<void>;
  refreshTables: () => Promise<void>;
  refreshHistory: () => Promise<void>;
}

const TablesContext = createContext<TablesContextType | undefined>(undefined);

export const TablesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [tablesData, historyData] = await Promise.all([
        apiClient.getTables(),
        apiClient.getTransactions(),
      ]);
      setTables(tablesData as Table[]);
      setHistory(historyData as Transaction[]);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshTables = async () => {
    try {
      const tablesData = await apiClient.getTables();
      setTables(tablesData as Table[]);
    } catch (error) {
      console.error('Failed to refresh tables:', error);
    }
  };

  const refreshHistory = async () => {
    try {
      const historyData = await apiClient.getTransactions();
      setHistory(historyData as Transaction[]);
    } catch (error) {
      console.error('Failed to refresh history:', error);
    }
  };

  const applyUpdatedTable = (updatedTable: Table) => {
    setTables(prev => prev.map(t => (t.id === updatedTable.id ? updatedTable : t)));
  };

  const updateTable = async (id: number, updates: Partial<Table>) => {
    try {
      const updatedTable = await apiClient.updateTable(id, updates);
      applyUpdatedTable(updatedTable as Table);
    } catch (error) {
      console.error('Failed to update table:', error);
      throw error;
    }
  };

  const createTakeawayOrder = async (items: MenuItem[]): Promise<number> => {
    try {
      const existingTakeaways = tables.filter(t => t.isTakeaway);
      const newId = 900 + existingTakeaways.length + 1;
      const now = new Date().toISOString();

      const newOrderItems: OrderItem[] = items.map((item, index) => ({
        id: Date.now() + index,
        menuId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        status: OrderStatus.PREPARING
      }));

      const newTable: Table = {
        id: newId,
        capacity: 0,
        status: TableStatus.OCCUPIED,
        guests: 1,
        startTime: now,
        currentOrders: newOrderItems,
        isTakeaway: true
      };

      const createdTable = await apiClient.createTable(newTable);
      setTables(prev => [...prev, createdTable as Table]);
      return (createdTable as Table).id;
    } catch (error) {
      console.error('Failed to create takeaway order:', error);
      throw error;
    }
  };

  const addOrderItem = async (tableId: number, item: MenuItem) => {
    try {
      const table = tables.find(t => t.id === tableId);
      if (!table) return;

      const currentOrders = table.currentOrders || [];
      const statusToUse = table.isTakeaway ? OrderStatus.PREPARING : OrderStatus.ORDERING;

      // Always create a new separate order item for better UX
      const newOrders = [
        ...currentOrders,
        {
          id: Date.now() + Math.random(),
          menuId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          status: statusToUse
        }
      ];

      const updatedTable = await apiClient.updateTable(tableId, { currentOrders: newOrders });
      applyUpdatedTable(updatedTable as Table);
    } catch (error) {
      console.error('Failed to add order item:', error);
      throw error;
    }
  };

  const updateOrderItemStatus = async (tableId: number, itemId: number, newStatus: OrderStatus) => {
    try {
      const table = tables.find(t => t.id === tableId);
      if (!table?.currentOrders) return;

      const updatedOrders = table.currentOrders.map(order =>
        order.id === itemId ? { ...order, status: newStatus } : order
      );

      const updatedTable = await apiClient.updateTable(tableId, { currentOrders: updatedOrders });
      applyUpdatedTable(updatedTable as Table);
    } catch (error) {
      console.error('Failed to update order item status:', error);
      throw error;
    }
  };

  const sendToKitchen = async (tableId: number) => {
    try {
      const table = tables.find(t => t.id === tableId);
      if (!table?.currentOrders) return;

      const updatedOrders = table.currentOrders.map(order =>
        order.status === OrderStatus.ORDERING
          ? { ...order, status: OrderStatus.PREPARING }
          : order
      );

      const newStatus = table.status === TableStatus.NEEDS_SERVICE ? TableStatus.OCCUPIED : table.status;

      const updatedTable = await apiClient.updateTable(tableId, { currentOrders: updatedOrders, status: newStatus });
      applyUpdatedTable(updatedTable as Table);
    } catch (error) {
      console.error('Failed to send to kitchen:', error);
      throw error;
    }
  };

  const moveTable = async (fromId: number, toId: number) => {
    try {
      const fromTable = tables.find(t => t.id === fromId);
      const toTable = tables.find(t => t.id === toId);

      if (!fromTable || !toTable || toTable.status !== TableStatus.EMPTY) return;

      const newToTable = {
        ...toTable,
        status: fromTable.status,
        guests: fromTable.guests,
        startTime: fromTable.startTime,
        currentOrders: fromTable.currentOrders
      };

      const newFromTable = {
        ...fromTable,
        status: TableStatus.EMPTY,
        guests: null,
        startTime: null,
        currentOrders: []
      };

      const [updatedFrom, updatedTo] = await Promise.all([
        apiClient.updateTable(fromId, newFromTable),
        apiClient.updateTable(toId, newToTable),
      ]);

      setTables(prev => prev.map(t => {
        if (t.id === fromId) return updatedFrom as Table;
        if (t.id === toId) return updatedTo as Table;
        return t;
      }));
    } catch (error) {
      console.error('Failed to move table:', error);
      throw error;
    }
  };

  const processCheckout = async (tableId: number) => {
    try {
      const target = tables.find(t => t.id === tableId);

      if (target) {
        const total = target.currentOrders?.reduce((sum, item) =>
          item.status !== OrderStatus.VOID ? sum + (item.price * item.quantity) : sum
          , 0) || 0;

        const transaction: Transaction = {
          id: `TXN-${Date.now()}`,
          tableId: target.id,
          isTakeaway: target.isTakeaway,
          items: target.currentOrders || [],
          totalAmount: total,
          timestamp: new Date().toISOString() // Store full ISO timestamp instead of just time
        };

        await apiClient.createTransaction(transaction);
        setHistory(prevHistory => [transaction, ...prevHistory]);
      }

      if (target?.isTakeaway) {
        await apiClient.deleteTable(tableId);
        setTables(prev => prev.filter(t => t.id !== tableId));
      } else {
        const clearedTable = {
          status: TableStatus.EMPTY,
          guests: null,
          startTime: null,
          currentOrders: []
        };
        const updatedTable = await apiClient.updateTable(tableId, clearedTable);
        applyUpdatedTable(updatedTable as Table);
      }
    } catch (error) {
      console.error('Failed to process checkout:', error);
      throw error;
    }
  };

  return (
    <TablesContext.Provider value={{
      tables,
      history,
      loading,
      updateTable,
      addOrderItem,
      createTakeawayOrder,
      updateOrderItemStatus,
      sendToKitchen,
      moveTable,
      processCheckout,
      refreshTables,
      refreshHistory
    }}>
      {children}
    </TablesContext.Provider>
  );
};

export const useTables = () => {
  const context = useContext(TablesContext);
  if (!context) throw new Error('useTables must be used within a TablesProvider');
  return context;
};
