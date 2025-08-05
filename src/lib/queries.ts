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