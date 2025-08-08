import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic' 

export async function GET() {
  try {
    const products = await sql`
      SELECT 
        p.id,
        p.title,
        p.description,
        p.image_url,
        p.price,
        p.category,
        p.seller_id,
        s.shop_name
      FROM products p
      JOIN sellers s ON p.seller_id = s.id
      ORDER BY p.created_at DESC
    `
    return NextResponse.json({ products }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
