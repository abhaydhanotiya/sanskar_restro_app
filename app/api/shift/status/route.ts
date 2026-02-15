import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get today's shift status for a user
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

    // Get user to find linked staff member
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: { staff: true },
    });

    if (!user || !user.staffId) {
      return NextResponse.json({
        hasShift: false,
        message: 'User not linked to staff member',
        hoursWorked: 0,
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's attendance record
    const record = await prisma.attendanceRecord.findFirst({
      where: {
        staffId: user.staffId,
        date: today,
      },
      include: { staff: true },
    });

    if (!record) {
      return NextResponse.json({
        hasShift: false,
        message: 'No shift today',
      });
    }

    const hoursWorked = record.checkIn && record.checkOut
      ? (record.checkOut.getTime() - record.checkIn.getTime()) / (1000 * 60 * 60)
      : record.checkIn
      ? (new Date().getTime() - record.checkIn.getTime()) / (1000 * 60 * 60)
      : 0;

    return NextResponse.json({
      hasShift: true,
      record,
      isActive: !!record.checkIn && !record.checkOut,
      hoursWorked: parseFloat(hoursWorked.toFixed(2)),
    });
  } catch (error) {
    console.error('Error fetching shift status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shift status' },
      { status: 500 }
    );
  }
}
