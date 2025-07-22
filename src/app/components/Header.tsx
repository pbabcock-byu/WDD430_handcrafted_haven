import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
  return (
    <header className="bg-gray-100 p-4 flex justify-between items-center shadow-md">
      <Link href="/">
        <Image
          src="/HH-logo.png"
          alt="Logo"
          width={100}
          height={100}
          className="cursor-pointer"
        />
      </Link>
      <h1>Handcrafted Haven</h1>
      <nav>
        <ul className="flex space-x-26 px-6 py-12 rounded">
            {[
            { href: "/", label: "Home" },
            { href: "/sellers", label: "Sellers" },
            { href: "/logim", label: "Login" },
            { href: "/ratings", label: "Ratings" },
            { href: "/products", label: "Products" },
            ].map(({ href, label }) => (
            <li key={href}>
                <Link
                href={href}
                className="block px-4 py-2 rounded-lg bg-white shadow hover:red text-black text-lg font-medium transition-colors duration-100"
                >
                {label}
                </Link>
            </li>
            ))}
        </ul>

      </nav>
    </header>
  );
};

export default Header;
