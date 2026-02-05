import { Bill, MenuItem, Table, TableStatus, OrderStatus, UserStats, Transaction, StaffMember, AttendanceRecord } from "./types";

export const MOCK_TABLES: Table[] = [
  { 
    id: 1, 
    capacity: 4, 
    status: TableStatus.OCCUPIED, 
    guests: 3, 
    startTime: "18:30",
    currentOrders: [
      { id: 101, menuId: 1, name: "Butter Chicken", price: 18.00, quantity: 2, status: OrderStatus.SERVED, modifications: "Spicy" },
      { id: 102, menuId: 2, name: "Garlic Naan", price: 4.50, quantity: 3, status: OrderStatus.SERVED },
      { id: 103, menuId: 4, name: "Mango Lassi", price: 5.00, quantity: 3, status: OrderStatus.PREPARING },
      { id: 104, menuId: 99, name: "Extra Rice", price: 3.00, quantity: 1, status: OrderStatus.VOID, modifications: "Customer changed mind" }
    ]
  },
  { id: 2, capacity: 2, status: TableStatus.EMPTY },
  { id: 3, capacity: 6, status: TableStatus.NEEDS_SERVICE, guests: 5, startTime: "19:00" },
  { id: 4, capacity: 4, status: TableStatus.NEEDS_BILL, guests: 2, startTime: "18:15" },
  { id: 5, capacity: 2, status: TableStatus.EMPTY },
  { 
    id: 6, 
    capacity: 8, 
    status: TableStatus.OCCUPIED, 
    guests: 7, 
    startTime: "19:10",
    currentOrders: [
      { id: 201, menuId: 6, name: "Vegetable Samosa", price: 6.00, quantity: 4, status: OrderStatus.PREPARING },
      { id: 202, menuId: 8, name: "Masala Chai", price: 3.50, quantity: 7, status: OrderStatus.PREPARING, modifications: "Less sugar" }
    ]
  },
  { id: 7, capacity: 4, status: TableStatus.EMPTY },
  { id: 8, capacity: 4, status: TableStatus.NEEDS_SERVICE, guests: 4, startTime: "18:45" },
];

export const MOCK_MENU: MenuItem[] = [
  { id: 1, name: "Butter Chicken", category: "Entrees", price: 18.00, available: true, description: "Classic tomato butter sauce." },
  { id: 2, name: "Garlic Naan", category: "Sides", price: 4.50, available: true, description: "Freshly baked in tandoor." },
  { id: 3, name: "Paneer Tikka", category: "Appetizers", price: 12.00, available: true, description: "Grilled cottage cheese cubes." },
  { id: 4, name: "Mango Lassi", category: "Drinks", price: 5.00, available: true, description: "Sweet yogurt drink." },
  { id: 5, name: "Lamb Rogan Josh", category: "Entrees", price: 20.00, available: false, description: "Slow cooked lamb curry." },
  { id: 6, name: "Vegetable Samosa", category: "Appetizers", price: 6.00, available: true, description: "Crispy pastry with potatoes." },
  { id: 7, name: "Dal Makhani", category: "Entrees", price: 15.00, available: true, description: "Creamy black lentils." },
  { id: 8, name: "Masala Chai", category: "Drinks", price: 3.50, available: true, description: "Spiced Indian tea." },
];

export const MOCK_BILLS: Bill[] = [
  { tableId: 4, totalDue: 85.50, timeRequested: "19:45" },
  { tableId: 10, totalDue: 120.00, timeRequested: "19:50" },
];

export const MOCK_HISTORY: Transaction[] = [
  {
    id: "TXN-1715432001",
    tableId: 2,
    totalAmount: 45.50,
    timestamp: "12:30 PM",
    items: [
      { id: 901, menuId: 1, name: "Butter Chicken", price: 18.00, quantity: 1, status: OrderStatus.SERVED },
      { id: 902, menuId: 2, name: "Garlic Naan", price: 4.50, quantity: 2, status: OrderStatus.SERVED },
      { id: 903, menuId: 4, name: "Mango Lassi", price: 5.00, quantity: 2, status: OrderStatus.SERVED },
    ]
  },
  {
    id: "TXN-1715435500",
    tableId: 901,
    isTakeaway: true,
    totalAmount: 12.00,
    timestamp: "1:15 PM",
    items: [
      { id: 905, menuId: 3, name: "Paneer Tikka", price: 12.00, quantity: 1, status: OrderStatus.SERVED },
    ]
  },
  {
    id: "TXN-1715421100",
    tableId: 5,
    totalAmount: 32.00,
    timestamp: "Yesterday",
    items: [
      { id: 801, menuId: 5, name: "Lamb Rogan Josh", price: 20.00, quantity: 1, status: OrderStatus.SERVED },
      { id: 802, menuId: 3, name: "Paneer Tikka", price: 12.00, quantity: 1, status: OrderStatus.SERVED },
    ]
  }
];

export const MOCK_STATS: UserStats = {
  hoursWorked: 5.5,
  tips: 145.00,
  ordersServed: 32,
};

export const MOCK_STAFF: StaffMember[] = [
  { id: 1, name: "Sarah J.", role: "Server", avatar: "S" },
  { id: 2, name: "Rahul K.", role: "Chef", avatar: "R" },
  { id: 3, name: "Amit B.", role: "Server", avatar: "A" },
  { id: 4, name: "Priya M.", role: "Manager", avatar: "P" },
  { id: 5, name: "John D.", role: "Server", avatar: "J" },
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { staffId: 1, date: "Today", status: "PRESENT", checkIn: "10:00 AM" },
  { staffId: 2, date: "Today", status: "PRESENT", checkIn: "09:30 AM" },
  { staffId: 3, date: "Today", status: "LATE", checkIn: "10:45 AM" },
  { staffId: 4, date: "Today", status: "LEAVE" },
  { staffId: 5, date: "Today", status: "ABSENT" },
  // History Logs
  { staffId: 1, date: "Yesterday", status: "PRESENT", checkIn: "09:55 AM", checkOut: "06:00 PM" },
  { staffId: 2, date: "Yesterday", status: "PRESENT", checkIn: "09:15 AM", checkOut: "05:30 PM" },
  { staffId: 3, date: "Yesterday", status: "ABSENT" },
  { staffId: 1, date: "2 days ago", status: "PRESENT", checkIn: "10:00 AM", checkOut: "06:00 PM" },
];

export const MENU_CATEGORIES = ["All", "Appetizers", "Entrees", "Sides", "Drinks"];
