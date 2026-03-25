import React from "react";
import styles from "./css/Rightnav.module.css";
import { Link } from "react-router";
import { FaUserCircle } from "react-icons/fa"; 

function RightNav({ isLoggedIn = false }) {
    return (
        <>

            {isLoggedIn ? (
                <div className={styles.actions}>
                    <Link to="/profile" className={styles.profileBtn}>
                       <FaUserCircle className={styles.icon} /> Profile
                    </Link>
                </div>
            ) : (
                <div className={styles.actions}>
                    <Link to="/login" className={styles.loginBtn}>
                        LogIn
                    </Link>
                    <Link to="/signup" className={styles.startBtn}>
                        Get started
                    </Link>

                </div>
            )}
        </>
    );
}

export default RightNav;
