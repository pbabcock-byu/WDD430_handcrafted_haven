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
    <div className="form-group">
      <main >
        <h1 >Upload a Product</h1>
        {message && <p >{message}</p>}

        <form onSubmit={handleSubmit} >
          <input
            name="title"
            placeholder="Product Title"
            value={formData.title}
            onChange={handleChange}
            className="form-group"
            required

          />
          <textarea
            name="description"
            placeholder="Description"
            className="form-group"
            rows={6}
            value={formData.description}
            onChange={handleChange}
            required

          />
          <input
            name="category"
            placeholder="Category"
            className="form-group"
            value={formData.category}
            onChange={handleChange}
            required

          />
          <input
            name="material"
            placeholder="Material"
            className="form-group"
            value={formData.material}
            onChange={handleChange}
            required

          />
          <input
            name="dimensions"
            placeholder="Dimensions (e.g. 10 cm x 15 cm)"
            className="form-group"
            value={formData.dimensions}
            onChange={handleChange}
            required

          />
          <input
            name="price"
            type="number"
            className="form-group"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            required

          />
          <input
            name="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            required
            className='form-group'
          />
          <button type="submit" className="loginbutton" >
            Submit
          </button>
        </form>
      </main>
    </div>
  );
}
