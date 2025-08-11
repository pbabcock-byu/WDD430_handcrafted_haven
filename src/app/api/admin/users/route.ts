import { NextResponse } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { sql } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'a_very_insecure_default_secret_please_change_me';
if (JWT_SECRET === 'a_very_insecure_default_secret_please_change_me') {
  console.warn('WARNING: JWT_SECRET is not set in environment variables. Using a default insecure secret.');
  console.warn('Please set JWT_SECRET in your .env file for production.');
}

interface DecodedToken extends JwtPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

async function verifyAuthToken(request: Request): Promise<DecodedToken | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decodedToken = jwt.verify(token, JWT_SECRET) as DecodedToken;
    return decodedToken;
  } catch (jwtError) {
    console.error('JWT Verification Error:', jwtError);
    return null;
  }
}

interface UserWithSellerInfo {
  id: number;
  name: string;
  email: string;
  role: string;
  shop_name: string | null;
  is_active: boolean | null;
}

export async function GET(request: Request) {
  try {
    const decodedToken = await verifyAuthToken(request);
    if (!decodedToken || !decodedToken.userId) {
      return NextResponse.json({ message: 'Authorization token required or invalid.' }, { status: 401 });
    }

    if (decodedToken.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden: Only administrators can access this resource.' }, { status: 403 });
    }

    const allUsersQuery = await sql<UserWithSellerInfo[]>`
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        s.shop_name,
        s.is_active
      FROM users AS u
      LEFT JOIN sellers AS s ON u.id = s.user_id
      ORDER BY role DESC;
    `;

    return NextResponse.json(allUsersQuery, { status: 200 });

  } catch (error: unknown) {
    console.error('Admin Users API Error:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
