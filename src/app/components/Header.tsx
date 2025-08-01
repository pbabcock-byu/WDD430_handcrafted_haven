'use client';
import Link from 'next/link';
import Image from 'next/image';
import { NavigationType } from './types';
import React, { useEffect, useState } from 'react';

const navigation: NavigationType[] = [
    { name: "Home", href: "./", id: 1 },
    { name: "About", href: "/about", id: 2 },
    { name: "Products", href: "/products", id: 3 },
    { name: "Reviews", href: "/reviews", id: 4 },
    { name: "Artisans", href: "/artisans", id: 5 },
    { name: "Sellers", href: "/sellers", id: 6 },
];

const Header = () => {
  const [isSeller, setIsSeller] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const token = localStorage.getItem('authToken');
    setIsSeller(role === 'seller');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <header className='mainheader'>
      <nav
        className="flex items-center justify-between p-6 lg:p-8"
        aria-label="Global"
      >
        {/* logo */}
        <div className="flex lg:flex-1">
          <Link href="/">
          </Link><Image width={120} height={120} src='/HH-logo.png' alt="logo" />
        </div>
        {/* links */}
        <div className="navlinks flex gap-x-12 items-center">
          {navigation.map((item: NavigationType) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-semibold leading-6 text-neutral-900 hover:text-neutral-500"
            >
              {item.name}
            </Link>
          ))}
          {isSeller && (
            <Link href="/upload-product" className="text-sm font-semibold leading-6 text-blue-700 hover:underline">
              + Upload Product
            </Link>
          )}
        </div>

        {/* Auth Buttons */}
        <div className="flex lg:flex-1 lg:justify-end lg:gap-4 pr-8">
          <Link href="/login" className="text-sm font-semibold leading-6">
            Log in <span aria-hidden="true">&larr;</span>
          </Link>
          <Link href="/sign-up" className="text-sm font-semibold leading-6">
            Sign Up <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
