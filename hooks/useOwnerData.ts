'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { StaffMember, AttendanceRecord, Transaction } from '@/types';

export function useOwnerData() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [staffData, attendanceData, transactionsData] = await Promise.all([
        apiClient.getStaff(),
        apiClient.getAttendance(),
        apiClient.getTransactions(),
      ]);
      setStaff(staffData as StaffMember[]);
      setAttendance(attendanceData as AttendanceRecord[]);
      setTransactions(transactionsData as Transaction[]);
    } catch (error) {
      console.error('Failed to load owner data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAttendance = async (recordId: number, updates: Partial<AttendanceRecord>) => {
    try {
      await apiClient.updateAttendanceRecord(recordId, updates);
      setAttendance(prev => prev.map(a => 
        a.id === recordId ? { ...a, ...updates } : a
      ));
    } catch (error) {
      console.error('Failed to update attendance:', error);
      throw error;
    }
  };

  return {
    staff,
    attendance,
    transactions,
    loading,
    updateAttendance,
    refreshData: loadData,
  };
}
