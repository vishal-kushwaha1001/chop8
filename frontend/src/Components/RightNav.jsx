import React, { useState } from "react";
import styles from "./css/Rightnav.module.css";
import { Link } from "react-router";
import { FaBars, FaUserCircle } from "react-icons/fa";
import Sidebar from "./Sidebar.jsx";

function RightNav({ isLoggedIn = false}) {


    const [open, setOpen] = useState(false);

    return (
        <>



            {/*  */}
            <div className={styles.actions}>
                {isLoggedIn ? (
          <Link to="/profile" className={styles.profileBtn}>
                <FaUserCircle className={styles.icon} /> Profile
            </Link>
            ) : (
            <>
                <Link to="/login" className={styles.loginBtn}>
                    Log in
                </Link>
                <Link to="/signup" className={styles.startBtn}>
                    Get started
                </Link>
            </>
        )}

            {/* Custom Hamburger */}
            <div
                className={`${styles.hamburger} ${open ? styles.active : ""}`}
                onClick={() => setOpen(!open)}
            >
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div >

            {/* Sidebar */ }
            < Sidebar open = { open } setOpen = { setOpen } />
    </>

        
    );
}

export default RightNav;
