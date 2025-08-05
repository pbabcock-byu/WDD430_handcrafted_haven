'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface LogoutButtonProps {
    onLogoutSuccess?: () => void;
}

export default function LogoutButton({ onLogoutSuccess }: LogoutButtonProps) {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                console.warn('Backend logout API returned non-OK status:', response.status);
            }
        } catch (error) {
            console.error('Error calling backend logout API:', error);
        }

        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userId');

        if (onLogoutSuccess) {
            onLogoutSuccess();
        }

        router.push('/login');
    };

    return (
        <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50">
            Logout
        </button>
    );

}