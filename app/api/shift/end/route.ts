import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// End shift - update attendance record with check-out time
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

    // Find today's attendance record
    const record = await prisma.attendanceRecord.findFirst({
      where: {
        staffId: user.staffId,
        date: today,
      },
    });

    if (!record) {
      return NextResponse.json(
        { error: 'No active shift found for today' },
        { status: 404 }
      );
    }

    if (record.checkOut) {
      return NextResponse.json({
        record,
        message: 'Already checked out',
      });
    }

    const checkOutTime = new Date();

    // Update attendance record with check-out time
    const updatedRecord = await prisma.attendanceRecord.update({
      where: { id: record.id },
      data: {
        checkOut: checkOutTime,
      },
      include: { staff: true },
    });

    return NextResponse.json({
      record: updatedRecord,
      message: 'Shift ended successfully',
    });
  } catch (error) {
    console.error('Error ending shift:', error);
    return NextResponse.json(
      { error: 'Failed to end shift' },
      { status: 500 }
    );
  }
}
