'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
        const res = await fetch('/api/profile', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        });

        if (res.ok) {
          const data: UserProfile = await res.json();
          setUserProfile(data);
        } else {
          const errData = await res.json();
          setError(errData.message || 'Failed to fetch profile data.');
          if (res.status === 401 || res.status === 403) {
            localStorage.clear();
            router.push('/login');
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  useEffect(() => {
    const fetchAdminUsers = async () => {
      if (userProfile?.role !== 'admin') return;

      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        router.push('/login');
        return;
      }

      try {
        setAdminLoading(true);
        const res = await fetch('/api/admin/users', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        });

        if (res.ok) {
          const data: AdminUser[] = await res.json();
          setAllUsers(data);
        } else {
          const errData = await res.json();
          setAdminError(errData.message || 'Failed to fetch users.');
        }
      } catch (err) {
        console.error('Error fetching admin users:', err);
        setAdminError('An unexpected error occurred.');
      } finally {
        setAdminLoading(false);
      }
    };

    if (userProfile) fetchAdminUsers();
  }, [userProfile, router]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError(null);
    setPasswordChangeSuccess(null);

    if (newPassword.length < 8) {
      setPasswordChangeError('New password must be at least 8 characters.');
      return;
    }

    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      router.push('/login');
      return;
    }

    try {
      setPasswordChangeLoading(true);
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.ok) {
        setPasswordChangeSuccess('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setShowPasswordForm(false);
      } else {
        const errData = await res.json();
        setPasswordChangeError(errData.message || 'Failed to update password.');
      }
    } catch (err) {
      console.error('Error updating password:', err);
      setPasswordChangeError('An unexpected error occurred.');
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  const getProfilePicUrl = (pic?: string) => {
    if (!pic) return '/default-profile.png';
    return pic.startsWith('http')
      ? pic
      : `${process.env.NEXT_PUBLIC_BASE_URL || ''}${pic}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-700 text-lg">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-md">
          {error}
          <p className="mt-2 text-sm">Please log in again.</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-700 text-lg">No profile data available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Your Profile</h2>

        {/* Profile Picture */}
        <div className="flex justify-center mb-4">
          <Image
            src={getProfilePicUrl(userProfile.profile_pic)}
            alt={`${userProfile.name}'s Profile`}
            width={96}
            height={96}
            className="rounded-full object-cover"
          />
        </div>

        <p className="text-lg text-gray-700">
          <span className="font-semibold">Name:</span> {userProfile.name}
        </p>
        <p className="text-lg text-gray-700">
          <span className="font-semibold">Email:</span> {userProfile.email}
        </p>

        {/* Seller Section */}
        {userProfile.role === 'seller' && (
          <div className="mt-8 border-t pt-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Your Shop</h3>
            <p><span className="font-semibold">Shop Name:</span> {userProfile.shop_name || 'N/A'}</p>
            <p><span className="font-semibold">Bio:</span> {userProfile.bio || 'N/A'}</p>
            <p className="mt-4"><span className="font-semibold">Story:</span> {userProfile.story || 'N/A'}</p>
            <Link href="/seller/products" className="text-blue-600 hover:underline mt-4 inline-block">
              View Products
            </Link>
          </div>
        )}

        {/* Admin Section */}
        {userProfile.role === 'admin' && (
          <div className="mt-8 border-t pt-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Admin Dashboard</h3>
            {adminLoading ? (
              <p>Loading users...</p>
            ) : adminError ? (
              <p className="text-red-500">{adminError}</p>
            ) : (
              <table className="w-full text-sm border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Email</th>
                    <th className="p-2 border">Role</th>
                    <th className="p-2 border">Shop Name</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.length ? (
                    allUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="p-2 border">{u.name}</td>
                        <td className="p-2 border">{u.email}</td>
                        <td className="p-2 border">{u.role}</td>
                        <td className="p-2 border">{u.shop_name || 'N/A'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-2 text-center text-gray-500">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Change Password */}
        <div className="mt-8 border-t pt-4">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Change Password</h3>
          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Change Password
            </button>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full border rounded-lg px-3 py-2"
              />
              {passwordChangeError && <p className="text-red-500">{passwordChangeError}</p>}
              {passwordChangeSuccess && <p className="text-green-500">{passwordChangeSuccess}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordChangeLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {passwordChangeLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-8 border-t pt-4 flex justify-center">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
