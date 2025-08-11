import '../../../globals.css';
import { getSellerProductsWithRatings, getSellerInfo } from '@/lib/queries';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  shop_name: string | null;
  seller_id?: string;
  avg_rating?: number;
  rating_count?: number;
}

interface SellerProductsPageProps {
  params: Promise<{ id: string }>;
}

export default async function SellerProductsPage({ params }: SellerProductsPageProps) {
  const { id: sellerId } = await params;  

  const products: Product[] = await getSellerProductsWithRatings(sellerId);
  const seller = await getSellerInfo(sellerId);

  return (
    <div>
      <h1 className="c">
        {seller?.shop_name || seller?.name}'s Products
      </h1>

      <div className="product-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img
              src={product.image_url}
              alt={product.title}
              className="product-image"
            />
            <div className="product-details">
              <h2 className="product-title">{product.title}</h2>
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
