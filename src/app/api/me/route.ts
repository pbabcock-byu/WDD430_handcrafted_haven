import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { sql } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'a_very_insecure_default_secret_please_change_me';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
  }

  const userId = decoded.userId;

  try {
    const userResult = await sql`
      SELECT id, name, email, role
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `;

    if (userResult.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const user = userResult[0];

    const sellerResult = await sql`
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
  } catch (error) {
    console.error('Error in /api/me:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
