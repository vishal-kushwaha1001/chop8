// src/pages/NotFound.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { getUser } from "../services/AuthService";
import styles from "./Styles/NotFound.module.css";

function NotFound() {
  const navigate   = useNavigate();
  const loggedUser = getUser();
  const isChef     = loggedUser?.role === "chef";

  const [count, setCount] = useState(10);

  // Auto-redirect after 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  const quickLinks = [
    { to: "/",           label: "🏠 Home" },
    { to: "/services",   label: "✂️ Services" },
    isChef
      ? { to: "/chef-orders", label: "📋 My Dashboard" }
      : { to: "/orders",      label: "🛒 My Orders" },
    { to: "/recommended", label: "🏆 Leaderboard" },
  ];

  return (
    <div className={styles.page}>

      {/* Animated 404 */}
      <div className={styles.codeWrap}>
        <span className={styles.four}>4</span>
        <span className={styles.plate}>🍽️</span>
        <span className={styles.four}>4</span>
      </div>

      {/* Message */}
      <h1 className={styles.title}>Page Not Found</h1>
      <p className={styles.desc}>
        Looks like this dish isn't on our menu. The page you're looking for
        doesn't exist or has been moved.
      </p>

      {/* Auto redirect countdown */}
      <div className={styles.countdownBox}>
        <span className={styles.countdownDot} />
        Redirecting to Home in <strong className={styles.countdownNum}>{count}s</strong>
      </div>

      {/* Primary CTA */}
      <Link to="/" className={styles.btnHome}>
        ← Back to Home
      </Link>

      {/* Quick links */}
      <div className={styles.linksSection}>
        <p className={styles.linksTitle}>Or go to:</p>
        <div className={styles.linksGrid}>
          {quickLinks.map(link => (
            <Link key={link.to} to={link.to} className={styles.linkCard}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}

export default NotFound;