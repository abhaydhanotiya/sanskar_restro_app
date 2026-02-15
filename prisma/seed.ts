// @ts-nocheck
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({});

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.roomServiceItem.deleteMany();
  await prisma.roomBooking.deleteMany();
  await prisma.room.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.staffMember.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.table.deleteMany();

  console.log('✅ Cleared existing data');

  // Seed Menu Items
  const menuItems = await prisma.menuItem.createMany({
    data: [
      { id: 1, name: "Butter Chicken", category: "Entrees", price: 18.00, available: true, description: "Classic tomato butter sauce." },
      { id: 2, name: "Garlic Naan", category: "Sides", price: 4.50, available: true, description: "Freshly baked in tandoor." },
      { id: 3, name: "Paneer Tikka", category: "Appetizers", price: 12.00, available: true, description: "Grilled cottage cheese cubes." },
      { id: 4, name: "Mango Lassi", category: "Drinks", price: 5.00, available: true, description: "Sweet yogurt drink." },
      { id: 5, name: "Lamb Rogan Josh", category: "Entrees", price: 20.00, available: false, description: "Slow cooked lamb curry." },
      { id: 6, name: "Vegetable Samosa", category: "Appetizers", price: 6.00, available: true, description: "Crispy pastry with potatoes." },
      { id: 7, name: "Dal Makhani", category: "Entrees", price: 15.00, available: true, description: "Creamy black lentils." },
      { id: 8, name: "Masala Chai", category: "Drinks", price: 3.50, available: true, description: "Spiced Indian tea." },
    ],
  });
  console.log(`✅ Created ${menuItems.count} menu items`);

  // Seed Tables
  const tables = await prisma.table.createMany({
    data: [
      { id: 1, capacity: 4, status: 'OCCUPIED', guests: 3, startTime: new Date('2024-01-01T18:30:00') },
      { id: 2, capacity: 2, status: 'EMPTY' },
      { id: 3, capacity: 6, status: 'NEEDS_SERVICE', guests: 5, startTime: new Date('2024-01-01T19:00:00') },
      { id: 4, capacity: 4, status: 'NEEDS_BILL', guests: 2, startTime: new Date('2024-01-01T18:15:00') },
      { id: 5, capacity: 2, status: 'EMPTY' },
      { id: 6, capacity: 8, status: 'OCCUPIED', guests: 7, startTime: new Date('2024-01-01T19:10:00') },
      { id: 7, capacity: 4, status: 'EMPTY' },
      { id: 8, capacity: 4, status: 'NEEDS_SERVICE', guests: 4, startTime: new Date('2024-01-01T18:45:00') },
    ],
  });
  console.log(`✅ Created ${tables.count} tables`);

  // Seed Order Items for Table 1
  await prisma.orderItem.createMany({
    data: [
      { id: 101, tableId: 1, menuId: 1, name: "Butter Chicken", price: 18.00, quantity: 2, status: 'SERVED', modifications: "Spicy" },
      { id: 102, tableId: 1, menuId: 2, name: "Garlic Naan", price: 4.50, quantity: 3, status: 'SERVED' },
      { id: 103, tableId: 1, menuId: 4, name: "Mango Lassi", price: 5.00, quantity: 3, status: 'PREPARING' },
      { id: 104, tableId: 1, menuId: 1, name: "Extra Rice", price: 3.00, quantity: 1, status: 'VOID', modifications: "Customer changed mind" },
    ],
  });

  // Seed Order Items for Table 6
  await prisma.orderItem.createMany({
    data: [
      { id: 201, tableId: 6, menuId: 6, name: "Vegetable Samosa", price: 6.00, quantity: 4, status: 'PREPARING' },
      { id: 202, tableId: 6, menuId: 8, name: "Masala Chai", price: 3.50, quantity: 7, status: 'PREPARING', modifications: "Less sugar" },
    ],
  });
  console.log('✅ Created order items');

  // Seed Staff Members
  const staff = await prisma.staffMember.createMany({
    data: [
      { id: 1, name: "Rahul Kumar", role: "Waiter", avatar: "👨‍🍳" },
      { id: 2, name: "Priya Sharma", role: "Waitress", avatar: "👩‍🍳" },
      { id: 3, name: "Amit Patel", role: "Chef", avatar: "👨‍🍳" },
      { id: 4, name: "Neha Singh", role: "Manager", avatar: "👩‍💼" },
    ],
  });
  console.log(`✅ Created ${staff.count} staff members`);

  // Seed Attendance Records
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  await prisma.attendanceRecord.createMany({
    data: [
      { staffId: 1, date: today, status: 'PRESENT', checkIn: new Date('2024-01-01T09:00:00'), checkOut: new Date('2024-01-01T17:00:00') },
      { staffId: 2, date: today, status: 'PRESENT', checkIn: new Date('2024-01-01T09:15:00') },
      { staffId: 3, date: today, status: 'LATE', checkIn: new Date('2024-01-01T10:30:00') },
      { staffId: 4, date: today, status: 'ABSENT' },
    ],
  });
  console.log('✅ Created attendance records');

  // Seed Rooms (36 total)
  // 32 Deluxe: 16 non-AC @₹1200, 16 AC @₹1500
  // 2 Premium Suite (108, 109): non-AC @₹1500, AC @₹1800
  // 2 Royal Suite (219, 220): non-AC @₹2000, AC @₹2500
  const roomsData = [
    // Ground Floor — 1 Deluxe
    { roomNumber: '001', type: 'DELUXE', floor: 0, capacity: 2, isAC: false, pricePerNight: 1200 },
    // Floor 1 — 101-115 (13 Deluxe + 2 Premium Suite)
    { roomNumber: '101', type: 'DELUXE', floor: 1, capacity: 2, isAC: false, pricePerNight: 1200 },
    { roomNumber: '102', type: 'DELUXE', floor: 1, capacity: 2, isAC: false, pricePerNight: 1200 },
    { roomNumber: '103', type: 'DELUXE', floor: 1, capacity: 2, isAC: false, pricePerNight: 1200 },
    { roomNumber: '104', type: 'DELUXE', floor: 1, capacity: 2, isAC: false, pricePerNight: 1200 },
    { roomNumber: '105', type: 'DELUXE', floor: 1, capacity: 2, isAC: false, pricePerNight: 1200 },
    { roomNumber: '106', type: 'DELUXE', floor: 1, capacity: 2, isAC: false, pricePerNight: 1200 },
    { roomNumber: '107', type: 'DELUXE', floor: 1, capacity: 2, isAC: false, pricePerNight: 1200 },
    { roomNumber: '108', type: 'PREMIUM_SUITE', floor: 1, capacity: 3, isAC: false, pricePerNight: 1500 },
    { roomNumber: '109', type: 'PREMIUM_SUITE', floor: 1, capacity: 3, isAC: true,  pricePerNight: 1800 },
    { roomNumber: '110', type: 'DELUXE', floor: 1, capacity: 2, isAC: true,  pricePerNight: 1500 },
    { roomNumber: '111', type: 'DELUXE', floor: 1, capacity: 2, isAC: true,  pricePerNight: 1500 },
    { roomNumber: '112', type: 'DELUXE', floor: 1, capacity: 2, isAC: true,  pricePerNight: 1500 },
    { roomNumber: '113', type: 'DELUXE', floor: 1, capacity: 2, isAC: true,  pricePerNight: 1500 },
    { roomNumber: '114', type: 'DELUXE', floor: 1, capacity: 2, isAC: true,  pricePerNight: 1500 },
    { roomNumber: '115', type: 'DELUXE', floor: 1, capacity: 2, isAC: true,  pricePerNight: 1500 },
    // Floor 2 — 201-220 (18 Deluxe + 2 Royal Suite)
    { roomNumber: '201', type: 'DELUXE', floor: 2, capacity: 2, isAC: false, pricePerNight: 1200 },
    { roomNumber: '202', type: 'DELUXE', floor: 2, capacity: 2, isAC: false, pricePerNight: 1200 },
    { roomNumber: '203', type: 'DELUXE', floor: 2, capacity: 2, isAC: false, pricePerNight: 1200 },
    { roomNumber: '204', type: 'DELUXE', floor: 2, capacity: 2, isAC: false, pricePerNight: 1200 },
    { roomNumber: '205', type: 'DELUXE', floor: 2, capacity: 2, isAC: false, pricePerNight: 1200 },
    { roomNumber: '206', type: 'DELUXE', floor: 2, capacity: 2, isAC: false, pricePerNight: 1200 },
    { roomNumber: '207', type: 'DELUXE', floor: 2, capacity: 2, isAC: false, pricePerNight: 1200 },
    { roomNumber: '208', type: 'DELUXE', floor: 2, capacity: 2, isAC: false, pricePerNight: 1200 },
    { roomNumber: '209', type: 'DELUXE', floor: 2, capacity: 2, isAC: true,  pricePerNight: 1500 },
    { roomNumber: '210', type: 'DELUXE', floor: 2, capacity: 2, isAC: true,  pricePerNight: 1500 },
    { roomNumber: '211', type: 'DELUXE', floor: 2, capacity: 2, isAC: true,  pricePerNight: 1500 },
    { roomNumber: '212', type: 'DELUXE', floor: 2, capacity: 2, isAC: true,  pricePerNight: 1500 },
    { roomNumber: '213', type: 'DELUXE', floor: 2, capacity: 2, isAC: true,  pricePerNight: 1500 },
    { roomNumber: '214', type: 'DELUXE', floor: 2, capacity: 2, isAC: true,  pricePerNight: 1500 },
    { roomNumber: '215', type: 'DELUXE', floor: 2, capacity: 2, isAC: true,  pricePerNight: 1500 },
    { roomNumber: '216', type: 'DELUXE', floor: 2, capacity: 2, isAC: true,  pricePerNight: 1500 },
    { roomNumber: '217', type: 'DELUXE', floor: 2, capacity: 2, isAC: true,  pricePerNight: 1500 },
    { roomNumber: '218', type: 'DELUXE', floor: 2, capacity: 2, isAC: true,  pricePerNight: 1500 },
    { roomNumber: '219', type: 'ROYAL_SUITE', floor: 2, capacity: 4, isAC: false, pricePerNight: 2000 },
    { roomNumber: '220', type: 'ROYAL_SUITE', floor: 2, capacity: 4, isAC: true,  pricePerNight: 2500 },
  ];
  const rooms = await prisma.room.createMany({ data: roomsData as any });
  console.log(`✅ Created ${rooms.count} rooms`);

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
