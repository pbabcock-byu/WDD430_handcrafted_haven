import { NextRequest, NextResponse } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { sql } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'a_very_insecure_default_secret_please_change_me';

interface DecodedToken extends JwtPayload {
  userId: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let decoded: DecodedToken;
  try {
    decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
  } catch (error) {
    return NextResponse.json({ message: 'Invalid or expired token', error }, { status: 401 });
  }

  const userId = decoded.userId;

  try {
    const userResult = await sql<User[]>`
      SELECT id, name, email, role
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `;

    if (userResult.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const user = userResult[0];

    const sellerResult = await sql<{ id: number }[]>`
      SELECT id FROM sellers WHERE user_id = ${userId} AND is_active = true LIMIT 1
    `;

    const isSeller = sellerResult.length > 0;

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isSeller,
      },
    });
  } catch (error: unknown) {
    console.error('Error in /api/me:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
