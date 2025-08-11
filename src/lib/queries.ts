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

export async function getProductById(productId: string) {
  const result = await sql`
    SELECT 
      p.id,
      p.title,
      p.description,
      p.price,
      p.category,
      p.image_url,
      COALESCE(AVG(r.rating), 0) AS avg_rating,
      COUNT(r.id) AS rating_count
    FROM products p
    LEFT JOIN reviews r ON p.id = r.product_id
    WHERE p.id = ${productId}
    GROUP BY p.id
    LIMIT 1
  `;

  if (result.length === 0) return null;

  const product = result[0];
  return {
    ...product,
    avg_rating: Number(product.avg_rating),     // convert from string to number
    rating_count: Number(product.rating_count), // convert from string to number
  };
}

export async function getReviewsByProductId(productId: string): Promise<Review[]> {
  const reviews = await sql<Review[]>`
    SELECT
      reviews.id,
      reviews.rating,
      reviews.comment,
      users.name AS reviewer_name,
      reviews.created_at
    FROM reviews
    JOIN users ON reviews.user_id = users.id
    WHERE reviews.product_id = ${productId}
  `;

  return reviews;
}

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
