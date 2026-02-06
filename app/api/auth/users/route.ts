import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth-utils';

export async function POST(request: Request) {
  try {
    const { username, email, password, role, staffId } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: username.trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        username: username.trim(),
        email: email?.trim(),
        password: hashedPassword,
        role: role || 'STAFF',
        staffId: staffId ? parseInt(staffId) : null,
      },
      include: {
        staff: true,
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        staffId: user.staffId,
        isActive: user.isActive,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        staff: true,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        staff: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
