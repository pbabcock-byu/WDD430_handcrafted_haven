import { NextRequest, NextResponse } from 'next/server';
import { getSellerProducts } from '@/lib/queries';

export const runtime = 'nodejs'; 

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id: sellerId } = await context.params; 

  try {
    const products = await getSellerProducts(sellerId);
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching seller products:', error);
    return NextResponse.json(
      { message: 'Failed to load products' },
      { status: 500 }
    );
  }
}


