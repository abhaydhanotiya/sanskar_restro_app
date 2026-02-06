import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Check-in: Start shift
export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Get user with staff info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { staff: true },
    });

    if (!user || !user.staffId) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }

    // Check if there's already an active shift (no checkout) today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingShift = await prisma.attendanceRecord.findFirst({
      where: {
        staffId: user.staffId,
        date: {
          gte: today,
          lt: tomorrow,
        },
        checkOut: null,
      },
    });

    if (existingShift) {
      return NextResponse.json({
        message: 'Shift already started',
        record: existingShift,
      });
    }

    // Create new attendance record with check-in
    const newRecord = await prisma.attendanceRecord.create({
      data: {
        staffId: user.staffId,
        date: new Date(),
        status: 'PRESENT',
        checkIn: new Date(),
      },
      include: {
        staff: true,
      },
    });

    return NextResponse.json({
      message: 'Shift started successfully',
      record: newRecord,
    }, { status: 201 });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { error: 'Failed to start shift' },
      { status: 500 }
    );
  }
}

// Check-out: End shift
export async function PATCH(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Get user with staff info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { staff: true },
    });

    if (!user || !user.staffId) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }

    // Find today's active shift (no checkout)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const activeShift = await prisma.attendanceRecord.findFirst({
      where: {
        staffId: user.staffId,
        date: {
          gte: today,
          lt: tomorrow,
        },
        checkOut: null,
      },
    });

    if (!activeShift) {
      return NextResponse.json(
        { error: 'No active shift found' },
        { status: 404 }
      );
    }

    // Update with check-out time
    const updatedRecord = await prisma.attendanceRecord.update({
      where: { id: activeShift.id },
      data: {
        checkOut: new Date(),
      },
      include: {
        staff: true,
      },
    });

    return NextResponse.json({
      message: 'Shift ended successfully',
      record: updatedRecord,
    });
  } catch (error) {
    console.error('Check-out error:', error);
    return NextResponse.json(
      { error: 'Failed to end shift' },
      { status: 500 }
    );
  }
}

// Get current shift status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Get user with staff info
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: { staff: true },
    });

    if (!user || !user.staffId) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }

    // Find today's shift
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const currentShift = await prisma.attendanceRecord.findFirst({
      where: {
        staffId: user.staffId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        staff: true,
      },
    });

    return NextResponse.json({
      shift: currentShift,
      isActive: currentShift ? !currentShift.checkOut : false,
    });
  } catch (error) {
    console.error('Get shift error:', error);
    return NextResponse.json(
      { error: 'Failed to get shift status' },
      { status: 500 }
    );
  }
}
