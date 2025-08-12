import Image from 'next/image';
import { getProductById, getReviewsByProductId } from '@/lib/queries';
import '../../globals.css';

interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewer_name: string;
  created_at: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  avg_rating: number;
  rating_count?: number;
}

interface ProductDetailProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailProps) {
  const { id: productId } = await params;

  const product: Product | undefined = await getProductById(productId);
  const reviews: Review[] = await getReviewsByProductId(productId);

  if (!product) {
    return <p>Product not found.</p>;
  }

  return (
    <div className="product-grid">
      <div className="product-card">
        <h2>{product.title}</h2>

        <div style={{ position: 'relative', width: '100%', height: 300, marginBottom: '1rem' }}>
          <Image
            src={product.image_url || '/images/default-product.jpg'}
            alt={product.title}
            fill
            style={{ objectFit: 'contain' }}
            sizes="(max-width: 768px) 100vw, 600px"
            priority
          />
        </div>

        <p><strong>Description:</strong> {product.description}</p>
        <p><strong>Category:</strong> {product.category}</p>
        <p className="product-rating">
          <strong>Rating:</strong>{' '}
          {product.rating_count && product.rating_count > 0 && !isNaN(Number(product.avg_rating))
            ? `${Number(product.avg_rating).toFixed(1)} (${product.rating_count} review${product.rating_count > 1 ? 's' : ''})`
            : 'No rating'}
        </p>
        <p className="product-price">
          <strong>Price:</strong> ${product.price}
        </p>
      </div>

      <div>
        <h2>Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          <ul>
            {reviews.map((review) => (
              <li key={review.id} style={{ marginBottom: '1rem' }}>
                <strong>Reviewed by: {review.reviewer_name}</strong><br />
                Rating: — {review.rating} ⭐<br />
                <em>Date: {new Date(review.created_at).toLocaleDateString()}</em>
                <p>Comments: {review.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

