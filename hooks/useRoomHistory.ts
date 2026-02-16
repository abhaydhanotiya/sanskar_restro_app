// hooks/useRoomHistory.ts
import { useState, useCallback } from 'react';
import { RoomBooking } from '@/types';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/contexts/ToastContext';

export function useRoomHistory() {
  const [history, setHistory] = useState<RoomBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.getRoomHistory() as RoomBooking[];
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast('Failed to load room history', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  return { history, loading, loadHistory };
}
