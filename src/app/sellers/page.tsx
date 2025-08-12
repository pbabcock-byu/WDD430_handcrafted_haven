'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
        setSellers(data.sellers || data); // fallback if data is nested
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
              <div className="seller-image-wrapper" style={{ position: 'relative', width: 150, height: 150 }}>
                <Image
                  src={seller.profile_pic || '/images/profile_pics/default.jpg'}
                  alt={seller.name}
                  fill
                  style={{ objectFit: 'cover', borderRadius: '50%' }}
                  sizes="(max-width: 768px) 150px, 150px"
                  priority
                />
              </div>
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
