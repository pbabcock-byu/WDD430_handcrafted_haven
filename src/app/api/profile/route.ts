import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; 
import { sql } from '@/lib/db'; 

const JWT_SECRET = process.env.JWT_SECRET || 'a_very_insecure_default_secret_please_change_me';
if (JWT_SECRET === 'a_very_insecure_default_secret_please_change_me') {
    console.warn('WARNING: JWT_SECRET is not set in environment variables. Using a default insecure secret.');
    console.warn('Please set JWT_SECRET in your .env file for production.');
}

async function verifyAuthToken(request: Request): Promise<{ userId: string; email: string; role: string; name: string; } | null> {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split(' ')[1];
    try {
        const decodedToken = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string; name: string; };
        return decodedToken;
    } catch (jwtError) {
        console.error('JWT Verification Error:', jwtError);
        return null;
    }
}

export async function GET(request: Request) {
    try {
        const decodedToken = await verifyAuthToken(request);
        if (!decodedToken || !decodedToken.userId) {
            return NextResponse.json({ message: 'Authorization token required or invalid.' }, { status: 401 });
        }

        let userProfileData: any; 

        if (decodedToken.role === 'seller') {
            const sellerQuery = await sql`
                SELECT
                    u.id,
                    u.name,
                    u.email,
                    u.role,
                    s.shop_name,
                    s.bio,
                    s.profile_pic,
                    s.story,
                    s.is_active
                FROM users AS u
                LEFT JOIN sellers AS s ON u.id = s.user_id
                WHERE u.id = ${decodedToken.userId}
            `;
            userProfileData = sellerQuery[0];
        } else {
            const userQuery = await sql`
                SELECT id, name, email, role
                FROM users
                WHERE id = ${decodedToken.userId}
            `;
            userProfileData = userQuery[0];
        }

        if (!userProfileData) {
            return NextResponse.json({ message: 'User profile not found.' }, { status: 404 });
        }

        return NextResponse.json(userProfileData, { status: 200 });

    } catch (error: any) {
        console.error('Profile GET API Error:', error);
        return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const decodedToken = await verifyAuthToken(request);
        if (!decodedToken || !decodedToken.userId) {
            return NextResponse.json({ message: 'Authorization token required or invalid.' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ message: 'Current password and new password are required.' }, { status: 400 });
        }

        if (newPassword.length < 8) { 
            return NextResponse.json({ message: 'New password must be at least 8 characters long.' }, { status: 400 });
        }

        const userQuery = await sql`
            SELECT password_hash FROM users WHERE id = ${decodedToken.userId}
        `;

        const user = userQuery[0];

        if (!user) {
            return NextResponse.json({ message: 'User not found.' }, { status: 404 });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);

        if (!isPasswordValid) {
            return NextResponse.json({ message: 'Incorrect current password.' }, { status: 401 });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        await sql`
            UPDATE users
            SET password_hash = ${hashedNewPassword},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${decodedToken.userId}
        `;

        return NextResponse.json({ message: 'Password updated successfully.' }, { status: 200 });

    } catch (error: any) {
        console.error('Profile PATCH API Error:', error);
        return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
    }
}