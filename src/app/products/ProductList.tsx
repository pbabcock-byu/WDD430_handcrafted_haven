'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // ✅ Import useRouter
import '../globals.css';

type Product = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price: number;
  category: string;
  shop_name: string | null;
  seller_id?: string; 
  avg_rating?: number;     
  rating_count?: number;    
};

interface Props {
  products: Product[];
}

export default function ProductList({ products }: Props) {
  const router = useRouter(); 

  const handleRateClick = (id: string) => {
    router.push(`/productreview?id=${id}`); 
  };

  // Use state and useEffect to safely get sellerId on client only
  const [sellerId, setSellerId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setSellerId(payload.sellerId);
      } catch (error) {
        console.error("Invalid token");
      }
    }
  }, []);

  return (
    <div className="product-grid">
      {products.map((product) => (
        <div key={product.id} className="product-card">
          <img
            src={product.image_url}
            alt={product.title}
            className="product-image"
          />
          <div className="product-details">
            <h3 className="product-title">{product.title}</h3>

            <p className="product-category">
              <strong>Category:</strong> {product.category}
            </p>

            <p className="product-description">
              <strong>Description:</strong> {product.description}
            </p>

            <p className="product-rating">
              <strong>Rating:</strong>{' '}
              {product.rating_count && product.rating_count > 0 && !isNaN(Number(product.avg_rating))
                ? `${Number(product.avg_rating).toFixed(1)} (${product.rating_count} review${product.rating_count > 1 ? 's' : ''})`
                : 'No rating'}
            </p>

            <p className="product-price">
              <strong>Price:</strong> ${product.price}
            </p>

            {product.shop_name && (
              <p className="product-seller">
                <strong>Sold by:</strong> {product.shop_name}
              </p>
            )}

            <button className="rate-button" onClick={() => handleRateClick(product.id)}>
              Rate Product
            </button>

            {/* Button to edit products if you're the owner of that product */}
            {String(product.seller_id) === String(sellerId) && (
              <button className="edit-button" onClick={() => router.push(`/edit-product/${product.id}`)}>
                Edit Product
              </button>
            )}

          </div>
        </div>
      ))}
    </div>
  );
}
