import { NextResponse } from 'next/server';

export async function POST() {
    try {
    
        console.warn('User attempted logout.'); 

        return NextResponse.json({ message: 'Logged out successfully.' }, { status: 200 });

    } catch (error) {
        console.error('Logout API Error:', error);
        return NextResponse.json({ message: 'Internal server error during logout.' }, { status: 500 });
    }
}