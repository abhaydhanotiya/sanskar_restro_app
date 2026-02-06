import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, generateToken } from '@/lib/auth-utils';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      );
    }

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username: username.trim() },
      include: {
        staff: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'User account is inactive' },
        { status: 401 }
      );
    }

    // Verify password
    const passwordMatch = await verifyPassword(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate auth token
    const token = generateToken(user.id, user.role);

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        name: user.staff?.name || user.username,
        role: user.role,
        email: user.email,
        avatar: user.staff?.avatar,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
