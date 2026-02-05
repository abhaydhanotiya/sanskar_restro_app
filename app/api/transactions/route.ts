import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        items: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const transaction = await request.json();
    
    // Extract items from transaction data
    const { items, ...transactionData } = transaction;
    
    // Create transaction with nested item creation
    const newTransaction = await prisma.transaction.create({
      data: {
        ...transactionData,
        timestamp: new Date().toISOString(), // Use current ISO timestamp
        items: {
          create: items.map((item: any) => ({
            tableId: item.tableId,
            menuId: item.menuId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            status: item.status,
            modifications: item.modifications || null,
          })),
        },
      },
      include: {
        items: true,
      },
    });
    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
