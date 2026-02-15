/* ================================
   Sanskar Palace Hotel & Resort
   Database Seed File
   ================================ */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed…');

  /* ---------- CLEAN DATABASE ---------- */
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "attendance_records",
      "order_items",
      "transactions",
      "users",
      "staff_members",
      "menu_items",
      "tables"
    RESTART IDENTITY CASCADE;
  `);

  console.log('✅ Database cleared');

  /* ---------- MENU ITEMS ---------- */
  const menuItems = await prisma.menuItem.createMany({
    data: [
      // VALUE COMBOS
      { name: 'Chai–Nashta Combo', category: 'Value Combos', price: 49, available: true, description: '1 Chai + 4 Veg Pakoda + Biscuits + Pickle' },
      { name: 'Poolside Snack Combo', category: 'Value Combos', price: 79, available: true, description: 'Aloo Tikki Burger + Fries + Lime Soda' },
      { name: 'Desi Dhamaka Combo', category: 'Value Combos', price: 99, available: true, description: 'Masala Maggi + Half Cheese Sandwich + Cold Drink' },
      { name: 'Budget Veg Thali', category: 'Value Combos', price: 119, available: true, description: 'Sev Tamatar + Dal + 3 Roti + Rice + Papad + Salad' },
      { name: 'Paneer Mini Meal', category: 'Value Combos', price: 125, available: true, description: 'Paneer Subzi + Jeera Rice + Raita + 2 Butter Roti' },

      // POOLSIDE CAFÉ
      { name: 'Paneer Maharaja Burger', category: 'Poolside Cafe', price: 110, available: true },
      { name: 'Cheese Lava Burger', category: 'Poolside Cafe', price: 95, available: true },
      { name: 'Veg Burger', category: 'Poolside Cafe', price: 75, available: true },
      { name: 'Aloo Tikki Burger', category: 'Poolside Cafe', price: 55, available: true },
      { name: 'Paneer Tikka Sandwich', category: 'Poolside Cafe', price: 120, available: true },
      { name: 'Club Sandwich', category: 'Poolside Cafe', price: 110, available: true },
      { name: 'Corn & Cheese Sandwich', category: 'Poolside Cafe', price: 90, available: true },
      { name: 'Bombay Masala Sandwich', category: 'Poolside Cafe', price: 65, available: true },
      { name: 'French Fries (Salted)', category: 'Poolside Cafe', price: 99, available: true },
      { name: 'French Fries (Peri Peri)', category: 'Poolside Cafe', price: 115, available: true },
      { name: 'Cheese Garlic Bread', category: 'Poolside Cafe', price: 90, available: true },
      { name: 'Masala Maggi', category: 'Poolside Cafe', price: 40, available: true },
      { name: 'Cheese Maggi', category: 'Poolside Cafe', price: 60, available: true },

      // STARTERS
      { name: 'Paneer Tikka Sizzler', category: 'Starters', price: 240, available: true },
      { name: 'Veg Sizzler', category: 'Starters', price: 210, available: true },
      { name: 'Paneer 65', category: 'Starters', price: 165, available: true },
      { name: 'Paneer Chilli Dry', category: 'Starters', price: 165, available: true },
      { name: 'Veg Lollipop', category: 'Starters', price: 140, available: true },
      { name: 'Hara Bhara Kebab', category: 'Starters', price: 140, available: true },
      { name: 'Veg Crispy', category: 'Starters', price: 150, available: true },

      // MAIN COURSE – PANEER
      { name: 'Shahi Paneer', category: 'Main Course', price: 190, available: true },
      { name: 'Paneer Butter Masala', category: 'Main Course', price: 185, available: true },
      { name: 'Paneer Tikka Masala', category: 'Main Course', price: 195, available: true },
      { name: 'Paneer Lababdar', category: 'Main Course', price: 190, available: true },
      { name: 'Paneer Angara', category: 'Main Course', price: 210, available: true },
      { name: 'Kadai Paneer', category: 'Main Course', price: 180, available: true },
      { name: 'Palak Paneer', category: 'Main Course', price: 180, available: true },
      { name: 'Hyderabadi Paneer', category: 'Main Course', price: 190, available: true },
      { name: 'Marwadi Paneer', category: 'Main Course', price: 180, available: true },

      // VEG & MALWA SPECIALS
      { name: 'Sev Tamatar', category: 'Main Course', price: 90, available: true },
      { name: 'Doodh Sev', category: 'Main Course', price: 95, available: true },
      { name: 'Lasaniya Sev', category: 'Main Course', price: 99, available: true },
      { name: 'Mix Veg', category: 'Main Course', price: 110, available: true },
      { name: 'Veg Diwani Handi', category: 'Main Course', price: 160, available: true },
      { name: 'Malai Kofta', category: 'Main Course', price: 180, available: true },
      { name: 'Kaju Curry', category: 'Main Course', price: 195, available: true },
      { name: 'Kaju Masala', category: 'Main Course', price: 190, available: true },

      // DAL
      { name: 'Dal Tadka', category: 'Main Course', price: 85, available: true },
      { name: 'Dal Makhani', category: 'Main Course', price: 170, available: true },

      // BREADS
      { name: 'Tandoori Roti', category: 'Breads', price: 10, available: true },
      { name: 'Butter Roti', category: 'Breads', price: 12, available: true },
      { name: 'Missi Roti', category: 'Breads', price: 15, available: true },
      { name: 'Plain Naan', category: 'Breads', price: 30, available: true },
      { name: 'Butter Naan', category: 'Breads', price: 40, available: true },
      { name: 'Garlic Naan', category: 'Breads', price: 60, available: true },

      // RICE
      { name: 'Plain Rice', category: 'Rice', price: 85, available: true },
      { name: 'Jeera Rice', category: 'Rice', price: 110, available: true },
      { name: 'Veg Pulao', category: 'Rice', price: 140, available: true },

      // BEVERAGES
      { name: 'Masala Chai', category: 'Beverages', price: 15, available: true },
      { name: 'Cold Coffee', category: 'Beverages', price: 60, available: true },
      { name: 'Chocolate Cold Coffee', category: 'Beverages', price: 80, available: true },
      { name: 'Sweet Lassi', category: 'Beverages', price: 60, available: true },
      { name: 'Salted Lassi', category: 'Beverages', price: 60, available: true },

      // DESSERTS
      { name: 'Gulab Jamun (2 pcs)', category: 'Desserts', price: 40, available: true },
      { name: 'Shrikhand', category: 'Desserts', price: 50, available: true },
      { name: 'Sizzling Brownie', category: 'Desserts', price: 150, available: true },
    ],
  });

  console.log(`✅ Seeded ${menuItems.count} menu items`);

  /* ---------- TABLES ---------- */
  await prisma.table.createMany({
    data: [
      { capacity: 2, status: 'EMPTY' },
      { capacity: 2, status: 'EMPTY' },
      { capacity: 4, status: 'EMPTY' },
      { capacity: 4, status: 'EMPTY' },
      { capacity: 6, status: 'EMPTY' },
      { capacity: 8, status: 'EMPTY' },
    ],
  });

  console.log('✅ Tables created');

  /* ---------- STAFF ---------- */
  await prisma.staffMember.createMany({
    data: [
      { name: 'Captain', role: 'Captain', avatar: '🧑‍🍳' },
      { name: 'Billing', role: 'Billing', avatar: '🧾' },
    ],
  });

  console.log('✅ Staff created');

  /* ---------- USERS (Authentication) ---------- */
  const ownerPassword = await bcrypt.hash('owner123', 10);
  const captainPassword = await bcrypt.hash('captain123', 10);
  const billingPassword = await bcrypt.hash('billing123', 10);

  await prisma.user.createMany({
    data: [
      {
        username: 'owner',
        email: 'owner@sanskar-restro.local',
        password: ownerPassword,
        role: 'OWNER',
        isActive: true,
      },
      {
        username: 'captain',
        email: 'captain@sanskar-restro.local',
        password: captainPassword,
        role: 'CAPTAIN',
        staffId: 1,
        isActive: true,
      },
      {
        username: 'billing',
        email: 'billing@sanskar-restro.local',
        password: billingPassword,
        role: 'BILLING',
        staffId: 2,
        isActive: true,
      },
    ],
  });

  console.log('✅ Users created (owner/owner123, captain/captain123, billing/billing123)');

  /* ---------- ATTENDANCE ---------- */
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.attendanceRecord.createMany({
    data: [
      { staffId: 1, date: today, status: 'PRESENT', checkIn: new Date() },
      { staffId: 2, date: today, status: 'PRESENT', checkIn: new Date() },
    ],
  });

  console.log('✅ Attendance marked');
  console.log('🎉 Database seeding completed successfully');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
