import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    jwt.verify(token, JWT_SECRET);
    const [product] = await sql`
      SELECT p.id, p.title, p.description, p.image_url, p.price, p.category, s.shop_name
      FROM products p
      JOIN sellers s ON p.seller_id = s.id
      WHERE p.id = ${params.id}
    `;

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product }, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }
}
