# Shift Management System

## Overview
The shift management system automatically tracks employee check-in and check-out times using attendance records. Staff members are automatically checked in when they log in and can check out when they end their shift via the Profile tab.

## Features

### 1. Automatic Check-In
- When a staff member (non-owner) logs in, the system automatically creates an attendance record with:
  - Current date and time as check-in
  - Status set to "PRESENT"
  - Link to the staff member

### 2. Manual Check-Out
- Staff can end their shift from the Profile tab
- Click "End Shift & Logout" button to:
  - Update attendance record with check-out time
  - Calculate total hours worked
  - Log out from the system

### 3. Shift Status Tracking
- Owner can view all staff attendance in the Owner Dashboard
- Real-time display of:
  - Who is currently working
  - Check-in time
  - Check-out time (if completed)
  - Total hours worked

### 4. Profile Stats
- Staff can view their own shift statistics:
  - Hours worked today
  - Number of orders served
  - Performance metrics

## API Endpoints

### POST /api/shift
**Purpose:** Check-in (start shift)

**Request Body:**
```json
{
  "userId": 1
}
```

**Response:**
```json
{
  "message": "Shift started successfully",
  "record": {
    "id": 123,
    "staffId": 5,
    "date": "2026-02-06T10:00:00Z",
    "status": "PRESENT",
    "checkIn": "2026-02-06T10:00:00Z",
    "checkOut": null
  }
}
```

**Notes:**
- Prevents duplicate check-ins for the same day
- Returns existing active shift if already checked in

### PATCH /api/shift
**Purpose:** Check-out (end shift)

**Request Body:**
```json
{
  "userId": 1
}
```

**Response:**
```json
{
  "message": "Shift ended successfully",
  "record": {
    "id": 123,
    "staffId": 5,
    "date": "2026-02-06T10:00:00Z",
    "status": "PRESENT",
    "checkIn": "2026-02-06T10:00:00Z",
    "checkOut": "2026-02-06T18:30:00Z"
  }
}
```

**Notes:**
- Only updates currently active shift (no check-out time)
- Returns error if no active shift found

### GET /api/shift?userId={userId}
**Purpose:** Get current shift status

**Response:**
```json
{
  "shift": {
    "id": 123,
    "staffId": 5,
    "date": "2026-02-06T10:00:00Z",
    "status": "PRESENT",
    "checkIn": "2026-02-06T10:00:00Z",
    "checkOut": null
  },
  "isActive": true
}
```

## Database Schema

### AttendanceRecord Model
```prisma
model AttendanceRecord {
  id        Int               @id @default(autoincrement())
  staffId   Int
  staff     StaffMember       @relation(fields: [staffId], references: [id])
  date      DateTime
  status    AttendanceStatus  @default(PRESENT)
  checkIn   DateTime?
  checkOut  DateTime?
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LEAVE
  LATE
}
```

## Usage Flow

### Staff Login Flow
1. User enters credentials on LoginScreen
2. System authenticates user via `/api/auth/login`
3. If user role is not 'OWNER':
   - System calls `/api/shift` (POST) to start shift
   - Attendance record created with check-in time
4. User is logged into the app
5. Toast notification: "Shift started successfully"

### Staff Logout Flow
1. User clicks "End Shift & Logout" in Profile tab
2. System calls `/api/shift` (PATCH) to end shift
3. Attendance record updated with check-out time
4. Toast notification: "Shift ended successfully"
5. User is logged out
6. Auth token cleared from localStorage

### Owner View
1. Owner logs in (no shift tracking for owners)
2. Navigate to Staff tab in Owner Dashboard
3. View real-time attendance:
   - **Today View:** Current shift status for all staff
   - **Log View:** Historical attendance records with filters

## Error Handling

### Shift Start Errors
- **No staff member linked:** Returns 404 error
- **Already checked in:** Returns existing shift record
- **Database error:** Returns 500 error

### Shift End Errors
- **No active shift:** Returns 404 error  
- **Database error:** Returns 500 error
- **Note:** User is still logged out even if shift end fails

## Components Modified

### 1. LoginScreen.tsx
- Added automatic shift start on login for non-owner users
- Handles shift start errors gracefully
- Continues login even if shift start fails

### 2. ProfileTab.tsx
- Added shift end functionality to logout button
- Shows loading state while ending shift
- Displays toast notifications for success/failure
- Takes `userId` as prop for shift API calls

### 3. MainApp.tsx
- Stores complete user object including `id`
- Passes `userId` to ProfileTab component
- Manages auth token in localStorage

### 4. OwnerDashboard.tsx
- Displays attendance records with check-in/check-out times
- Shows current shift status for each staff member
- Provides filtering by date and staff member

## API Client Updates

### New Methods
```typescript
// Start shift (check-in)
async startShift(userId: number): Promise<any>

// End shift (check-out)
async endShift(userId: number): Promise<any>

// Get current shift status
async getCurrentShift(userId: number): Promise<any>
```

### Updated Methods
```typescript
// Old signature
async updateAttendanceRecord(staffId: number, date: string, updates: any)

// New signature (uses record ID directly)
async updateAttendanceRecord(recordId: number, updates: any)
```

## Translations Added

### English
- `shiftEnded`: "Shift ended successfully"
- `shiftEndFailed`: "Failed to end shift"
- `endingShift`: "Ending Shift..."
- `shiftStarted`: "Shift started successfully"

### Hindi (हिंदी)
- `shiftEnded`: "शिफ्ट सफलतापूर्वक समाप्त हुई"
- `shiftEndFailed`: "शिफ्ट समाप्त करने में विफल"
- `endingShift`: "शिफ्ट समाप्त हो रही है..."
- `shiftStarted`: "शिफ्ट सफलतापूर्वक शुरू हुई"

## Benefits

1. **Automatic Tracking:** No manual intervention needed for check-in
2. **Accurate Records:** Timestamp-based attendance tracking
3. **Performance Metrics:** Real-time calculation of hours worked
4. **Owner Visibility:** Complete overview of staff attendance
5. **Error Resilient:** Continues operation even if shift tracking fails
6. **User Friendly:** Simple one-click logout with automatic check-out
7. **Audit Trail:** Complete history of all shift records

## Future Enhancements

- Manual check-in/check-out buttons (override automatic behavior)
- Break time tracking
- Overtime calculations
- Late arrival detection and marking
- Push notifications for shift reminders
- Shift scheduling and planning
- Export attendance reports
- Monthly attendance summaries
