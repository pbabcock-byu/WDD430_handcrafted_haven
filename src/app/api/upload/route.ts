import { writeFile } from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { sql } from '@vercel/postgres';

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as { sellerId: number };

    if (!decoded || !decoded.sellerId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const formData = await req.formData();

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const material = formData.get('material') as string;
    const dimensions = formData.get('dimensions') as string;
    const price = parseFloat(formData.get('price') as string);
    const image = formData.get('image') as File;

    if (!image || !image.name) {
      return NextResponse.json({ error: 'No image uploaded' }, { status: 400 });
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${image.name}`;
    const imagePath = path.join(process.cwd(), 'public', 'uploads', filename);
    await writeFile(imagePath, buffer);

    const imageUrl = `/uploads/${filename}`;

    await sql`
      INSERT INTO products (seller_id, title, description, image_url, category, material, dimensions, price, is_active, created_at)
      VALUES (${decoded.sellerId}, ${title}, ${description}, ${imageUrl}, ${category}, ${material}, ${dimensions}, ${price}, true, NOW())
    `;

    return NextResponse.json({ message: 'Product uploaded successfully' }, { status: 200 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
