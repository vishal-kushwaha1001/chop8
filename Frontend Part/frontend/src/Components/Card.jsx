






// src/Components/Card.jsx
import React from "react";
import styles from "./css/Card.module.css";

function Card({
  title          = "Chef Name",
  subtitle       = "Professional Chef",
  specialisation = "",
  icon           = "👨‍🍳",
  photo          = "",       // base64 string or empty — shown if set
  price          = 0,
  avgRating      = null,
  ratingCount    = 0,
  onBook         = () => {},
  isBooked       = false,
}) {
  const hasPhoto = photo && typeof photo === "string" && photo.trim().length > 0;
  const rating   = Number(avgRating);
  const stars    = Math.min(5, Math.max(0, Math.round(rating)));

  /* Hide photo wrapper if the <img> itself fails to load */
  function handleImgError(e) {
    e.target.parentElement.style.display = "none";
  }

  return (
    <div className={styles.card}>

      {/* ── Top ──────────────────────────────────────── */}
      <div className={styles.top}>

        {/* Profile photo OR emoji fallback */}
        {hasPhoto ? (
          <div className={styles.photoWrap}>
            <img src={photo} alt={title} onError={handleImgError} />
          </div>
        ) : (
          <span className={styles.icon}>{icon}</span>
        )}

        {/* Name */}
        <h3 className={styles.name}>{title}</h3>

        {/* Specialisation badge or subtitle */}
        {specialisation ? (
          <span className={styles.specBadge}>{specialisation}</span>
        ) : (
          <p className={styles.subtitle}>{subtitle}</p>
        )}

        {/* Star rating */}
        {avgRating !== null && rating > 0 ? (
          <div className={styles.ratingWrap}>
            <span className={styles.stars}>
              {"★".repeat(stars)}
              <span className={styles.starsEmpty}>{"★".repeat(5 - stars)}</span>
            </span>
            <span className={styles.ratingText}>
              {rating.toFixed(1)} ({ratingCount})
            </span>
          </div>
        ) : (
          <div className={styles.noRating}>No ratings yet</div>
        )}
      </div>

      {/* ── Price ────────────────────────────────────── */}
      <div className={styles.price}>
        {price > 0 ? (
          `₹${price} / day`
        ) : (
          <span className={styles.priceEmpty}>Price not set</span>
        )}
      </div>

      {/* ── Book Button ──────────────────────────────── */}
      <button
        className={styles.bookBtn}
        onClick={onBook}
        disabled={isBooked}
      >
        {isBooked ? "✔ Booked" : "Book Now"}
      </button>

    </div>
  );
}

export default Card;