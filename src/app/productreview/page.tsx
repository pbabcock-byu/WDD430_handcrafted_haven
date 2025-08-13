'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import '../globals.css';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
}

export default function ProductReviewPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <ReviewContent />
    </Suspense>
  );
}

function ReviewContent() {
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
      <h1 className="review-container">Review: {product.title}</h1>

      <div
        className="review-container product-info"
        style={{ position: 'relative', width: '300px', height: '300px' }}
      >
        <Image
          src={product.image_url}
          alt={product.title}
          fill
          style={{ objectFit: 'contain', padding: '8px' }}
          className="review-image"
          sizes="(max-width: 768px) 100vw, 300px"
          priority
        />
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
