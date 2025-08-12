import { NextResponse, NextRequest } from 'next/server';
import { sql } from '@/lib/db';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { writeFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

interface Product {
  id: number;
  title: string;
  description: string;
  image_url: string;
  price: number;
  category: string;
  seller_id: number;
  shop_name: string;
}

interface JwtPayloadWithSellerId extends JwtPayload {
  sellerId?: number;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await context.params;
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    jwt.verify(token, JWT_SECRET);
    const [product] = await sql<Product[]>`
      SELECT p.id, p.title, p.description, p.image_url, p.price, p.category, p.seller_id, s.shop_name
      FROM products p
      JOIN sellers s ON p.seller_id = s.id
      WHERE p.id = ${productId}
    `;

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product }, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }
}

// UPDATES a product from the Seller profile page.
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await context.params;

  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let sellerId: number;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayloadWithSellerId;
    if (!payload.sellerId) {
      return NextResponse.json({ message: 'Invalid token payload' }, { status: 401 });
    }
    sellerId = payload.sellerId;
  } catch {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  try {
    const [product] = await sql<
      {
        id: number;
        seller_id: number;
        image_url: string;
      }[]
    >`
      SELECT id, seller_id, image_url FROM products WHERE id = ${productId}
    `;

    if (!product || product.seller_id !== sellerId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const formData = await req.formData();
    const title = formData.get('title') as string | null;
    const description = formData.get('description') as string | null;
    const price = formData.get('price') as string | null;
    const imageFile = formData.get('image') as File | null;

    if (!title || !description || !price) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    let image_url = product.image_url;

    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filename = `${Date.now()}-${imageFile.name}`;
      const uploadPath = path.join(process.cwd(), 'public/uploads', filename);

      await writeFile(uploadPath, buffer);
      image_url = `/uploads/${filename}`;
    }

    await sql`
      UPDATE products
      SET title = ${title},
          description = ${description},
          price = ${price},
          image_url = ${image_url}
      WHERE id = ${productId}
    `;

    return NextResponse.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE a product from the Seller profile page.
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id: productId } = context.params;

  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let sellerId: number;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayloadWithSellerId;
    if (!payload.sellerId) {
      return NextResponse.json({ message: 'Invalid token payload' }, { status: 401 });
    }
    sellerId = payload.sellerId;
  } catch {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  try {
    const [product] = await sql<{ seller_id: number }[]>`
      SELECT seller_id FROM products WHERE id = ${productId}
    `;

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    if (product.seller_id !== sellerId) {
      return NextResponse.json({ message: 'Forbidden: You do not have permission to delete this product' }, { status: 403 });
    }

    await sql`
      DELETE FROM reviews WHERE product_id = ${productId}
    `;

    await sql`
      DELETE FROM products WHERE id = ${productId}
    `;

    return NextResponse.json({ success: true, message: 'Product and associated reviews deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ message: `Internal Server Error: ${(error as Error).message}` }, { status: 500 });
  }
}
