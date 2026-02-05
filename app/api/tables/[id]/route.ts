import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const table = await prisma.table.findUnique({
      where: { id },
      include: {
        currentOrders: true,
      },
    });
    
    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }
    
    return NextResponse.json(table);
  } catch (error) {
    console.error('Error fetching table:', error);
    return NextResponse.json({ error: 'Failed to fetch table' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const updates = await request.json();

    const normalizeStartTime = (value: unknown) => {
      if (!value) return undefined;
      if (value instanceof Date) return value;
      if (typeof value === 'string') {
        const isoDate = new Date(value);
        if (!Number.isNaN(isoDate.getTime())) return isoDate;

        const match = value.trim().match(/^\s*(\d{1,2}):(\d{2})\s*(AM|PM)\s*$/i);
        if (match) {
          const [, hoursStr, minutesStr, meridiem] = match;
          let hours = parseInt(hoursStr, 10);
          const minutes = parseInt(minutesStr, 10);
          const upper = meridiem.toUpperCase();
          if (upper === 'PM' && hours < 12) hours += 12;
          if (upper === 'AM' && hours === 12) hours = 0;
          const date = new Date();
          date.setHours(hours, minutes, 0, 0);
          return date;
        }
      }
      return undefined;
    };

    const { currentOrders, ...tableUpdates } = updates ?? {};
    if ('startTime' in tableUpdates) {
      tableUpdates.startTime = normalizeStartTime(tableUpdates.startTime) ?? tableUpdates.startTime;
    }

    if (Array.isArray(currentOrders)) {
      const updatedTable = await prisma.$transaction(async (tx) => {
        await tx.table.update({
          where: { id },
          data: tableUpdates,
        });

        await tx.orderItem.deleteMany({
          where: { tableId: id },
        });

        if (currentOrders.length > 0) {
          await tx.orderItem.createMany({
            data: currentOrders.map((order: any) => ({
              tableId: id,
              menuId: order.menuId,
              name: order.name,
              price: order.price,
              quantity: order.quantity,
              status: order.status,
              modifications: order.modifications ?? null,
              transactionId: order.transactionId ?? null,
            })),
          });
        }

        return tx.table.findUnique({
          where: { id },
          include: { currentOrders: true },
        });
      });

      if (!updatedTable) {
        return NextResponse.json({ error: 'Table not found' }, { status: 404 });
      }

      return NextResponse.json(updatedTable);
    }

    const updatedTable = await prisma.table.update({
      where: { id },
      data: tableUpdates,
      include: {
        currentOrders: true,
      },
    });

    return NextResponse.json(updatedTable);
  } catch (error) {
    console.error('Error updating table:', error);
    return NextResponse.json({ error: 'Failed to update table' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    await prisma.table.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting table:', error);
    return NextResponse.json({ error: 'Failed to delete table' }, { status: 500 });
  }
}
