'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductList from './ProductList';
import '../globals.css';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  shop_name: string | null;
}

export default function ProductCatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState('all');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const validProducts = data.products.filter((p: Product) => p.title);
          setProducts(validProducts);
          setFiltered(validProducts);
        } else {
          router.push('/login');
        }
      } catch (err) {
        router.push('/login');
      }
    };

    fetchProducts();
  }, [router]);

  useEffect(() => {
    let temp = [...products];
    if (search) {
      temp = temp.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (category) {
      temp = temp.filter((p) => p.category === category);
    }
    if (priceRange !== 'all') {
      temp = temp.filter((p) => {
        if (priceRange === 'low') return p.price < 50;
        if (priceRange === 'medium') return p.price >= 50 && p.price <= 150;
        return p.price > 150;
      });
    }
    setFiltered(temp);
  }, [search, category, priceRange, products]);

  return (
    <div >
      <h1 className="form-group">Catalog</h1>

      <div >
        <input
          type="text"
          placeholder="Search products..."
          className="form-group"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="form-group"
        >
          <option value="">All Categories</option>
          {[...new Set(products.map((p) => p.category))].map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value)}
          className="form-group"
        >
          <option value="all">All Prices</option>
          <option value="low">Under $50</option>
          <option value="medium">$50 - $150</option>
          <option value="high">Over $150</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-medium">No products found.</p>
      ) : (
        <ProductList products={filtered} />
      )}
    </div>
  );
}
