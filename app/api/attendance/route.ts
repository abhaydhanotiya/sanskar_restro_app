import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const attendance = await prisma.attendanceRecord.findMany({
      include: {
        staff: true,
      },
    });
    return NextResponse.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const record = await request.json();
    const newRecord = await prisma.attendanceRecord.create({
      data: record,
      include: {
        staff: true,
      },
    });
    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error('Error creating attendance record:', error);
    return NextResponse.json({ error: 'Failed to create attendance record' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, updates } = await request.json();
    const updatedRecord = await prisma.attendanceRecord.update({
      where: { id },
      data: updates,
      include: {
        staff: true,
      },
    });
    
    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error('Error updating attendance record:', error);
    return NextResponse.json({ error: 'Failed to update attendance record' }, { status: 500 });
  }
}
