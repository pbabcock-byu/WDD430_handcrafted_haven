import React from 'react';
import Image from 'next/image';
import FooterElement from './footer-element';

const Footer = () => {
  return (
    <footer className="mainfooter bg-neutral-800 py-5">
      <div className="flex flex-wrap gap-x-5 px-5">
        <FooterElement title="Contact Us">
          <p>Email: support@Handcrafted.com</p>
          <p>Phone: +0800-Crafted</p>
        </FooterElement>
        <FooterElement title="Follow Us">
          <a href="#" aria-label="Facebook">
            <Image
              src="/images/facebook.png"
              alt="Facebook"
              width={40}
              height={40}
              style={{ padding: '8px' }}
              className="inline"
            />
          </a>
          <a href="#" aria-label="Twitter">
            <Image
              src="/images/twitter.png"
              alt="Twitter"
              width={40}
              height={40}
              style={{ padding: '8px' }}
              className="inline"
            />
          </a>
          <a href="#" aria-label="Instagram">
            <Image
              src="/images/instagram.png"
              alt="Instagram"
              width={40}
              height={40}
              style={{ padding: '8px' }}
              className="inline"
            />
          </a>
          <a href="#" aria-label="Pinterest">
            <Image
              src="/images/pinterest.png"
              alt="Pinterest"
              width={40}
              height={40}
              style={{ padding: '8px' }}
              className="inline"
            />
          </a>
        </FooterElement>
      </div>
      <div className="text-center mt-5 text-neutral-400">
        <p>&copy; 2025 Handcrafted Haven. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
