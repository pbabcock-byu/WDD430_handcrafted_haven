'use client';

import React, { useState } from 'react';

export default function UploadProduct() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    material: '',
    dimensions: '',
    price: '',
    image: null as File | null,
  });
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData((prev) => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('authToken');

    if (!token) {
      setMessage('You must be logged in as a seller to upload products.');
      return;
    }

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'image' && value instanceof File) {
        form.append('image', value);
      } else {
        form.append(key, value as string);
      }
    });

    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });

    const data = await response.json();

    if (response.ok) {
      setMessage('Product uploaded successfully!');
      setFormData({
        title: '',
        description: '',
        category: '',
        material: '',
        dimensions: '',
        price: '',
        image: null,
      });
    } else {
      setMessage(data.error || 'Something went wrong');
    }
  };

  return (
    <main className="min-h-screen flex flex-col px-4 sm:px-8 lg:px-16 py-12 bg-[var(--background)] text-[var(--foreground)] font-sans">
      <h1 className="text-3xl font-bold mb-6">Upload a Product</h1>
      {message && <p className="mb-4 text-red-500">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <input
          name="title"
          placeholder="Product Title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded"
        />
        <input
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded"
        />
        <input
          name="material"
          placeholder="Material"
          value={formData.material}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded"
        />
        <input
          name="dimensions"
          placeholder="Dimensions (e.g. 10 cm x 15 cm)"
          value={formData.dimensions}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded"
        />
        <input
          name="price"
          type="number"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded"
        />
        <input
          name="image"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          required
          className="w-full"
        />
        <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">
          Submit
        </button>
      </form>
    </main>
  );
}
