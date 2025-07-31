import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs'; 
import jwt from 'jsonwebtoken';
import { sql } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'a_very_insecure_default_secret_please_change_me';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const userQuery = await sql`
      SELECT id, name, email, password_hash, role
      FROM users
      WHERE email = ${email}
    `;

    const user = userQuery[0];

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const sellerQuery = await sql`
      SELECT id FROM sellers
      WHERE user_id = ${user.id} AND is_active = true
    `;

    const isSeller = sellerQuery.length > 0;
    const sellerId = isSeller ? sellerQuery[0].id : null;

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      isSeller,
      sellerId,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: tokenPayload,
    }, { status: 200 });

  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
