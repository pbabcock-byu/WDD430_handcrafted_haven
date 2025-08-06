import { sql } from "./db";

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
/*

import { sql } from "./db";

export async function getSellers() {
    return await sql`
    SELECT
    sellers.id,
    users.name,
    sellers.bio,
    sellers.profile_pic,
    sellers.story,
    sellers.created_at
    FROM sellers
    JOIN users ON sellers.user_id = users.id
    WHERE sellers.is_active = TRUE;
    `;
}*/