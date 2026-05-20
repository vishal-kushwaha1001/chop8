import React from "react";
import styles from "./Styles/Legal.module.css";
import Footer from "../Components/Footer";

function Privacy() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1>🔐 Privacy Policy</h1>
        <p className={styles.date}>Last Updated: 2026</p>

        <section>
          <h2>1. Information We Collect</h2>
          <p>
            We collect your name, email, phone number, address, and booking details
            when you use CHOP8. Chefs may also provide pricing and specialization.
          </p>
        </section>

        <section>
          <h2>2. How We Use Your Data</h2>
          <p>
            Your data is used to process bookings, improve services, personalize
            recommendations, and ensure platform security.
          </p>
        </section>

        <section>
          <h2>3. Data Protection</h2>
          <p>
            We use secure technologies and encryption to protect your data.
            Passwords are stored securely using hashing.
          </p>
        </section>

        <section>
          <h2>4. Sharing of Information</h2>
          <p>
            We do not sell your personal data. Information is only shared with chefs
            for booking purposes or when required by law.
          </p>
        </section>

        <section>
          <h2>5. Cookies</h2>
          <p>
            We use cookies and local storage to maintain sessions and improve user experience.
          </p>
        </section>

        <section>
          <h2>6. Your Rights</h2>
          <p>
            You can update or delete your profile anytime from your account settings.
          </p>
        </section>

        <section>
          <h2>7. Contact Us</h2>
          <p>Email: support@chop8.com</p>
        </section>
      </div>

      <Footer />
    </div>
  );
}

export default Privacy;