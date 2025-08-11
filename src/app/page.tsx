import './globals.css';


import Link from "next/link";

const HomePage = () => {
  return (
    <div >
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
                <img src="/images/mainpageimage.png" alt="Marketplace Items " style={{ padding: '8px' }}className="mainpageimage" />
            </a>
          </div>
          <br />
          <Link href="/sign-up-seller" className="text-sm font-semibold leading-6">
                Join us as a Seller! <span aria-hidden="true">&larr;</span>
          </Link>
        </main>
      </div>
    </div>
  );
};

export default HomePage;


