import './globals.css';
import Image from 'next/image';
import Link from "next/link";

const HomePage = () => {
  return (
    <div>
      <br />
      <div className='homepage'>
        <main className="p-4">
          <h2>Welcome to Handcrafted Haven</h2>
          <br />
          <br />
          <p>
            Handcrafted Haven is your premier online marketplace for unique,
            artisan-made products. We connect passionate crafters and creators
            with discerning customers who cherish the beauty, quality, and story
            behind handmade items. Forget mass production; here, every piece has a
            soul.
          </p>

          <br />
          <div>
            <a href="#" aria-label="mainpageimage">
              <Image
                src="/images/mainpageimage.png"
                alt="Marketplace Items"
                width={450}  
                height={300} 
                className="mainpageimage"
                style={{ padding: '8px' }}
              />
            </a>
          </div>
          <br />
          <Link href="/sign-up-seller" className="cta-button">
            Join us as a Seller!
          </Link>
        </main>
      </div>
    </div>
  );
};

export default HomePage;
