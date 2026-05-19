// src/Components/PaymentReminderPoller.jsx
import React, { useEffect, useState, useRef } from "react";
import { getUser } from "../services/AuthService";
import { API } from "../config";
import PaymentGateway from "./PaymentGateway";
import styles from "./css/PaymentReminderPoller.module.css";

/* ── Time helpers (unchanged logic) ─────────────────────── */
function expiresWithin(date, timeOut, withinMinutes) {
  if (!date || !timeOut) return false;
  const expireAt = new Date(`${date}T${timeOut}:00`);
  const now      = new Date();
  const diffMs   = expireAt - now;
  return diffMs > 0 && diffMs <= withinMinutes * 60 * 1000;
}

function hasTimeOutPassed(date, timeOut) {
  if (!date || !timeOut) return false;
  return new Date() > new Date(`${date}T${timeOut}:00`);
}

function isWithinGracePeriod(date, timeOut) {
  if (!date || !timeOut) return false;
  const expireAt = new Date(`${date}T${timeOut}:00`);
  const now      = new Date();
  if (now <= expireAt) return false;
  return (now - expireAt) <= 24 * 60 * 60 * 1000;
}

/* ── Component ───────────────────────────────────────────── */
function PaymentReminderPoller() {
  const [reminderBooking, setReminderBooking] = useState(null);
  const [paymentType,     setPaymentType]     = useState("ADVANCE");
  const shownRef = useRef(new Set());
  const paidRef  = useRef(new Set());

  const checkPayments = async () => {
    const user = getUser();
    if (!user || user.role !== "customer") return;

    try {
      const res      = await fetch(`${API.bookings}/user/${user.userId}`);
      const bookings = await res.json();
      if (!Array.isArray(bookings)) return;

      for (const b of bookings) {
        if (b.status === "CANCELLED" || b.status === "EXPIRED") continue;
        if (b.paymentMode !== "ONLINE") continue;
        if (paidRef.current.has(b.id))  continue;
        if (shownRef.current.has(b.id)) continue;

        const advancePaid = b.advancePaymentStatus === "PAID";
        const finalPaid   = b.finalPaymentStatus   === "PAID"
                         || b.paymentStatus         === "PAID";

        if (finalPaid) {
          paidRef.current.add(b.id);
          shownRef.current.add(b.id);
          continue;
        }

        if (!advancePaid) {
          if (b.status === "CONFIRMED" && expiresWithin(b.date, b.timeOut, 2)) {
            shownRef.current.add(b.id);
            setPaymentType("ADVANCE");
            setReminderBooking(b);
            break;
          }
          if (b.status === "PENDING" && expiresWithin(b.date, b.timeOut, 2)) {
            shownRef.current.add(b.id);
            setPaymentType("ADVANCE");
            setReminderBooking(b);
            break;
          }
        } else {
          if (b.status === "CONFIRMED" &&
              hasTimeOutPassed(b.date, b.timeOut) &&
              isWithinGracePeriod(b.date, b.timeOut)) {
            shownRef.current.add(b.id);
            setPaymentType("FINAL");
            setReminderBooking(b);
            break;
          }
        }
      }
    } catch { /* ignore */ }
  };

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== "customer") return;
    checkPayments();
    const interval = setInterval(checkPayments, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (!reminderBooking) return null;

  const isAdvance = paymentType === "ADVANCE";

  return (
    <>
      {/* Banner */}
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 999, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "20px", pointerEvents: "none" }}>
        <div className={isAdvance ? styles.bannerAdvance : styles.bannerFinal}>
          <span className={styles.bannerIcon}>{isAdvance ? "⏰" : "💰"}</span>
          <div className={isAdvance ? styles.bannerTitleAdvance : styles.bannerTitleFinal}>
            {isAdvance
              ? "Advance Payment Due — Booking Expiring Soon!"
              : "Final Payment Due — Service Completed!"}
          </div>
          <p className={isAdvance ? styles.bannerDescAdvance : styles.bannerDescFinal}>
            {isAdvance
              ? `Booking with Chef ${reminderBooking.chef?.name} expires at ${reminderBooking.timeOut}. Pay advance now to confirm.`
              : `Service with Chef ${reminderBooking.chef?.name} on ${reminderBooking.date} is complete. Pay final ₹${reminderBooking.finalAmount || 0} now.`}
          </p>
        </div>
      </div>

      {/* Gateway */}
      <PaymentGateway
        booking={reminderBooking}
        paymentType={paymentType}
        onClose={() => {
          shownRef.current.delete(reminderBooking.id);
          setReminderBooking(null);
        }}
        onSuccess={() => {
          paidRef.current.add(reminderBooking.id);
          shownRef.current.add(reminderBooking.id);
          setReminderBooking(null);
        }}
      />
    </>
  );
}

export default PaymentReminderPoller;