import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs'; 
import jwt from 'jsonwebtoken';
import { sql } from '@/lib/db';

// Ensure JWT_SECRET is defined in your .env file
const JWT_SECRET = process.env.JWT_SECRET || 'a_very_insecure_default_secret_please_change_me';
if (JWT_SECRET === 'a_very_insecure_default_secret_please_change_me') {
    console.warn('WARNING: JWT_SECRET is not set in environment variables. Using a default insecure secret.');
    console.warn('Please set JWT_SECRET in your .env file for production.');
}

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
        }

        const userQuery = await sql`
            SELECT id, name, email, password_hash, role
            FROM users
            WHERE email = ${email}
        `;

        const user = userQuery[0]; 

        if (!user) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        const tokenPayload = {
            userId: user.id, 
            email: user.email,
            role: user.role,
            name: user.name, 
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });

        
        return NextResponse.json({ message: 'Login successful', token, user: tokenPayload }, { status: 200 });

    } catch (error: any) { 
        console.error('Login API Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}