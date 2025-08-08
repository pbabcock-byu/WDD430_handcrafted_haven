'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function EditProductPage() {
  const [product, setProduct] = useState<any>(null)
  const router = useRouter()
  const { id } = useParams<{ id: string }>() 

  const [token, setToken] = useState<string | null>(null)
  const [sellerId, setSellerId] = useState<string | null>(null)

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    if (t) {
      try {
        const payload = JSON.parse(atob(t.split('.')[1]))
        setToken(t)
        setSellerId(payload.sellerId ?? null)
      } catch (e) {
        console.error('Invalid token', e)
      }
    }
  }, [])

  useEffect(() => {
    if (!id || !sellerId || !token) return

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()

        if (!res.ok) {
          alert(data.message || 'Failed to fetch product')
          router.push('/products')
          return
        }

        if (data.product?.seller_id !== sellerId) {
          alert('You are not authorized to edit this product.')
          router.push('/products')
          return
        }

        setProduct(data.product)
      } catch (err) {
        console.error(err)
        alert('Unexpected error')
        router.push('/products')
      }
    }

    fetchProduct()
  }, [id, sellerId, token, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!id) return

    const formData = new FormData(e.currentTarget)

    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token || ''}` },
      body: formData,
    })

    if (res.ok) {
      router.push('/products')
    } else {
      alert('Error updating product')
    }
  }

  if (!product) return <p className="loading">Loading...</p>

  return (
    <div className="review-container">
      <h2 className="products-heading">Edit Product</h2>

      <form onSubmit={handleSubmit} className="review-form" encType="multipart/form-data">
        <label>
          Title
          <input type="text" name="title" defaultValue={product.title} required />
        </label>

        <label>
          Description
          <textarea name="description" defaultValue={product.description}></textarea>
        </label>

        <label>
          Price
          <input type="number" name="price" step="0.01" defaultValue={product.price} required />
        </label>

        <label>
          Replace Image
          <input type="file" name="image" />
        </label>

        <button type="submit">Save Changes</button>
      </form>
    </div>
  )
}
