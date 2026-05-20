
import React, { useState, useEffect } from "react";
import styles from "./css/Sidebar.module.css";
import { Link } from "react-router";
import { getUser } from "../services/AuthService";
import { API } from "../config";
import {
  FaHome, FaList, FaShoppingCart,
  FaClipboardList, FaCreditCard, FaUser,
} from "react-icons/fa";
import { IoIosHelpCircle } from "react-icons/io";

function Sidebar({
  open, setOpen, onLogout, ordersItem, isChef,
  username    = "Customer Name",
  mobileN0    = "+91-0000000000",
  address     = "No address",
  email       = "xyz@gmail.com",
  photo       = "",   // prop from parent (may be empty — sidebar fetches it anyway)
  avgRating   = 0,
  ratingCount = 0,
}) {
  // Live photo fetched from API — overrides empty prop
  const [livePhoto,       setLivePhoto]       = useState(photo || "");
  const [liveAvgRating,   setLiveAvgRating]   = useState(avgRating   || 0);
  const [liveRatingCount, setLiveRatingCount] = useState(ratingCount || 0);

  /* ── Fetch live profile from API ── */
  const fetchProfile = async () => {
    const user = getUser();
    if (!user) return;
    try {
      const res = await fetch(`${API.profile}/${user.role}/${user.userId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.photo       !== undefined) setLivePhoto(data.photo       || "");
      if (data.avgRating   !== undefined) setLiveAvgRating(data.avgRating   || 0);
      if (data.ratingCount !== undefined) setLiveRatingCount(data.ratingCount || 0);
    } catch { /* ignore — keep whatever is in state */ }
  };

  useEffect(() => {
    // Fetch on mount
    fetchProfile();

    // Re-fetch whenever Profile.jsx fires the update event
    window.addEventListener("chop8_profile_updated", fetchProfile);
    return () => window.removeEventListener("chop8_profile_updated", fetchProfile);
  }, []);

  // If parent later passes a non-empty photo prop, use it
  useEffect(() => {
    if (photo) setLivePhoto(photo);
  }, [photo]);

  // Use live photo if available, else prop, else nothing
  const displayPhoto = livePhoto || photo || "";

  const menuItems = [
    { name: "Home",       path: "/",          icon: <FaHome /> },
    { name: "Services",   path: "/services",  icon: <FaList /> },
    ordersItem,
    ...(!isChef ? [{ name: "My Payments", path: "/payments", icon: <FaCreditCard /> }] : []),
    { name: "Contact Us", path: "/contactus", icon: <IoIosHelpCircle /> },
  ];

  const stars = Math.min(5, Math.max(0, Math.round(Number(liveAvgRating) || 0)));

  return (
    <div
      className={`${styles.overlay} ${open ? styles.show : ""}`}
      onClick={() => setOpen(false)}
    >
      <div className={styles.sidebar} onClick={e => e.stopPropagation()}>

        {/* Close */}
        <button className={styles.close} onClick={() => setOpen(false)}>✕</button>

        {/* Profile header */}
        <div className={styles.profileHeader}>
          <div className={styles.avatarRing}>
            {displayPhoto ? (
              <img
                src={displayPhoto}
                alt={username}
                className={styles.avatarImg}
                onError={() => setLivePhoto("")}  /* fallback if image fails */
              />
            ) : (
              <div className={styles.avatarFallback}>
                {isChef ? "👨‍🍳" : "👤"}
              </div>
            )}
          </div>

          <div className={styles.profileMeta}>
            <h3 className={styles.profileName}>{username}</h3>
            {isChef && (
              <span className={styles.roleBadge}>👨‍🍳 Chef Account</span>
            )}
            {liveRatingCount > 0 && (
              <div className={styles.ratingRow}>
                <span className={styles.stars}>
                  {"★".repeat(stars)}
                  <span className={styles.starsEmpty}>{"★".repeat(5 - stars)}</span>
                </span>
                <span className={styles.ratingNum}>
                  {Number(liveAvgRating).toFixed(1)} ({liveRatingCount})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Contact info */}
        <div className={styles.contactBox}>
          {mobileN0 && mobileN0 !== "+91-0000000000" && (
            <div className={styles.contactRow}>
              <span className={styles.contactIcon}>📞</span>
              <span>{mobileN0}</span>
            </div>
          )}
          {email && email !== "xyz@gmail.com" && (
            <div className={styles.contactRow}>
              <span className={styles.contactIcon}>✉️</span>
              <span>{email}</span>
            </div>
          )}
          {address && address !== "No address" && (
            <div className={styles.contactRow}>
              <span className={styles.contactIcon}>📍</span>
              <span>{address}</span>
            </div>
          )}
        </div>

        {/* Edit Profile link */}
        <Link
          to="/profile"
          className={styles.editProfileBtn}
          onClick={() => setOpen(false)}
        >
          <FaUser style={{ fontSize: "12px" }} /> Edit Profile
        </Link>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Menu links */}
        <ul className={styles.menu}>
          {menuItems.filter(Boolean).map((item, i) => (
            <li key={i}>
              <Link
                to={item.path}
                className={styles.menuLink}
                onClick={() => setOpen(false)}
              >
                <span className={styles.icon}>{item.icon}</span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Logout */}
        <button className={styles.logout} onClick={onLogout}>
          🚪 Logout
        </button>

      </div>
    </div>
  );
}

export default Sidebar;