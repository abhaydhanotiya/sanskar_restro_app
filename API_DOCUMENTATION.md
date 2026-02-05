# API Documentation

This document describes the REST API endpoints available in the Sanskar Restro application.

## Base URL
```
http://localhost:3000/api
```

## Authentication
Currently using mock authentication. In production, implement JWT or session-based authentication.

---

## Endpoints

### Authentication

#### POST `/auth/login`
Authenticate a user and get access token.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "user": {
    "name": "string",
    "role": "WAITER" | "OWNER"
  },
  "token": "string"
}
```

**Status Codes:**
- `200`: Success
- `400`: Missing credentials
- `500`: Server error

---

### Tables

#### GET `/tables`
Get all tables with their current status and orders.

**Response:**
```json
[
  {
    "id": 1,
    "capacity": 4,
    "status": "OCCUPIED" | "EMPTY" | "NEEDS_SERVICE" | "NEEDS_BILL",
    "guests": 3,
    "startTime": "18:30",
    "currentOrders": [...],
    "isTakeaway": false
  }
]
```

#### GET `/tables/:id`
Get a specific table by ID.

**Response:**
```json
{
  "id": 1,
  "capacity": 4,
  "status": "OCCUPIED",
  ...
}
```

#### PATCH `/tables/:id`
Update a table's information.

**Request Body:**
```json
{
  "status": "OCCUPIED",
  "guests": 4,
  "currentOrders": [...]
}
```

**Response:**
```json
{
  "id": 1,
  "capacity": 4,
  "status": "OCCUPIED",
  ...
}
```

#### POST `/tables`
Create a new table (typically for takeaway orders).

**Request Body:**
```json
{
  "id": 901,
  "capacity": 0,
  "status": "OCCUPIED",
  "isTakeaway": true,
  ...
}
```

**Response:**
```json
{
  "id": 901,
  ...
}
```

#### DELETE `/tables/:id`
Delete a table (used for completed takeaway orders).

**Response:**
```json
{
  "message": "Table deleted successfully"
}
```

---

### Menu

#### GET `/menu`
Get all menu items.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Butter Chicken",
    "category": "Entrees",
    "price": 18.00,
    "available": true,
    "description": "Classic tomato butter sauce."
  }
]
```

#### PATCH `/menu/:id`
Update a menu item (e.g., toggle availability).

**Request Body:**
```json
{
  "available": false
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Butter Chicken",
  "available": false,
  ...
}
```

---

### Transactions

#### GET `/transactions`
Get all transaction history.

**Response:**
```json
[
  {
    "id": "TXN-1715432001",
    "tableId": 2,
    "isTakeaway": false,
    "items": [...],
    "totalAmount": 45.50,
    "timestamp": "12:30 PM"
  }
]
```

#### POST `/transactions`
Create a new transaction (when checkout is processed).

**Request Body:**
```json
{
  "id": "TXN-1234567890",
  "tableId": 2,
  "isTakeaway": false,
  "items": [
    {
      "id": 101,
      "menuId": 1,
      "name": "Butter Chicken",
      "price": 18.00,
      "quantity": 2,
      "status": "SERVED"
    }
  ],
  "totalAmount": 36.00,
  "timestamp": "2:30 PM"
}
```

**Response:**
```json
{
  "id": "TXN-1234567890",
  ...
}
```

---

### Staff (Owner Only)

#### GET `/staff`
Get all staff members.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Sarah J.",
    "role": "Server",
    "avatar": "S"
  }
]
```

---

### Attendance (Owner Only)

#### GET `/attendance`
Get all attendance records.

**Response:**
```json
[
  {
    "staffId": 1,
    "date": "Today",
    "status": "PRESENT" | "ABSENT" | "LEAVE" | "LATE",
    "checkIn": "10:00 AM",
    "checkOut": "06:00 PM"
  }
]
```

#### POST `/attendance`
Create a new attendance record.

**Request Body:**
```json
{
  "staffId": 1,
  "date": "Today",
  "status": "PRESENT",
  "checkIn": "10:00 AM"
}
```

**Response:**
```json
{
  "staffId": 1,
  "date": "Today",
  "status": "PRESENT",
  ...
}
```

#### PATCH `/attendance`
Update an existing attendance record.

**Request Body:**
```json
{
  "staffId": 1,
  "date": "Today",
  "updates": {
    "checkOut": "06:00 PM"
  }
}
```

**Response:**
```json
{
  "staffId": 1,
  "date": "Today",
  "checkOut": "06:00 PM",
  ...
}
```

---

## Data Storage

Currently using in-memory storage (lib/db.ts). This data will reset when the server restarts.

### Migrating to a Database

To use a real database:

1. **Choose a database**: PostgreSQL, MySQL, MongoDB, etc.
2. **Install ORM/Client**: 
   - Prisma: `npm install prisma @prisma/client`
   - Drizzle: `npm install drizzle-orm`
3. **Update lib/db.ts** to use the database client
4. **Update API routes** to use async database operations

Example with Prisma:
```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

// app/api/tables/route.ts
import { prisma } from '@/lib/db'

export async function GET() {
  const tables = await prisma.table.findMany()
  return NextResponse.json(tables)
}
```

---

## Error Handling

All endpoints return errors in this format:

```json
{
  "error": "Error message description"
}
```

Common status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

---

## Future Enhancements

1. **Authentication Middleware**: Protect routes with JWT validation
2. **Rate Limiting**: Prevent API abuse
3. **Pagination**: For large data sets (transactions, history)
4. **WebSockets**: Real-time updates for kitchen orders
5. **File Uploads**: Menu item images
6. **Reporting Endpoints**: Daily/weekly/monthly sales reports
