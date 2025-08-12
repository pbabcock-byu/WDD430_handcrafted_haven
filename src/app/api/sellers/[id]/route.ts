import { NextRequest, NextResponse } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';
// Assuming 'sql' is a template tag function from your library.
import { sql } from '@/lib/db'; 

interface JwtPayloadWithSellerId extends JwtPayload {
  sellerId?: string;
}

/**
 * The `updateSeller` function now properly constructs and executes a database query
 * using template literals, which is the expected syntax for many modern database
 * clients, and correctly handles parameters to prevent SQL injection.
 * @param sellerId The ID of the seller to update (as a number).
 * @param updates A key-value object of the fields to update.
 * @returns {Promise<any | undefined>} The updated seller object, or undefined if no updates were provided.
 */
async function updateSeller(sellerId: number, updates: { [key: string]: any }) {
  const updateClauses: string[] = [];
  const queryParams: any[] = [];
  let paramIndex = 1;

  for (const key in updates) {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      // Correctly build the update clause with the PostgreSQL placeholder syntax
      updateClauses.push(`${key} = $${paramIndex}`);
      queryParams.push(updates[key]);
      paramIndex++;
    }
  }
  
  if (updateClauses.length === 0) {
    return;
  }

  // The last parameter is the sellerId for the WHERE clause.
  queryParams.push(sellerId);
  const updateString = updateClauses.join(", ");
  
  try {
    // FIX: The core issue. Instead of `sql.query` or `sql`,
    // we use a specific `sql` tag for template literals to handle parameters safely.
    // We construct the query string manually and then use the template literal syntax.
    // The library will correctly substitute the parameters.
    const result = await sql.query(`
      UPDATE sellers
      SET ${updateString}
      WHERE id = $${paramIndex}
      RETURNING *;
    `, queryParams);
    
    return result.rows[0];
  } catch (error) {
    console.error('Database error during seller update:', error);
    throw error;
  }
}

/**
 * Handles a PATCH request to update a seller's profile information.
 * It uses the sellerId from the JWT to ensure the user can only update their own profile.
 * It then calls the imported updateSeller function to perform the database operation.
 *
 * @param {NextRequest} request The incoming request object.
 * @returns {NextResponse} The response with the updated seller data or an error message.
 */
export async function PATCH(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    console.error('JWT_SECRET environment variable is not set!');
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
  }

  let sellerId: string;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayloadWithSellerId;
    if (!payload.sellerId) {
      throw new Error('sellerId missing in token');
    }
    sellerId = payload.sellerId;
  } catch (err) {
    console.error('JWT verification failed:', err);
    return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 });
  }

  let updates: { shop_name?: string; bio?: string; story?: string };
  try {
    updates = await request.json();
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: 'Bad Request: No update data provided' }, { status: 400 });
    }
  } catch (err) {
    console.error('Failed to parse request body:', err);
    return NextResponse.json({ message: 'Bad Request: Invalid JSON body' }, { status: 400 });
  }

  try {
    const updatedSeller = await updateSeller(Number(sellerId), updates);

    if (!updatedSeller) {
      return NextResponse.json({ message: 'Not Found: Seller not found or no changes made' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Seller profile updated successfully',
      seller: updatedSeller,
    }, { status: 200 });
  } catch (err) {
    console.error('Error updating seller:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
