import { NextResponse, NextRequest } from 'next/server';
import { sql } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { IncomingForm } from 'formidable';
import path from 'path';
import type { IncomingMessage } from 'http';
import { Readable } from 'stream';
 
export const dynamic = 'force-dynamic';

// -------------------- GET (product details) --------------------
export async function GET(request: Request, context: { params : Promise<{ id: string }> }) {
  const { id: productId } = await context.params;
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    jwt.verify(token, JWT_SECRET);
    const [product] = await sql`
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

function convertNextRequestToNodeRequest(req: NextRequest): IncomingMessage {
  const readable = Readable.from(req.body as any); 
  const headers = Object.fromEntries(req.headers.entries());
  return Object.assign(readable, { headers }) as unknown as IncomingMessage;
}

// -------------------- PUT (update product) --------------------
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: productId } = await context.params;

  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let sellerId;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    sellerId = payload?.sellerId;
    if (!sellerId) throw new Error();
  } catch {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  const [product] = await sql`
    SELECT * FROM products WHERE id = ${productId}
  `;

  if (!product || product.seller_id !== sellerId) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const form = new IncomingForm({
    multiples: false,
    uploadDir: path.join(process.cwd(), '/public/uploads'),
    keepExtensions: true,
  });

  const data: any = await new Promise((resolve, reject) => {
    const nodeReq = convertNextRequestToNodeRequest(req);
    form.parse(nodeReq, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

  const { title, description, price } = data.fields as Record<string, string>;
  let image_url = product.image_url;

  const imageFile = (data.files as any)?.image?.[0];
  if (imageFile?.filepath) {
    const filename = path.basename(imageFile.filepath);
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

  return NextResponse.json({ success: true });
}

// -------------------- POST (submit review) --------------------
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: productId } = await context.params;
  const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let userId;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    userId = payload?.userId; // Make sure your JWT includes userId
    if (!userId) throw new Error('Invalid token payload');
  } catch {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  const { rating, comment } = await req.json();

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ message: 'Rating must be between 1 and 5' }, { status: 400 });
  }

  try {
    await sql`
      INSERT INTO reviews (product_id, user_id, rating, comment)
      VALUES (${productId}, ${userId}, ${rating}, ${comment})
    `;
    return NextResponse.json({ message: 'Review submitted successfully' }, { status: 201 });
  } catch (err) {
    console.error('Error saving review:', err);
    return NextResponse.json({ message: 'Failed to save review' }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
