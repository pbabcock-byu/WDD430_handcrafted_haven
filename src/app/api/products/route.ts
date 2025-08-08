import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    jwt.verify(token, JWT_SECRET);
    const products = await sql`
      SELECT p.id, p.title, p.description, p.image_url, p.price, p.category, p.seller_id, s.shop_name
      FROM products p
      JOIN sellers s ON p.seller_id = s.id
    `;
    return NextResponse.json({ products }, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }
}
