'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import '../globals.css';

type Seller = {
    id: string;
    name: string;
    bio: string;
    email: string;
    shop_name: string;
    profile_pic: string;
    story: string;
};

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchSellers() {
      try {
        const res = await fetch('/api/sellers');
        const data = await res.json();
        setSellers(data);
        console.log('Loaded sellers:', data.sellers || data);
      } catch (error) {
        console.error('Failed to load sellers:', error);
      }
    }
    fetchSellers();
  }, []);

  function handleViewProducts(sellerId: string) {
    router.push(`/sellers/${sellerId}/products`);
  }

  return (
    <main className="seller-container">
      <h1 className="seller-heading">Featured Artisans</h1>
      {sellers.length === 0 ? (
        <p className="no-sellers">No sellers found yet.</p>
      ) : (
        <ul className="seller-grid">
          {sellers.map((seller) => (
            <li key={seller.id} className="seller-card">
              <img
                src={seller.profile_pic || '/images/profile_pics/default.jpg'}
                alt={seller.name}
                className="seller-image"
              />
              <h2 className="seller-name">{seller.name}</h2>
              <p className="seller-bio"><strong>About Me:</strong><br />{seller.bio}</p>
              <p className="seller-story"><strong>Sellers Story:</strong> <br />{seller.story}</p>
              <p className="seller-shop"><strong>Shop Name: </strong> {seller.shop_name}</p>
              <p className="seller-email"><strong>Email: </strong> {seller.email}</p>

              <button
                className="view-products-btn"
                onClick={() => handleViewProducts(seller.id)}
              >
                View Listed Products
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}





/*
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Featured Artisans</h1>
      {sellers.length === 0 ? (
        <p className="text-center text-gray-500">No sellers found yet.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sellers.map((seller) => (
            <li key={seller.id} className="bg-white shadow-md rounded-md p-4">
              <img
                src={seller.profile_pic || '/images/profile_pics/default.jpg'}
                alt={seller.name}
                className="w-24 h-24 rounded-full object-cover mx-auto mb-3"
              />
              <h2 className="text-lg font-semibold text-center">{seller.name}</h2>
              <p className="text-sm text-center text-gray-600">{seller.bio}</p>
              <p className="text-xs italic text-center text-gray-500 mt-1">{seller.story}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
 
 */


