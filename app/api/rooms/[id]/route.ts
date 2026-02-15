import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single room with all bookings
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        bookings: {
          include: { items: true },
          orderBy: { checkIn: 'desc' },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    return NextResponse.json({ error: 'Failed to fetch room' }, { status: 500 });
  }
}

// PATCH update room (status, booking, etc.)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const body = await request.json();

    const updatedRoom = await prisma.room.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.type && { type: body.type }),
        ...(body.roomNumber && { roomNumber: body.roomNumber }),
        ...(body.floor !== undefined && { floor: body.floor }),
        ...(body.capacity !== undefined && { capacity: body.capacity }),
        ...(body.priceNonAC !== undefined && { priceNonAC: body.priceNonAC }),
        ...(body.priceAC !== undefined && { priceAC: body.priceAC }),
      },
      include: {
        bookings: {
          where: { status: { in: ['BOOKED', 'CHECKED_IN'] } },
          include: { items: true },
          orderBy: { checkIn: 'desc' },
          take: 1,
        },
      },
    });

    const { bookings, ...rest } = updatedRoom;
    return NextResponse.json({
      ...rest,
      currentBooking: bookings[0] ?? null,
    });
  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json({ error: 'Failed to update room' }, { status: 500 });
  }
}

// DELETE a room (only if not occupied)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    // Check for active bookings
    const activeBookings = await prisma.roomBooking.count({
      where: { roomId: id, status: { in: ['BOOKED', 'CHECKED_IN'] } },
    });
    if (activeBookings > 0) {
      return NextResponse.json({ error: 'Cannot delete room with active bookings' }, { status: 400 });
    }

    await prisma.room.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 });
  }
}
