export enum TabName {
  TABLES = 'Tables',
  MENU = 'Menu',
  KITCHEN = 'Kitchen',
  CHECKOUTS = 'Checkouts',
  PROFILE = 'Profile',
}

export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'STAFF';

export interface User {
  id: number;
  username: string;
  name?: string;
  role: UserRole;
  email?: string;
  avatar?: string;
}

export enum TableStatus {
  EMPTY = 'EMPTY',
  OCCUPIED = 'OCCUPIED',
  NEEDS_SERVICE = 'NEEDS_SERVICE',
  NEEDS_BILL = 'NEEDS_BILL',
}

export enum OrderStatus {
  ORDERING = 'ORDERING', // Draft status (in cart, not sent to kitchen)
  PREPARING = 'PREPARING',
  READY = 'READY',       // Prepared by chef, waiting for waiter
  SERVED = 'SERVED',
  VOID = 'VOID',
}

export interface OrderItem {
  id: number;
  menuId: number; // Reference to MenuItem
  name: string;
  price: number;
  quantity: number;
  status: OrderStatus;
  modifications?: string;
}

export interface Table {
  id: number;
  capacity: number;
  status: TableStatus;
  guests?: number;
  startTime?: string;
  currentOrders?: OrderItem[];
  isTakeaway?: boolean; // New flag for manual orders
}

export interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  available: boolean;
  description?: string;
}

export interface Bill {
  tableId: number;
  totalDue: number;
  timeRequested: string;
}

export interface Transaction {
  id: string;
  tableId: number;
  isTakeaway?: boolean;
  items: OrderItem[];
  totalAmount: number;
  timestamp: string;
}

export interface UserStats {
  hoursWorked: number;
  tips: number;
  ordersServed: number;
}

export interface StaffMember {
  id: number;
  name: string;
  role: string;
  avatar: string;
}

export interface AttendanceRecord {
  staffId: number;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LEAVE' | 'LATE';
  checkIn?: string;
  checkOut?: string;
}
