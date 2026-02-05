import { Table, MenuItem, Transaction, StaffMember, AttendanceRecord } from '@/types';
import { MOCK_TABLES, MOCK_MENU, MOCK_HISTORY, MOCK_STAFF, MOCK_ATTENDANCE } from '@/constants';

// In-memory database (replace with actual database in production)
class Database {
  private tables: Table[] = [...MOCK_TABLES];
  private menu: MenuItem[] = [...MOCK_MENU];
  private transactions: Transaction[] = [...MOCK_HISTORY];
  private staff: StaffMember[] = [...MOCK_STAFF];
  private attendance: AttendanceRecord[] = [...MOCK_ATTENDANCE];

  // Tables
  getTables() {
    return this.tables;
  }

  getTable(id: number) {
    return this.tables.find(t => t.id === id);
  }

  updateTable(id: number, updates: Partial<Table>) {
    const index = this.tables.findIndex(t => t.id === id);
    if (index !== -1) {
      this.tables[index] = { ...this.tables[index], ...updates };
      return this.tables[index];
    }
    return null;
  }

  addTable(table: Table) {
    this.tables.push(table);
    return table;
  }

  deleteTable(id: number) {
    const index = this.tables.findIndex(t => t.id === id);
    if (index !== -1) {
      this.tables.splice(index, 1);
      return true;
    }
    return false;
  }

  // Menu
  getMenu() {
    return this.menu;
  }

  getMenuItem(id: number) {
    return this.menu.find(m => m.id === id);
  }

  updateMenuItem(id: number, updates: Partial<MenuItem>) {
    const index = this.menu.findIndex(m => m.id === id);
    if (index !== -1) {
      this.menu[index] = { ...this.menu[index], ...updates };
      return this.menu[index];
    }
    return null;
  }

  // Transactions
  getTransactions() {
    return this.transactions;
  }

  addTransaction(transaction: Transaction) {
    this.transactions.unshift(transaction);
    return transaction;
  }

  // Staff
  getStaff() {
    return this.staff;
  }

  getStaffMember(id: number) {
    return this.staff.find(s => s.id === id);
  }

  // Attendance
  getAttendance() {
    return this.attendance;
  }

  addAttendanceRecord(record: AttendanceRecord) {
    this.attendance.unshift(record);
    return record;
  }

  updateAttendanceRecord(staffId: number, date: string, updates: Partial<AttendanceRecord>) {
    const index = this.attendance.findIndex(a => a.staffId === staffId && a.date === date);
    if (index !== -1) {
      this.attendance[index] = { ...this.attendance[index], ...updates };
      return this.attendance[index];
    }
    return null;
  }
}

// Export singleton instance
export const db = new Database();
