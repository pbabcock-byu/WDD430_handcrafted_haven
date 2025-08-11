import '../../../globals.css';
import { getSellerProducts, getSellerInfo } from '@/lib/queries';

//export const runtime = 'nodejs'; 

type Product = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price: number;
  category: string;
};

interface SellerProductsPageProps {
  params: Promise<{ id: string }>; 
}

export default async function SellerProductsPage({ params }: SellerProductsPageProps) {
  const { id: sellerId } = await params;

  const products = await getSellerProducts(sellerId);
  const seller = await getSellerInfo(sellerId); 

  return (

    <div>
      <h1 className="seller-heading">{seller?.shop_name || seller?.name}'s Products</h1>

      <div className="product-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="product-image"
                />
                <div className="product-details">
                  <h2 className="product-title"> {product.title}</h2>
                  <p className="product-category">
                    <strong>Category:</strong> {product.category}
                  </p>
                  <p className="product-description">
                    <strong>Description:</strong> {product.description}
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
