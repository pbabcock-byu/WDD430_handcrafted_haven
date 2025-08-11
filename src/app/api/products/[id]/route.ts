import { NextResponse, NextRequest } from 'next/server';
import { sql } from '@/lib/db';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { IncomingForm, File as FormidableFile } from 'formidable';
import path from 'path';
import type { IncomingMessage } from 'http';
import { Readable } from 'stream';

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

function convertNextRequestToNodeRequest(req: NextRequest): IncomingMessage {
  // We assume req.body is a ReadableStream or string. We cast it as needed.
  // If req.body is a ReadableStream, we convert to Node Readable stream.
  // If req.body is string, create a stream from it.
  let bodyStream: Readable;

  if (typeof req.body === 'string' || req.body instanceof String) {
    bodyStream = Readable.from(req.body as string);
  } else if (req.body instanceof Readable) {
    bodyStream = req.body as Readable;
  } else if (req.body) {
    // fallback: try to convert to buffer and then to stream
    const buffer = Buffer.from(JSON.stringify(req.body));
    bodyStream = Readable.from(buffer);
  } else {
    bodyStream = Readable.from([]);
  }

  const headers = Object.fromEntries(req.headers.entries());

  // We assign headers to the stream to emulate IncomingMessage for formidable
  return Object.assign(bodyStream, { headers }) as unknown as IncomingMessage;
}

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
    if (!payload.sellerId) throw new Error('sellerId missing');
    sellerId = payload.sellerId;
  } catch {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  const [product] = await sql<
    {
      id: number;
      seller_id: number;
      image_url: string;
    }[]
  >`
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
    form.parse(nodeReq, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

  const { title, description, price } = data.fields;
  let image_url = product.image_url;

  // image file can be single or array, handle both
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

export const config = {
  api: {
    bodyParser: false,
  },
};
