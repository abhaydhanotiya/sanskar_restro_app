'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { MenuItem } from '@/types';

export function useMenu() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      setLoading(true);
      const menuData = await apiClient.getMenu();
      setMenu(menuData as MenuItem[]);
    } catch (error) {
      console.error('Failed to load menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMenuItem = async (id: number, updates: Partial<MenuItem>) => {
    try {
      await apiClient.updateMenuItem(id, updates);
      setMenu(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));
    } catch (error) {
      console.error('Failed to update menu item:', error);
      throw error;
    }
  };

  return {
    menu,
    loading,
    updateMenuItem,
    refreshMenu: loadMenu,
  };
}
