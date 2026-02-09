import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Start shift - create attendance record with check-in time
export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Get user to find linked staff member
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { staff: true },
    });

    if (!user || !user.staffId) {
      return NextResponse.json(
        { error: 'User not linked to staff member' },
        { status: 404 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existingRecord = await prisma.attendanceRecord.findFirst({
      where: {
        staffId: user.staffId,
        date: today,
      },
    });

    if (existingRecord && existingRecord.checkIn) {
      return NextResponse.json({
        record: existingRecord,
        message: 'Already checked in today',
      });
    }

    const checkInTime = new Date();

    // Create or update attendance record
    const record = existingRecord
      ? await prisma.attendanceRecord.update({
          where: { id: existingRecord.id },
          data: {
            checkIn: checkInTime,
            status: 'PRESENT',
          },
          include: { staff: true },
        })
      : await prisma.attendanceRecord.create({
          data: {
            staffId: user.staffId,
            date: today,
            checkIn: checkInTime,
            status: 'PRESENT',
          },
          include: { staff: true },
        });

    return NextResponse.json({
      record,
      message: 'Shift started successfully',
    });
  } catch (error) {
    console.error('Error starting shift:', error);
    return NextResponse.json(
      { error: 'Failed to start shift' },
      { status: 500 }
    );
  }
}
