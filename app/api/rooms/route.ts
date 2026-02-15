import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all rooms with current (active) booking
export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        bookings: {
          where: {
            status: { in: ['BOOKED', 'CHECKED_IN'] },
          },
          include: { items: true },
          orderBy: { checkIn: 'desc' },
          take: 1,
        },
      },
      orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
    });

    // Map to include currentBooking as the first active booking
    const mapped = rooms.map((room) => {
      const { bookings, ...rest } = room;
      return {
        ...rest,
        currentBooking: bookings[0] ?? null,
      };
    });

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}

// POST create a new room
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const room = await prisma.room.create({
      data: {
        roomNumber: body.roomNumber,
        type: body.type ?? 'DELUXE',
        floor: body.floor ?? 1,
        capacity: body.capacity ?? 2,
        priceNonAC: body.priceNonAC,
        priceAC: body.priceAC,
        status: body.status ?? 'AVAILABLE',
      },
    });
    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
