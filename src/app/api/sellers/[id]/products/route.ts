import { NextResponse, NextRequest } from 'next/server';
import { sql } from '@/lib/db';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

interface Product {
  id: number;
  title: string;
  description: string;
  image_url: string;
  price: number;
  category: string;
  seller_id: number;
}

interface JwtPayloadWithSellerId extends JwtPayload {
  sellerId?: number;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
  }

  let sellerId: number;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayloadWithSellerId;
    if (!payload.sellerId) {
      throw new Error('sellerId missing in token');
    }
    sellerId = payload.sellerId;
  } catch (err) {
    console.error('JWT verification failed:', err);
    return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 });
  }

  try {
    const products = await sql<Product[]>`
      SELECT id, title, description, image_url, price, category, seller_id
      FROM products
      WHERE seller_id = ${sellerId}
      ORDER BY id DESC
    `;
    return NextResponse.json(products, { status: 200 });
  } catch (err) {
    console.error('Database query failed:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}