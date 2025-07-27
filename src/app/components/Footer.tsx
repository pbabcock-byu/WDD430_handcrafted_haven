

import React from 'react';
import FooterElement from './footer-element';

const Footer = () => {
  return (
    <footer className="bg-neutral-800 py-5">
      <div className="flex flex-wrap gap-x-5 px-5">

        {/*<FooterElement title=' '>

        </FooterElement>
        */}
        <FooterElement title='Contact Us'>

          <p>Email: support@Handcrafted.com</p>
          <p>Phone: +0800-Crafted</p>
        </FooterElement>
        <FooterElement title='Follow Us'>
            <a href="#" aria-label="Facebook">
                <img src="/images/facebook.png" alt="Facebook" style={{ padding: '8px' }}className="w-5 h-5 inline" />
            </a>
            <a href="#" aria-label="Twitter">
              <img src="/images/twitter.png" alt="Twitter" style={{ padding: '8px' }} className="w-5 h-5 inline" />
            </a>
            <a href="#" aria-label="Instagram">
              <img src="/images/instagram.png" alt="Instagram" style={{ padding: '8px' }} className="w-5 h-5 inline" />
            </a>
            <a href="#" aria-label="Pinterest">
              <img src="/images/pinterest.png" alt="Pinterest" style={{ padding: '8px' }} className="w-5 h-5 inline" />
            </a>
            
        </FooterElement>
        {/*<FooterElement title=' '>

        </FooterElement>
        */}
      </div>
      <div className='text-center mt-5 text-neutral-400'>
        <p>&copy; 2025 Handcrafted Haven. All rights reserved..</p>
      </div>
    </footer>
  );
};

export default Footer;
