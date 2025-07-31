import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs'; 
import { sql } from '@/lib/db'; 

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({ message: 'Name, email, and password are required.' }, { status: 400 });
        }

        const existingUsers = await sql`
            SELECT id FROM users WHERE email = ${email}
        `;

        if (existingUsers.length > 0) {
            return NextResponse.json({ message: 'Email already registered.' }, { status: 409 });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUserRows = await sql`
            INSERT INTO users (name, email, password_hash)
            VALUES (${name}, ${email}, ${hashedPassword})
            RETURNING id;
        `;

        const newUser = newUserRows[0];

        return NextResponse.json({
            message: 'User registered successfully!',
            userId: newUser.id,
        }, { status: 201 });

    } catch (error) {
        console.error('Sign-up API Error:', error);
        return NextResponse.json({ message: 'Internal server error during sign-up.' }, { status: 500 });
    }
}