
//you can use the next/image component to automatically optimize your images

import './globals.css';


import Link from "next/link";

const HomePage = () => {
  return (
    <div>
      <br />
      <div>
        <main className="p-4">
          <h2>Testing header 2</h2>
          <br />
          <br />
          <p>
            Handcrafted Haven is your premier online marketplace for unique,
            artisan-made products. We connect passionate crafters and creators
            with discerning customers who cherish the beauty, quality, and story
            behind handmade items. Forget mass production; here, every piece has a
            soul.
          </p>
          <Link href="/sign-up-seller" className="text-sm font-semibold leading-6">
                Join us as a Seller! <span aria-hidden="true">&larr;</span>
          </Link>
          <br />
          <br />
          <div className="bg-red-500 text-white p-4">
            If this background is red, Tailwind is working!
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;


