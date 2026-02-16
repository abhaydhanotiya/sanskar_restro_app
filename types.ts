export enum TabName {
  TABLES = 'Tables',
  MENU = 'Menu',
  KITCHEN = 'Kitchen',
  CHECKOUTS = 'Checkouts',
  ROOMS = 'Rooms',
  PROFILE = 'Profile',
}

export type UserRole = 'OWNER' | 'CAPTAIN' | 'BILLING' | 'HOTEL_MANAGER';

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
  id: number;
  staffId: number;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LEAVE' | 'LATE';
  checkIn?: string;
  checkOut?: string;
}

// --- Room Management ---

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  CHECKOUT = 'CHECKOUT',
}

export enum RoomType {
  DELUXE = 'DELUXE',
  PREMIUM_SUITE = 'PREMIUM_SUITE',
  ROYAL_SUITE = 'ROYAL_SUITE',
}

export enum BookingStatus {
  BOOKED = 'BOOKED',
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT',
  CANCELLED = 'CANCELLED',
}

export enum RoomItemCategory {
  FOOD = 'FOOD',
  AMENITY = 'AMENITY',
}

export interface Room {
  id: number;
  roomNumber: string;
  type: RoomType;
  floor: number;
  capacity: number;
  priceNonAC: number;
  priceAC: number;
  status: RoomStatus;
  currentBooking?: RoomBooking | null;
  bookings?: RoomBooking[];
}

export interface RoomBooking {
  id: number;
  roomId: number;
  guestName: string;
  guestPhone: string;
  adults: number;
  children: number;
  isAC: boolean;
  checkIn: string;
  checkOut?: string | null;
  totalAmount: number;
  pricePerNightMrp?: number | null;
  pricePerNightSelling?: number | null;
  pricePerNightBill?: number | null;
  extraGuests?: number | null;
  extraBeddingIncluded?: boolean | null;
  extraBeddingChargePerNight?: number | null;
  status: BookingStatus;
  // Billing / GST fields
  invoiceNo?: number | null;
  gstEnabled?: boolean;
  companyName?: string | null;
  companyAddressLine1?: string | null;
  companyAddressLine2?: string | null;
  customerGstin?: string | null;
  items?: RoomServiceItem[];
  room?: Room;
}

export interface RoomServiceItem {
  id: number;
  bookingId: number;
  name: string;
  category: RoomItemCategory;
  price: number;
  quantity: number;
  timestamp: string;
}
