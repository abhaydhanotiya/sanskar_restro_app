import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all maintenance logs (sorted by newest first)
export async function GET() {
  try {
    const logs = await prisma.roomMaintenanceLog.findMany({
      include: {
        room: {
          select: { roomNumber: true },
        },
      },
      orderBy: { reportedAt: 'desc' },
    });

    const mapped = logs.map(log => ({
      id: log.id,
      roomId: log.roomId,
      roomNumber: log.room.roomNumber,
      issue: log.issue,
      notes: log.notes,
      status: log.status,
      reportedAt: log.reportedAt.toISOString(),
      resolvedAt: log.resolvedAt?.toISOString() ?? null,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Error fetching maintenance logs:', error);
    return NextResponse.json({ error: 'Failed to fetch maintenance logs' }, { status: 500 });
  }
}

// POST — Report a new maintenance issue
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomId, issue, notes } = body;

    if (!roomId || !issue) {
      return NextResponse.json({ error: 'roomId and issue are required' }, { status: 400 });
    }

    const log = await prisma.roomMaintenanceLog.create({
      data: {
        roomId,
        issue,
        notes: notes ?? null,
        status: 'OPEN',
      },
      include: {
        room: { select: { roomNumber: true } },
      },
    });

    return NextResponse.json({
      id: log.id,
      roomId: log.roomId,
      roomNumber: log.room.roomNumber,
      issue: log.issue,
      notes: log.notes,
      status: log.status,
      reportedAt: log.reportedAt.toISOString(),
      resolvedAt: null,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating maintenance log:', error);
    return NextResponse.json({ error: 'Failed to report issue' }, { status: 500 });
  }
}

// PATCH — Update maintenance log status
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status are required' }, { status: 400 });
    }

    const updateData: any = { status };
    if (status === 'RESOLVED') {
      updateData.resolvedAt = new Date();
    }

    const log = await prisma.roomMaintenanceLog.update({
      where: { id },
      data: updateData,
      include: {
        room: { select: { roomNumber: true } },
      },
    });

    return NextResponse.json({
      id: log.id,
      roomId: log.roomId,
      roomNumber: log.room.roomNumber,
      issue: log.issue,
      notes: log.notes,
      status: log.status,
      reportedAt: log.reportedAt.toISOString(),
      resolvedAt: log.resolvedAt?.toISOString() ?? null,
    });
  } catch (error) {
    console.error('Error updating maintenance log:', error);
    return NextResponse.json({ error: 'Failed to update maintenance log' }, { status: 500 });
  }
}
