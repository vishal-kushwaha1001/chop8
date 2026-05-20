import React from 'react'
import styles from "./css/Navbar.module.css"
import { NavLink, Link } from 'react-router'
import RightNav from './RightNav';
import { getUser, logout } from "../services/AuthService";
import {
  FaHome,
  FaServicestack,
  FaShoppingCart,
  FaInfoCircle,FaClipboardList
} from "react-icons/fa";


function Navbar() {
  const loggedUser = getUser();
    const isChef     = loggedUser?.role === "chef";
  
    const ordersItem = isChef
      ? { name: "My Bookings", path: "/chef-orders", label: "My Bookings",  icon: <FaClipboardList /> }
      : { name: "My Orders",   path: "/orders",  label: "My Orders",    icon: <FaShoppingCart /> };

 const navItems = [
    { path: "/", label: "Home", icon: <FaHome /> },
    { path: "/Services", label: "Services", icon: <FaServicestack /> },
    ordersItem,
    { path: "/About", label: "About", icon: <FaInfoCircle /> },
  ];

   

  return (
    <header className={styles.header}>
      <nav className={styles.navbar}>
        <div className={styles.container}>

          {/* Logo */}
          <Link to="/" className={styles.logo}>
            <img
              src="/chop8_logo.png"
              className={styles.logoImg}
              alt="Logo"
            /> 
            <p className={styles.logoText}>chop8</p>
          </Link>

          <RightNav 
          ordersItem = {ordersItem}
          isChef =  {isChef}
          />

          {/* Menu */}
          <div className={styles.menuContainer} id="">
            <ul className={styles.menu}>

              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `${styles.link} ${isActive ? styles.active : ""}`
                    }
                  >
                    <span className={styles.icon}>{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </nav>
    </header>
  );
}

export default Navbar;