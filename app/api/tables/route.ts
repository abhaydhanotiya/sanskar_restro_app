import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tables = await prisma.table.findMany({
      include: {
        currentOrders: true,
      },
    });
    return NextResponse.json(tables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const table = await request.json();
    const { currentOrders, ...tableData } = table ?? {};

    const newTable = await prisma.$transaction(async (tx) => {
      const createdTable = await tx.table.create({
        data: tableData,
      });

      if (Array.isArray(currentOrders) && currentOrders.length > 0) {
        await tx.orderItem.createMany({
          data: currentOrders.map((order: any) => ({
            tableId: createdTable.id,
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
        where: { id: createdTable.id },
        include: { currentOrders: true },
      });
    });

    return NextResponse.json(newTable, { status: 201 });
  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json({ error: 'Failed to create table' }, { status: 500 });
  }
}
