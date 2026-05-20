import React from "react";
import styles from "./Styles/Legal.module.css";
import Footer from "../Components/Footer";

function Terms() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1>📜 Terms & Conditions</h1>
        <p className={styles.date}>Last Updated: 2026</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By using CHOP8, you agree to follow all terms and conditions mentioned here.
          </p>
        </section>

        <section>
          <h2>2. Services</h2>
          <p>
            CHOP8 provides a platform to connect customers with professional chefs
            for home cooking services.
          </p>
        </section>

        <section>
          <h2>3. Booking & Payments</h2>
          <p>
            Users must pay according to the selected payment method. Emergency bookings
            may include additional charges.
          </p>
        </section>

        <section>
          <h2>4. Cancellation Policy</h2>
          <p>
            Cancellations within 3 hours of booking may incur penalties.
          </p>
        </section>

        <section>
          <h2>5. User Responsibilities</h2>
          <p>
            Users must provide accurate information and behave respectfully with chefs.
          </p>
        </section>

        <section>
          <h2>6. Limitation of Liability</h2>
          <p>
            CHOP8 is not responsible for disputes between users and chefs but will try
            to resolve issues fairly.
          </p>
        </section>

        <section>
          <h2>7. Changes to Terms</h2>
          <p>
            We may update these terms at any time. Continued use means acceptance.
          </p>
        </section>

        <section>
          <h2>8. Contact</h2>
          <p>Email: support@chop8.com</p>
        </section>
      </div>

      <Footer />
    </div>
  );
}

export default Terms;