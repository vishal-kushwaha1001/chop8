import React from "react";
import styles from "./Styles/Home.module.css"
import Card from "../Components/Card";
import { Link } from "react-router";
import Footer from "../Components/Footer";

function Home() {
  return (
    <div className={styles.home}>

      {/* 🔥 HERO */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Book Professional Chefs at Your Home</h1>
          <p>Enjoy restaurant-quality meals with expert chefs</p>

          <div className={styles.heroBtns}>
            <Link to="/services">
              <button className={styles.primaryBtn}>Explore Services</button>
            </Link>

            <Link to="/signup">
              <button className={styles.secondaryBtn}>Become a Chef</button>
            </Link>
          </div>
        </div>
      </section>

      {/* 🍽️ SERVICES */}
      <section className={styles.section}>
        <h2>Our Services</h2>

        <div className={styles.cards}>
          <Card
            title="Personal Chef"
            subtitle="Cook at your home"
            icon="👨‍🍳"
            price={499}
          />
          <Card
            title="Event Catering"
            subtitle="For parties & events"
            icon="🎉"
            price={999}
          />
          <Card
            title="Meal Prep"
            subtitle="Healthy daily meals"
            icon="🍱"
            price={299}
          />
        </div>
      </section>

      {/* ⭐ TOP CHEFS */}
      <section className={styles.sectionAlt}>
        <h2>Top Chefs</h2>

        <div className={styles.cards}>
          <Card
            title="Chef Vishal"
            subtitle="⭐ 4.8 Rating"
            icon="👨‍🍳"
            price={599}
            onBook={() => alert("Booking Chef Rahul")}
          />
          <Card
            title="Chef Anant"
            subtitle="⭐ 4.7 Rating"
            icon="👩‍🍳"
            price={699}
            onBook={() => alert("Booking Chef Priya")}
          />
          <Card
            title="Chef Vinayak"
            subtitle="⭐ 4.9 Rating"
            icon="👨‍🍳"
            price={799}
            onBook={() => alert("Booking Chef Aman")}
          />
        </div>
      </section>

      {/* 🚀 CTA */}
      <section className={styles.cta}>
        <h2>Join as a Chef Partner</h2>
        <p>Start earning by sharing your cooking skills</p>

        <Link to="/signup">
          <button className={styles.primaryBtn}>Register Now</button>
        </Link>
      </section>
     <Footer/>
    </div>

  );
}

export default Home;