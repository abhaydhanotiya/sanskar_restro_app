# Application Architecture

## Overview
This is a **fully dynamic** restaurant management application using Next.js, Prisma, and PostgreSQL. All data is stored in and retrieved from a real database - no hardcoded data is used in production.

## Data Flow Architecture

```
Frontend Components → API Routes → Prisma ORM → PostgreSQL Database
```

### 1. Database Layer (PostgreSQL + Prisma)

**Location:** `prisma/schema.prisma`

All data is stored in PostgreSQL with the following models:
- `User` - Authentication and user management
- `Table` - Restaurant tables with status and orders
- `MenuItem` - Menu items (food and drinks)
- `OrderItem` - Individual order items linked to tables
- `Transaction` - Completed checkout records
- `StaffMember` - Staff information
- `AttendanceRecord` - Shift tracking with check-in/check-out

**Database Connection:** `lib/prisma.ts`
```typescript
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
```

### 2. API Layer (Next.js API Routes)

**Location:** `app/api/`

All CRUD operations go through RESTful API endpoints:

#### Authentication
- `POST /api/auth/login` - User login with JWT token generation
- `GET /api/auth/users` - Get all users (admin)
- `PATCH /api/auth/users/[id]` - Update user

#### Tables Management
- `GET /api/tables` - Get all tables
- `GET /api/tables/[id]` - Get specific table
- `PATCH /api/tables/[id]` - Update table (status, guests, orders)
- `POST /api/tables` - Create new table
- `DELETE /api/tables/[id]` - Delete table

#### Menu Management
- `GET /api/menu` - Get all menu items
- `GET /api/menu/[id]` - Get specific menu item
- `PATCH /api/menu/[id]` - Update menu item (price, availability)

#### Transactions
- `GET /api/transactions` - Get all transaction history
- `POST /api/transactions` - Create transaction (checkout)

#### Staff Management
- `GET /api/staff` - Get all staff members

#### Attendance & Shifts
- `GET /api/attendance` - Get all attendance records
- `POST /api/attendance` - Create attendance record
- `PATCH /api/attendance` - Update attendance record
- `POST /api/shift` - Start shift (check-in)
- `PATCH /api/shift` - End shift (check-out)
- `GET /api/shift?userId={id}` - Get current shift status

### 3. Client Layer (API Client)

**Location:** `lib/api-client.ts`

Centralized HTTP client for all API calls:
```typescript
class ApiClient {
  async getTables()
  async updateTable(id, updates)
  async getMenu()
  async getTransactions()
  async createTransaction(transaction)
  async getStaff()
  async getAttendance()
  async startShift(userId)
  async endShift(userId)
  // ... etc
}

export const apiClient = new ApiClient();
```

### 4. State Management Layer

#### React Context Providers

**TablesContext** (`contexts/TablesContext.tsx`)
- Manages table state and operations
- Fetches data from `/api/tables` and `/api/transactions`
- Provides methods: `updateTable`, `addOrderItem`, `sendToKitchen`, `processCheckout`

**LanguageContext** (`contexts/LanguageContext.tsx`)
- Manages English/Hindi language switching
- Stores preference in localStorage

**ToastContext** (`contexts/ToastContext.tsx`)
- Global notification system

#### Custom Hooks

**useOwnerData** (`hooks/useOwnerData.ts`)
- Fetches staff, attendance, and transaction data
- Used by Owner Dashboard
- Auto-refreshes on mount

**useMenu** (`hooks/useMenu.ts`)
- Fetches and manages menu items
- Provides menu update functionality

### 5. Component Layer

All components use the contexts and hooks above - **no hardcoded data**.

#### Main Components
- `MainApp.tsx` - App router (login/owner/staff views)
- `LoginScreen.tsx` - Authentication + auto shift start
- `OwnerDashboard.tsx` - Owner view with real-time stats
- `TablesTab.tsx` - Table management with live updates
- `MenuTab.tsx` - Menu browsing and ordering
- `KitchenTab.tsx` - Kitchen order queue
- `CheckoutsTab.tsx` - Bill processing
- `ProfileTab.tsx` - Staff profile + shift end

## Constants File

**Location:** `constants.ts`

This file **ONLY** contains:
- `MENU_CATEGORIES` - UI filter labels (["All", "Appetizers", "Entrees", "Sides", "Drinks"])
- Mock data exports (legacy, **NOT USED** in the application)

The MOCK_ exports exist for reference but are **completely unused** in the actual app.

## Data Flow Examples

### Example 1: Loading Tables
```
TablesTab Component
  ↓
TablesContext.loadInitialData()
  ↓
apiClient.getTables()
  ↓
GET /api/tables
  ↓
prisma.table.findMany()
  ↓
PostgreSQL Database
  ↓
Returns Table[] to component
```

### Example 2: Staff Login & Shift Start
```
LoginScreen Component
  ↓
apiClient.login(username, password)
  ↓
POST /api/auth/login
  ↓
prisma.user.findUnique() + verify password
  ↓
Returns user + JWT token
  ↓
apiClient.startShift(userId)
  ↓
POST /api/shift
  ↓
prisma.attendanceRecord.create()
  ↓
Creates shift record in database
```

### Example 3: Processing Checkout
```
CheckoutsTab Component
  ↓
TablesContext.processCheckout(tableId)
  ↓
apiClient.createTransaction()
  ↓
POST /api/transactions
  ↓
prisma.transaction.create() + prisma.table.update()
  ↓
Saves to database and clears table
```

## Key Features

### ✅ Fully Dynamic
- All data is stored in PostgreSQL database
- No in-memory storage or hardcoded data
- Real-time synchronization between users

### ✅ RESTful API Architecture
- Clean separation of concerns
- Reusable API endpoints
- Error handling at every layer

### ✅ Type Safety
- TypeScript throughout
- Prisma-generated types
- Compile-time error checking

### ✅ Authentication & Authorization
- JWT-based authentication
- Role-based access control (OWNER, MANAGER, STAFF)
- Secure password hashing with bcrypt

### ✅ Automatic Shift Tracking
- Auto check-in on login
- Manual check-out on logout
- Real-time attendance monitoring

## Environment Setup

### Required Environment Variables (.env)
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/sanskar_restro"
JWT_SECRET="your-secret-key-here"
```

### Database Migrations
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

## Development vs Production

### Development
- Uses `/api/*` routes on localhost:3000
- Data persists in PostgreSQL database
- Hot reload enabled

### Production
- Same API routes (serverless functions on Vercel)
- PostgreSQL database (hosted separately)
- All data fully persistent

## No Hardcoded Data ✅

The following data types are **100% dynamic** from database:
- ✅ Tables and their status
- ✅ Menu items (name, price, availability)
- ✅ Orders and order items
- ✅ Transactions (checkout history)
- ✅ Staff members
- ✅ Attendance records
- ✅ User accounts and authentication
- ✅ Shift tracking (check-in/check-out)

The only static data:
- UI labels and translations (English/Hindi)
- Menu category names for filtering
- Application configuration

## Summary

Your application is **fully production-ready** with a complete database-driven architecture. Every piece of data visible to users comes from and is saved to the PostgreSQL database through Prisma ORM.
