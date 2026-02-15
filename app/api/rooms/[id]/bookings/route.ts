import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST — Check in / create a booking for a room
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const roomId = parseInt(idParam);
    const body = await request.json();

    const result = await prisma.$transaction(async (tx) => {
      // Create booking
      const booking = await tx.roomBooking.create({
        data: {
          roomId,
          guestName: body.guestName,
          guestPhone: body.guestPhone ?? '',
          adults: body.adults ?? 1,
          children: body.children ?? 0,
          isAC: body.isAC ?? false,
          totalAmount: body.totalAmount ?? 0,
          status: 'CHECKED_IN',
        },
        include: { items: true },
      });

      // Update room status to OCCUPIED
      await tx.room.update({
        where: { id: roomId },
        data: { status: 'OCCUPIED' },
      });

      return booking;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

// PATCH — Update booking (checkout, cancel, update amount)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const roomId = parseInt(idParam);
    const body = await request.json();
    const { bookingId, action, ...updates } = body;

    if (action === 'checkout') {
      const result = await prisma.$transaction(async (tx) => {
        // Calculate total from items
        const booking = await tx.roomBooking.findUnique({
          where: { id: bookingId },
          include: { items: true },
        });

        if (!booking) throw new Error('Booking not found');

        const itemsTotal = booking.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        
        // Calculate nights
        const checkIn = new Date(booking.checkIn);
        const now = new Date();
        const nights = Math.max(1, Math.ceil((now.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));

        const room = await tx.room.findUnique({ where: { id: roomId } });
        const pricePerNight = booking.isAC ? (room?.priceAC ?? 0) : (room?.priceNonAC ?? 0);
        const roomTotal = pricePerNight * nights;
        const totalAmount = roomTotal + itemsTotal;

        // Build billing data from request
        const billingData: Record<string, any> = {
          status: 'CHECKED_OUT' as const,
          checkOut: now,
          totalAmount,
        };

        // Save billing/GST details if provided
        if (body.invoiceNo !== undefined) billingData.invoiceNo = body.invoiceNo;
        if (body.gstEnabled !== undefined) billingData.gstEnabled = body.gstEnabled;
        if (body.companyName !== undefined) billingData.companyName = body.companyName || null;
        if (body.companyAddressLine1 !== undefined) billingData.companyAddressLine1 = body.companyAddressLine1 || null;
        if (body.companyAddressLine2 !== undefined) billingData.companyAddressLine2 = body.companyAddressLine2 || null;
        if (body.customerGstin !== undefined) billingData.customerGstin = body.customerGstin || null;

        const updatedBooking = await tx.roomBooking.update({
          where: { id: bookingId },
          data: billingData,
          include: { items: true },
        });

        // Set room to AVAILABLE
        await tx.room.update({
          where: { id: roomId },
          data: { status: 'AVAILABLE' },
        });

        return updatedBooking;
      });

      return NextResponse.json(result);
    }

    // Generic booking update
    const updatedBooking = await prisma.roomBooking.update({
      where: { id: bookingId },
      data: updates,
      include: { items: true },
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
