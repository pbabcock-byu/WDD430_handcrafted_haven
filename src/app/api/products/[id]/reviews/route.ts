import { NextResponse, NextRequest } from 'next/server';
import { sql } from '@/lib/db';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { IncomingForm, File as FormidableFile } from 'formidable';
import path from 'path';
import type { IncomingMessage } from 'http';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';

// Define the Product type based on your DB schema for type-safe query results
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

interface ProductFull {
  id: number;
  seller_id: number;
  image_url: string;
  // other columns if needed
}

// Extend JwtPayload to include custom properties
interface JwtPayloadWithSellerId extends JwtPayload {
  sellerId?: number;
}

interface JwtPayloadWithUserId extends JwtPayload {
  userId?: number;
}

// -------------------- GET (product details) --------------------
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


function webStreamToNodeStream(readableStream: ReadableStream<Uint8Array>): Readable {
  const reader = readableStream.getReader();

  return new Readable({
    async read() {
      try {
        const { done, value } = await reader.read();
        if (done) {
          this.push(null); // End of stream
        } else {
          this.push(Buffer.from(value));
        }
      } catch (err) {
        this.destroy(err);
      }
    },
  });
}

export function convertNextRequestToNodeRequest(req: NextRequest): IncomingMessage {
  if (!req.body) {
    throw new Error('Request body is missing');
  }

  // Convert the web ReadableStream body to a Node.js Readable stream
  const nodeReadable = webStreamToNodeStream(req.body);

  // Copy headers from NextRequest to a plain object
  const headers = Object.fromEntries(req.headers.entries());

  // Attach headers to the readable stream to mimic IncomingMessage
  return Object.assign(nodeReadable, { headers }) as unknown as IncomingMessage;
}


// -------------------- PUT (update product) --------------------
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
    if (!payload.sellerId) throw new Error('sellerId missing in token');
    sellerId = payload.sellerId;
  } catch {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  const [product] = await sql<ProductFull[]>`
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

  const data: {
    fields: Record<string, string>;
    files: Record<string, FormidableFile | FormidableFile[]>;
  } = await new Promise((resolve, reject) => {
    const nodeReq = convertNextRequestToNodeRequest(req);
    form.parse(nodeReq, (err, _fields, _files) => {
      if (err) return reject(err);
      //resolve({ fields, files });
    });
  });

  const { title, description, price } = data.fields;
  let image_url = product.image_url;

  // Handle the possibility that image file is single or array
  const imageFile = Array.isArray(data.files.image)
    ? data.files.image[0]
    : data.files.image;

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
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await context.params;
  const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let userId: number;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayloadWithUserId;
    if (!payload.userId) throw new Error('userId missing in token');
    userId = payload.userId;
  } catch {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  const { rating, comment } = await req.json();

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json(
      { message: 'Rating must be between 1 and 5' },
      { status: 400 }
    );
  }

  try {
    await sql`
      INSERT INTO reviews (product_id, user_id, rating, comment)
      VALUES (${productId}, ${userId}, ${rating}, ${comment})
    `;
    return NextResponse.json(
      { message: 'Review submitted successfully' },
      { status: 201 }
    );
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
