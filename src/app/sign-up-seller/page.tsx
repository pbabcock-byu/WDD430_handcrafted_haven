'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../globals.css';

export default function SignUpSellerPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [shop_name, setShopName] = useState('');
    const [profile_pic, setProfilePic] = useState('');
    const [bio, setBio] = useState('');
    const [story, setStory] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            const body = {
                name,
                email,
                password,
                shop_name, 
                profile_pic, 
                bio,        
                story,      
            };

            const response = await fetch('/api/sign-up-seller', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                const data = await response.json();
                console.warn('Seller registration successful:', data);
                setSuccess(data.message || 'Seller account created successfully! You can now log in.');
                setName('');
                setEmail('');
                setPassword('');
                setShopName('');
                setProfilePic('');
                setBio('');
                setStory('');
                setTimeout(() => router.push('/login'), 2000);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Seller registration failed. Please try again.');
            }
        } catch (err) {
            console.error('Network error during seller registration:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-group min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Sign Up as a Seller</h2>

                <form onSubmit={handleSubmit}>
                    {/* Name Input */}
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-2">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                            placeholder="Jane Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    {/* Email Input */}
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                            placeholder="your.shop.email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {/* Password Input */}
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Shop Name Input */}
                    <div className="mb-4">
                        <label htmlFor="shop_name" className="block text-gray-700 text-sm font-medium mb-2">
                            Shop Name
                        </label>
                        <input
                            type="text"
                            id="shop_name"
                            className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                            placeholder="Jane's Handmade Wonders"
                            value={shop_name}
                            onChange={(e) => setShopName(e.target.value)}
                            required
                        />
                    </div>

                    {/* Profile Picture URL (Optional) */}
                    <div className="mb-4">
                        <label htmlFor="profile_pic" className="block text-gray-700 text-sm font-medium mb-2">
                            Profile Picture URL (Optional)
                        </label>
                        <input
                            type="url"
                            id="profile_pic"
                            className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                            placeholder="https://example.com/your-profile.jpg"
                            value={profile_pic}
                            onChange={(e) => setProfilePic(e.target.value)}
                        />
                    </div>

                    {/* Bio (Optional) */}
                    <div className="mb-4">
                        <label htmlFor="bio" className="block text-gray-700 text-sm font-medium mb-2">
                            Bio (Optional)
                        </label>
                        <textarea
                            id="bio"
                            rows={3}
                            className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                            placeholder="Tell us about your craft and passion..."
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                        ></textarea>
                    </div>

                    {/* Story (Optional) */}
                    <div className="mb-6">
                        <label htmlFor="story" className="block text-gray-700 text-sm font-medium mb-2">
                            Your Crafting Story (Optional)
                        </label>
                        <textarea
                            id="story"
                            rows={5}
                            className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                            placeholder="Share the journey behind your handcrafted items..."
                            value={story}
                            onChange={(e) => setStory(e.target.value)}
                        ></textarea>
                    </div>

                    {/* Error Message Display */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {/* Success Message Display */}
                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                            <span className="block sm:inline">{success}</span>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="signupseller w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition duration-200 ease-in-out transform hover:scale-105"
                        disabled={loading}
                    >
                        {loading ? 'Signing as Seller...' : 'Sign Up as Seller'}
                    </button>
                </form>

                <p className="text-center text-gray-600 text-sm mt-6">
                    Already have an account?{' '}
                    <a href="/login" className="text-blue-600 hover:underline font-medium">
                        Login here
                    </a>
                </p>
            </div>
        </div>
    );
}
