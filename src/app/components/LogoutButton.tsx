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
        <button onClick={handleLogout} className="logout-button">
            Logout
        </button>
    );

}