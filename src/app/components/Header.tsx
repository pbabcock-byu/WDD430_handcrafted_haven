'use client';
import Link from 'next/link';
import Image from 'next/image';
import LogoutButton from "./LogoutButton";
import { NavigationType } from './types';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const navigation: NavigationType[] = [
    { name: "Home", href: "./", id: 1 },
    //{ name: "About", href: "/about", id: 2 },
    { name: "Products", href: "/products", id: 3 },
    //{ name: "Reviews", href: "/reviews", id: 4 },
    //{ name: "Artisans", href: "/artisans", id: 5 },
    { name: "Sellers", href: "/sellers", id: 6 },
];

const Header = () => {
  const [isSeller, setIsSeller] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const pathname = usePathname();

  const checkLoginStatus = () => {
      const token = localStorage.getItem("authToken");
      const role = localStorage.getItem("userRole");
      const storedUserName = localStorage.getItem('userName');
      
      setIsLoggedIn(!!token);
      setIsSeller(role === "seller");
      setUserName(storedUserName);
    };

    useEffect(() => {
      checkLoginStatus(); 

      window.addEventListener('storage', checkLoginStatus);

      return () => {
          window.removeEventListener('storage', checkLoginStatus);
      };
  }, [pathname]);

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
        <div className="navlinks flex lg:flex-1 lg:justify-end lg:gap-4 pr-8">
          {isLoggedIn ? ( 
            <>
              {userName && (
                <Link href="/profile" className="text-lg text-white hover:text-purple-200 transition-colors duration-200 cursor-pointer">
                  My Profile
                </Link>
              )}
              <LogoutButton onLogoutSuccess={checkLoginStatus}/> 
            </>
          ) : (
            <>
              <Link href="/login" className="text-lg text-white hover:text-purple-200 transition-colors duration-200">
                Login
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
