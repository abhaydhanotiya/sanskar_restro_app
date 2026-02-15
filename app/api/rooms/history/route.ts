import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET — Fetch all checked-out room bookings (history)
export async function GET() {
  try {
    const bookings = await prisma.roomBooking.findMany({
      where: { status: 'CHECKED_OUT' },
      include: {
        room: true,
        items: true,
      },
      orderBy: { checkOut: 'desc' },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching room history:', error);
    return NextResponse.json({ error: 'Failed to fetch room history' }, { status: 500 });
  }
}

// PATCH — Update billing details on a checked-out booking
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, invoiceNo, gstEnabled, companyName, companyAddressLine1, companyAddressLine2, customerGstin } = body;

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });
    }

    const updated = await prisma.roomBooking.update({
      where: { id: bookingId },
      data: {
        invoiceNo: invoiceNo ?? undefined,
        gstEnabled: gstEnabled ?? undefined,
        companyName: companyName || null,
        companyAddressLine1: companyAddressLine1 || null,
        companyAddressLine2: companyAddressLine2 || null,
        customerGstin: customerGstin || null,
      },
      include: { room: true, items: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating billing details:', error);
    return NextResponse.json({ error: 'Failed to update billing details' }, { status: 500 });
  }
}
