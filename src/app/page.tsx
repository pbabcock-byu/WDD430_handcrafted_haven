import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Handcrafted Haven</h1>

        <p>
          Handcrafted Haven is your premier online marketplace for unique,
          artisan-made products. We connect passionate crafters and creators
          with discerning customers who cherish the beauty, quality, and story
          behind handmade items. Forget mass production; here, every piece has a
          soul.
        </p>

        <div className={styles.ctas}>
          <nav>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li style={{ marginBottom: "1rem" }}>
                <Link
                  href="/"
                  style={{
                    textDecoration: "none",
                    color: "white",
                    fontSize: "1.2rem",
                  }}
                >
                  Home
                </Link>
              </li>
              <li style={{ marginBottom: "1rem" }}>
                <Link
                  href="/sellers"
                  style={{
                    textDecoration: "none",
                    color: "white",
                    fontSize: "1.2rem",
                  }}
                >
                  Sellers
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  style={{
                    textDecoration: "none",
                    color: "white",
                    fontSize: "1.2rem",
                  }}
                >
                  My Profile
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://github.com/pbabcock-byu/WDD430_handcrafted_haven"
          target="_blank"
        >
          GitHub Repo
        </a>
      </footer>
    </div>
  );
}
