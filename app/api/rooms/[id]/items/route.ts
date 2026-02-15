import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET — List all service items for the active booking of a room
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const roomId = parseInt(idParam);

    // Find active booking
    const booking = await prisma.roomBooking.findFirst({
      where: { roomId, status: { in: ['BOOKED', 'CHECKED_IN'] } },
      include: { items: { orderBy: { timestamp: 'desc' } } },
    });

    if (!booking) {
      return NextResponse.json({ items: [], bookingId: null });
    }

    return NextResponse.json({ items: booking.items, bookingId: booking.id });
  } catch (error) {
    console.error('Error fetching room items:', error);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

// POST — Add a service item (food or amenity) to the active booking
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const roomId = parseInt(idParam);
    const body = await request.json();

    // Find active booking
    const booking = await prisma.roomBooking.findFirst({
      where: { roomId, status: { in: ['BOOKED', 'CHECKED_IN'] } },
      orderBy: { checkIn: 'desc' },
    });

    if (!booking) {
      return NextResponse.json({ error: 'No active booking for this room' }, { status: 400 });
    }

    const item = await prisma.roomServiceItem.create({
      data: {
        bookingId: booking.id,
        name: body.name,
        category: body.category ?? 'AMENITY',
        price: body.price ?? 0,
        quantity: body.quantity ?? 1,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error adding room item:', error);
    return NextResponse.json({ error: 'Failed to add item' }, { status: 500 });
  }
}
