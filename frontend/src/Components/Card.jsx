import React from "react";
import styles from "./css/Card.module.css";

function Card({
  title = "Chef Name",
  subtitle = "Top Rated Chef",
  icon = "👨‍🍳",
  price = 499,
  onBook = () => {}
}) {
  return (
    <div className={styles.card}>

      {/* 🔝 Top Content */}
      <div className={styles.top}>
        <div className={styles.icon}>{icon}</div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>

      {/* 💰 Price */}
      <div className={styles.price}>
        ₹{price}
      </div>

      {/* 🛒 Book Button */}
      <button
        className={styles.bookBtn}
        onClick={onBook}
      >
        Book Now
      </button>

    </div>
  );
}

export default Card;