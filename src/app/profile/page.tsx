'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from '../components/LogoutButton';

interface UserProfile {
    userId: string;
    name: string;
    email: string;
    role: 'user' | 'seller' | 'admin'; 
    shop_name?: string;
    bio?: string;
    profile_pic?: string;
    story?: string;
    is_active?: boolean;
    // reviewsCount?: number;
    // favoriteItemsCount?: number;
}

interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: string;
    shop_name?: string;
}

export default function ProfilePage() {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string | null>(null);
    const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);
    const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
    const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
    const [adminLoading, setAdminLoading] = useState(false);
    const [adminError, setAdminError] = useState<string | null>(null);

    const router = useRouter();

    useEffect(() => {
        const fetchUserProfile = async () => {
            const authToken = localStorage.getItem('authToken');

            if (!authToken) {
                router.push('/login');
                return;
            }

            try {
                setLoading(true);
                const response = await fetch('/api/profile', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                    },
                });

                if (response.ok) {
                    const data: UserProfile = await response.json();
                    setUserProfile(data);
                } else {
                    const errorData = await response.json();
                    setError(errorData.message || 'Failed to fetch profile data.');
                    if (response.status === 401 || response.status === 403) {
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('userRole');
                        localStorage.removeItem('userName');
                        localStorage.removeItem('userId');
                        router.push('/login');
                    }
                }
            } catch (err) {
                console.error('Network error fetching profile:', err);
                setError('An unexpected error occurred while fetching profile.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [router]);

    useEffect(() => {
        const fetchAllUsersForAdmin = async () => {
            if (userProfile?.role === 'admin') {
                const authToken = localStorage.getItem('authToken');
                if (!authToken) {
                    router.push('/login');
                    return;
                }

                try {
                    setAdminLoading(true);
                    const response = await fetch('/api/admin/users', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`,
                        },
                    });

                    if (response.ok) {
                        const data: AdminUser[] = await response.json();
                        setAllUsers(data);
                    } else {
                        const errorData = await response.json();
                        setAdminError(errorData.message || 'Failed to fetch users for admin view.');
                    }
                } catch (err) {
                    console.error('Network error fetching all users for admin:', err);
                    setAdminError('An unexpected error occurred while fetching all users.');
                } finally {
                    setAdminLoading(false);
                }
            }
        };

        if (userProfile && userProfile.role === 'admin') {
            fetchAllUsersForAdmin();
        }
    }, [userProfile, router]); 

    const handleSubmitPasswordChange = async (event: React.FormEvent) => {
        event.preventDefault();
        setPasswordChangeError(null);
        setPasswordChangeSuccess(null);
        setPasswordChangeLoading(true);

        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            setPasswordChangeError('You are not logged in.');
            setPasswordChangeLoading(false);
            router.push('/login');
            return;
        }

        if (newPassword.length < 8) {
            setPasswordChangeError('New password must be at least 8 characters long.');
            setPasswordChangeLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            if (response.ok) {
                setPasswordChangeSuccess('Password updated successfully!');
                setCurrentPassword('');
                setNewPassword('');
                setShowPasswordForm(false);
            } else {
                const errorData = await response.json();
                setPasswordChangeError(errorData.message || 'Failed to update password.');
            }
        } catch (err) {
            console.error('Network error during password change:', err);
            setPasswordChangeError('An unexpected error occurred. Please try again.');
        } finally {
            setPasswordChangeLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
                <p className="text-gray-700 text-lg">Loading profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative w-full max-w-md" role="alert">
                    <span className="block sm:inline">{error}</span>
                    <p className="mt-2 text-sm">Please try logging in again.</p>
                </div>
            </div>
        );
    }

    if (!userProfile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
                <p className="text-gray-700 text-lg">No profile data available.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Your Profile</h2>

                <div className="space-y-4">
                    <p className="text-lg text-gray-700">
                        <span className="font-semibold">Name:</span> {userProfile.name}
                    </p>
                    <p className="text-lg text-gray-700">
                        <span className="font-semibold">Email:</span> {userProfile.email}
                    </p>

                    {/* Seller */}
                    {userProfile.role === 'seller' && (
                        <>
                            <div className="mt-8 pt-4 border-t border-gray-200">
                                <h3 className="text-2xl font-bold text-gray-800 mb-4">Your Shop Details</h3>
                                <p className="text-lg text-gray-700">
                                    <span className="font-semibold">Shop Name:</span> {userProfile.shop_name || 'N/A'}
                                </p>
                                <p className="text-lg text-gray-700">
                                    <span className="font-semibold">Bio:</span> {userProfile.bio || 'N/A'}
                                </p>
                                {userProfile.profile_pic && (
                                    <div className="mt-4">
                                        <span className="font-semibold block mb-2">Profile Picture:</span>
                                        <img src={userProfile.profile_pic} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                                    </div>
                                )}
                                <p className="text-lg text-gray-700 mt-4">
                                    <span className="font-semibold">Story:</span> {userProfile.story || 'N/A'}
                                </p>
                                <Link href="/seller/products" className="text-blue-600 hover:underline mt-4 inline-block">
                                    Products
                                </Link>
                            </div>
                        </>
                    )}

                    {/* Admin */}
                    {userProfile.role === 'admin' && (
                        <>
                            <div className="mt-8 pt-4 border-t border-gray-200">
                                <h3 className="text-2xl font-bold text-gray-800 mb-4">Admin Dashboard</h3>
                                <p className="text-gray-600 mb-4">
                                    Manage users and sellers on the platform.
                                </p>

                                {adminLoading ? (
                                    <p className="text-gray-700">Loading all users...</p>
                                ) : adminError ? (
                                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                                        <span className="block sm:inline">{adminError}</span>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Name</th>
                                                    <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Email</th>
                                                    <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Role</th>
                                                    <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Shop Name</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {allUsers.length > 0 ? (
                                                    allUsers.map((user) => (
                                                        <tr key={user.id} className="hover:bg-gray-50">
                                                            <td className="py-2 px-4 border-b text-sm text-gray-800">{user.name}</td>
                                                            <td className="py-2 px-4 border-b text-sm text-gray-800">{user.email}</td>
                                                            <td className="py-2 px-4 border-b text-sm text-gray-800">{user.role}</td>
                                                            <td className="py-2 px-4 border-b text-sm text-gray-800">{user.shop_name || 'N/A'}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={4} className="py-4 text-center text-gray-500">No users found.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Visible for all roles, change password */}
                    <div className="mt-8 pt-4 border-t border-gray-200">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Change Password</h3>
                        {!showPasswordForm ? (
                            <button
                                onClick={() => setShowPasswordForm(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                            >
                                Change Password
                            </button>
                        ) : (
                            <form onSubmit={handleSubmitPasswordChange} className="space-y-4">
                                <div className="mb-4">
                                    <label htmlFor="currentPassword" className="block text-gray-700 text-sm font-medium mb-2">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        id="currentPassword"
                                        className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                        placeholder="********"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="newPassword" className="block text-gray-700 text-sm font-medium mb-2">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                        placeholder="********"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                {passwordChangeError && (
                                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                                        <span className="block sm:inline">{passwordChangeError}</span>
                                    </div>
                                )}
                                {passwordChangeSuccess && (
                                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                                        <span className="block sm:inline">{passwordChangeSuccess}</span>
                                    </div>
                                )}

                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordForm(false)}
                                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
                                        disabled={passwordChangeLoading}
                                    >
                                        {passwordChangeLoading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
                <div className="mt-8 pt-4 border-t border-gray-200 flex justify-center">
                    <LogoutButton />
                </div>
            </div>
        </div>
    );
}