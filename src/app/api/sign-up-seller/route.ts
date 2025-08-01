import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { name, email, password, shop_name, profile_pic, bio, story } = await request.json();

        if (!name || !email || !password || !shop_name) {
            return NextResponse.json({ message: 'Name, email, password, and shop name are required.' }, { status: 400 });
        }

        const existingUsers = await sql`
            SELECT id FROM users WHERE email = ${email}
        `;

        if (existingUsers.length > 0) {
            return NextResponse.json({ message: 'Email already registered.' }, { status: 409 });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        const result = await sql.begin(async sql => {
            const newUserRows = await sql`
                INSERT INTO users (name, email, password_hash, role)
                VALUES (
                    ${name},
                    ${email},
                    ${hashedPassword},
                    'seller'
                )
                RETURNING id; 
            `;
            const newUserId = newUserRows[0].id;

            await sql`
                INSERT INTO sellers (
                    user_id,
                    shop_name,   
                    bio,
                    profile_pic, 
                    story,
                    is_active,
                    approved_by,
                    created_at,
                    updated_at
                )
                VALUES (
                    ${newUserId},
                    ${shop_name},           
                    ${bio || null},
                    ${profile_pic || null},
                    ${story || null},
                    TRUE,
                    NULL,
                    CURRENT_TIMESTAMP,
                    CURRENT_TIMESTAMP
                );
            `;

            return { userId: newUserId }; 
        });

        return NextResponse.json({
            message: 'Seller account created successfully!',
            userId: result.userId,
        }, { status: 201 });

    } catch (error: any) { 
        console.error('Seller Sign-up API Error:', error);
        if (error.code === '25P02') { 
            return NextResponse.json({ message: 'Seller registration failed due to a database transaction error.' }, { status: 500 });
        }
        return NextResponse.json({ message: 'Internal server error during seller sign-up.' }, { status: 500 });
    }
}