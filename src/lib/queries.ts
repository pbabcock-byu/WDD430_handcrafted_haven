import { sql } from "./db";

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  seller_id?: string;
  shop_name: string | null;
  avg_rating?: number;
  rating_count?: number;
};

export async function getSellers() {
    return await sql`
    SELECT
      sellers.id,
      users.name,
      users.email,
      sellers.bio,
      sellers.profile_pic,
      sellers.story,
      sellers.shop_name,
      sellers.created_at
    FROM sellers
    JOIN users ON sellers.user_id = users.id
    WHERE sellers.is_active = TRUE;
    `;
}

export async function getSellerProductsWithRatings(sellerId: string): Promise<Product[]> {
  return await sql<Product[]>`
    SELECT 
      p.id,
      p.title,
      p.description,
      p.price,
      p.category,
      p.image_url,
      p.seller_id,
      s.shop_name,
      COALESCE(AVG(r.rating), 0) AS avg_rating,
      COUNT(r.rating) AS rating_count
    FROM products p
    LEFT JOIN sellers s ON p.seller_id = s.id
    LEFT JOIN reviews r ON p.id = r.product_id
    WHERE p.seller_id = ${sellerId}
    GROUP BY p.id, s.shop_name
    ORDER BY p.title ASC
  `;
}


export async function getSellerProducts(sellerId: string) {
  return await sql`
    SELECT
      id,
      title,
      description,
      price,
      category,
      image_url
    FROM products
    WHERE seller_id = ${sellerId};
  `;
}

export async function getSellerInfo(sellerId: string) {
  const result = await sql`
    SELECT
      sellers.id,
      users.name,
      sellers.bio,
      sellers.profile_pic,
      sellers.story,
      sellers.shop_name,
      users.email
    FROM sellers
    JOIN users ON sellers.user_id = users.id
    WHERE sellers.id = ${sellerId}
    LIMIT 1
  `;

  return result[0]; 
}
