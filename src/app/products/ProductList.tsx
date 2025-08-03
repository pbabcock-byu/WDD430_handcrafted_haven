'use client';
import React from 'react';
import '../globals.css';

type Product = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price: number;
  category: string;
  shop_name: string | null;
};

interface Props {
  products: Product[];
}
/*
export default function ProductList({ products }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10 px-4 sm:px-6 lg:px-8">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white dark:bg-[var(--card-bg)] rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
        >
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
              {product.title}
            </h3>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              <span className="font-semibold">Category:</span> {product.category}
            </p>

            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
              <span className="font-semibold">Description:</span> {product.description}
            </p>

            <p className="text-base font-semibold text-blue-600 dark:text-blue-400 mt-2">
              <span className="font-semibold">Price:</span> ${product.price}
            </p>

            {product.shop_name && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                <span className="font-semibold">Sold by:</span> {product.shop_name}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
*/
export default function ProductList({ products }: Props) {
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

            <p className="product-price">
              <strong>Price:</strong> ${product.price}
            </p>

            {product.shop_name && (
              <p className="product-seller">
                <strong>Sold by:</strong> {product.shop_name}
              </p>
            )}

            <button className="rate-button">Rate Product</button>
          </div>
        </div>
      ))}
    </div>
  );
}
