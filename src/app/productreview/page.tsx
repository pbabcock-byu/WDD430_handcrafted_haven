'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import '../globals.css';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
}

export default function ProductReviewPage() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  const [product, setProduct] = useState<Product | null>(null);
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!productId || !token) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setProduct(data.product);
        } else {
          console.error('Failed to fetch product');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('authToken');
    if (!token || !productId) return;

    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });

      if (res.ok) {
        setSuccessMessage('Review successfully submitted!');
        setErrorMessage('');
        setRating('');
        setComment('');

        // Clear message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setErrorMessage('Failed to submit review');
        setSuccessMessage('');
      }
    } catch (err) {
      console.error('Review submission failed:', err);
      setErrorMessage('Review submission failed');
      setSuccessMessage('');
    }
  };

  if (!product) {
    return <p>Loading product details...</p>;
  }

  return (
    <div className="review-container">
      <h1>Review: {product.title}</h1>

      <div className="product-info">
        <img src={product.image_url} alt={product.title} className="review-image" />
        <p><strong>Price:</strong> ${product.price}</p>
      </div>

      <form onSubmit={handleSubmit} className="review-form">
        <label>
          Rating (1-5):
          <input
            type="number"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            min="1"
            max="5"
            required
          />
        </label>

        <label>
          Comment:
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
        </label>
        <button type="submit" className="loginbutton">
          Submit
        </button>
      </form>

      {/* Show success or error messages inline */}
      {successMessage && (
        <div className="success-message" role="alert" style={{ color: 'green', marginTop: '1rem' }}>
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="error-message" role="alert" style={{ color: 'red', marginTop: '1rem' }}>
          {errorMessage}
        </div>
      )}
    </div>
  );
}
