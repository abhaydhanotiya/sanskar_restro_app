import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Authentication endpoint with database validation
export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      );
    }

    const lowerName = username.trim().toLowerCase();
    
    // Owner authentication (hardcoded for security)
    if ((lowerName === 'admin' || lowerName === 'owner') && password === 'admin123') {
      return NextResponse.json({
        user: {
          name: 'Admin',
          role: 'OWNER',
        },
        token: 'mock-jwt-token-owner',
      });
    }
    
    // Staff authentication - check against database
    const staff = await prisma.staffMember.findFirst({
      where: {
        name: {
          equals: username.trim(),
          mode: 'insensitive',
        },
      },
    });

    if (!staff) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // In production, you should hash passwords and compare securely
    // For now, accepting any password for valid staff members
    return NextResponse.json({
      user: {
        name: staff.name,
        role: staff.role,
      },
      token: `mock-jwt-token-${staff.id}`,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
