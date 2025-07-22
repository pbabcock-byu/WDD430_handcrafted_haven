import Link from 'next/link';
import Image from 'next/image';
import styles from "../page.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
        <br />
        <h1>FOOTER SECTION</h1>
        <br />
        <p>© 2025 Handcrafted Haven. All rights reserved.</p>
        <br />
        <a
          href="https://github.com/pbabcock-byu/WDD430_handcrafted_haven"
          target="_blank"
        >
          GitHub Repo
        </a>

    </footer>
  );
};

export default Footer;