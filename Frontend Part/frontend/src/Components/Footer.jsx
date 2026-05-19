import styles from "./css/Footer.module.css";
import React from "react";
import { Link } from "react-router";

function Footer() {
  const links = [
    { name: "About", path: "/about" },
    { name: "Privacy", path: "/privacy" },
    { name: "Terms", path: "/terms" },
    { name: "Contact", path: "/contactus" }
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.footerLogo}>CHOP8</div>

      <div className={styles.footerLinks}>
        {links.map((l) => (
          <Link key={l.name} to={l.path} className={styles.footerLink}>
            {l.name}
          </Link>
        ))}
      </div>

      <div className={styles.footerCopy}>
        © 2026 CHOP8 · JSS Academy, Noida · Vinayak-Vishal-Anant
      </div>
    </footer>
  );
}

export default Footer;