import React from "react";
import styles from "./css/Sidebar.module.css";
import { Link } from "react-router";
import {
    FaHome,
    FaList,
    FaShoppingCart,
    FaUserTie,
    FaTicketAlt,
    FaHeart,
    FaStar,
} from "react-icons/fa";

function Sidebar({ 
    open,
    setOpen,
    username ="Customer Name",
    mobileN0 ="+91-0000000000",
    address = "  No address",
    email = "  xyz@gmail.com" 
}) {
    const menuItems = [
        { name: "Home", path: "/", icon: <FaHome /> },
        { name: "Services", path: "/services", icon: <FaList /> },
        { name: "Orders", path: "/orders", icon: <FaShoppingCart /> },
        { name: "Register For Chef", path: "/chef", icon: <FaUserTie /> },
        { name: "My Voucher", path: "/voucher", icon: <FaTicketAlt /> },
        { name: "Favourites", path: "/favourites", icon: <FaHeart /> },
    ];

    return (
        <div
            className={`${styles.overlay} ${open ? styles.show : ""}`}
            onClick={() => setOpen(false)}
        >
            {/* stop closing when clicking inside */}
            <div
                className={styles.sidebar}
                onClick={(e) => e.stopPropagation()}
            >
                {/* ❌ Close */}
                <button className={styles.close} onClick={() => setOpen(false)}>
                    ✖
                </button>

                {/* 👤 User Info */}
                <div className={styles.user}>
                    <h3>{username}</h3>
                    <p>{mobileN0}</p>
                    <p>{email}</p>
                    <p>{address}</p>
                </div>

                {/* Menu */}
                <ul className={styles.menu}>
                    {menuItems.map((item, i) => (
                        <li key={i}>
                            <Link
                                to={item.path}
                                className={styles.menuLink}
                                onClick={() => setOpen(false)} // ✅ close on click
                            >
                                <span className={styles.icon}>{item.icon}</span>
                                
                                {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>
    {/* underprocess - not complete */}
                <div className={styles.ratingBox}>
                    <span className={styles.ratingText}>Rating</span>
                    <div className={styles.ratingStars}>
                        {[...Array(5)].map((_, i) => (
                            <FaStar key={i} />
                        ))}
                    </div>
                </div>

                {/* 🚪 Logout */}
                <button className={styles.logout}>Logout</button>
            </div>
        </div>
    );
}

export default Sidebar;