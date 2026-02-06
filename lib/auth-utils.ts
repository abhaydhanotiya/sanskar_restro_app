import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Create a mock JWT token (in production, use a proper JWT library)
export function generateToken(userId: number, role: string): string {
  const payload = {
    userId,
    role,
    iat: Math.floor(Date.now() / 1000),
  };
  // In production, use jsonwebtoken library with a secret
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export function decodeToken(token: string): { userId: number; role: string } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    return { userId: payload.userId, role: payload.role };
  } catch {
    return null;
  }
}
