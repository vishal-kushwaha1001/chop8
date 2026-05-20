// src/Components/BookingForm.jsx
//
// FIXES IN THIS VERSION:
//
// 1. CANCEL BUG — When PaymentGateway was opened after "Confirm Booking",
//    clicking Cancel was calling the outer onClose (closing the whole
//    BookingForm widget) instead of just dismissing the gateway.
//    Fix: Added separate `showGateway` boolean state. Cancel inside the
//    gateway now sets showGateway=false and shows a pay-later warning,
//    keeping the pending booking intact. The outer onClose is never called
//    from inside the gateway.
//
// 2. JPA ERROR MESSAGE — "Query did not return a unique result: 2 results
//    were returned" is a raw Spring IncorrectResultSizeDataAccessException.
//    It means the backend has a data integrity issue (duplicate rows for
//    the same booking or user query). This is a BACKEND bug to fix in the
//    Spring service layer. On the frontend, we now detect this class of
//    error and show a clean, user-friendly message instead of the raw
//    exception text.
//
//    Backend fix needed: In your Spring service, the query that does
//    findBy...() should use findFirst...() or add LIMIT 1 to prevent
//    this exception when duplicates exist in the DB.
//
import React, { useState } from "react";
import { API, calcPriceBreakdown, PAYMENT } from "../config";
import PaymentGateway from "./PaymentGateway";
import styles from "./css/BookingForm.module.css";

/* ── Helpers ─────────────────────────────────────────────── */
function calcDuration(a, b) {
  try {
    const [h1, m1] = a.split(":").map(Number);
    const [h2, m2] = b.split(":").map(Number);
    const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (mins <= 0) return null;
    const h = Math.floor(mins / 60), m = mins % 60;
    return m === 0 ? `${h} hrs` : `${h}h ${m}m`;
  } catch { return null; }
}

/* Detect raw Spring/JPA exception messages and return a clean version */
function cleanServerError(raw) {
  if (!raw) return "Booking failed. Please try again.";
  const lower = raw.toLowerCase();
  if (
    lower.includes("unique result") ||
    lower.includes("query did not") ||
    lower.includes("incorrectresultsizedata") ||
    lower.includes("2 results were returned") ||
    lower.includes("more than one result")
  ) {
    return "A server error occurred with your booking. Please try a different date or time slot, or contact support if this persists.";
  }
  return raw;
}

/* ── Price Row ───────────────────────────────────────────── */
function PRow({ label, value, bold, blue, orange, green, small }) {
  const valClass = blue
    ? styles.pValBlue
    : orange
    ? styles.pValOrange
    : green
    ? styles.pValGreen
    : styles.pValDefault;
  const rowClass = small
    ? styles.pRowSmall
    : bold
    ? styles.pRowBold
    : styles.pRow;
  return (
    <div className={rowClass}>
      <span>{label}</span>
      <span className={bold ? valClass : ""}>{value}</span>
    </div>
  );
}

/* ── BookingForm ─────────────────────────────────────────── */
function BookingForm({ chef, onClose, onBooked, alreadyBooked }) {
  const [date,        setDate]        = useState("");
  const [timeIn,      setTimeIn]      = useState("");
  const [timeOut,     setTimeOut]     = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [busy,        setBusy]        = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");

  // FIX: Split into two states.
  // pendingBooking = the booking object from the API.
  // showGateway    = whether the PaymentGateway is currently visible.
  // This lets Cancel in the gateway hide it without killing the form.
  const [pendingBooking, setPendingBooking] = useState(null);
  const [showGateway,    setShowGateway]    = useState(false);
  const [showPayWarning, setShowPayWarning] = useState(false);

  const price = chef?.pricePerDay || 0;

  const isEmergency = (() => {
    if (!date || !timeIn) return false;
    try {
      const today   = new Date().toISOString().split("T")[0];
      if (date !== today) return false;
      const now     = new Date();
      const start   = new Date(`${date}T${timeIn}:00`);
      const diffHrs = (start - now) / (1000 * 60 * 60);
      return diffHrs >= 0 && diffHrs <= PAYMENT.EMERGENCY_THRESHOLD_HRS;
    } catch { return false; }
  })();

  const breakdown = calcPriceBreakdown(price, isEmergency);

  /* ── Already booked guard ── */
  if (alreadyBooked) {
    return (
      <div className={styles.alreadyBox}>
        <span className={styles.alreadyIcon}>⚠️</span>
        <p className={styles.alreadyTitle}>
          You already have a booking with {chef.name}
        </p>
        <p className={styles.alreadyDesc}>
          On {alreadyBooked.date}
          {alreadyBooked.timeIn && ` · ${alreadyBooked.timeIn} – ${alreadyBooked.timeOut}`}
          <br />Please cancel your existing booking first.
        </p>
        <button onClick={onClose} className={styles.btnCloseSmall}>Close</button>
      </div>
    );
  }

  /* ── PaymentGateway screen ──────────────────────────────────
     FIX: Only shown when pendingBooking exists AND showGateway=true.
     The gateway's onClose now sets showGateway=false (NOT outer onClose).
     This means Cancel inside the gateway hides it but keeps the pending
     booking state alive, showing a pay-later warning instead.
  ── */
  if (pendingBooking && showGateway) {
    return (
      <div style={{ width: "100%", position: "relative" }}>
        <PaymentGateway
          booking={pendingBooking}
          paymentType="ADVANCE"
          onClose={() => {
            // FIX: Don't call outer onClose — just hide the gateway
            // and let the user decide to pay later or re-open.
            setShowGateway(false);
            setShowPayWarning(true);
          }}
          onSuccess={receipt => {
            const confirmedBooking = {
              ...pendingBooking,
              tokenId:              receipt.tokenId,
              status:               "CONFIRMED",
              advancePaymentStatus: "PAID",
              advanceAmount:        receipt.amountPaid,
              advancePaymentId:     receipt.paymentId,
            };
            if (onBooked) onBooked(confirmedBooking);
            if (onClose)  onClose();
          }}
        />
      </div>
    );
  }

  /* ── Pay-later warning (gateway was dismissed without paying) ── */
  if (pendingBooking && !showGateway && showPayWarning) {
    return (
      <div className={styles.formWrap}>
        <div className={styles.payWarning}>
          <div className={styles.payWarningTitle}>⚠️ Booking saved — payment pending</div>
          <p className={styles.payWarningDesc}>
            Your booking with <strong>{chef.name}</strong> on <strong>{pendingBooking.date}</strong> is saved
            as <strong>PENDING</strong>. The token is generated only after advance payment.
            You can pay now or later from the Orders page.
          </p>
          <div className={styles.payWarningBtns}>
            <button
              onClick={() => { setShowPayWarning(false); setShowGateway(true); }}
              className={styles.btnPayNow}
            >
              💳 Pay ₹{pendingBooking.advanceAmount || breakdown.advance} Now
            </button>
            <button
              onClick={() => {
                if (onBooked) onBooked(pendingBooking);
                if (onClose)  onClose();
              }}
              className={styles.btnPayLater}
            >
              Pay Later (Orders page)
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Date busy check ── */
  const handleDateChange = async (e) => {
    const val = e.target.value;
    setDate(val);
    setError("");
    setBusy(false);
    setBookedSlots([]);
    if (!val) return;
    try {
      const res  = await fetch(`${API.bookings}/chef/${chef.id}/busy?date=${val}`);
      const data = await res.json();
      setBookedSlots(data.bookedSlots || []);
      setBusy(data.busy === true);
      if (data.busy) {
        const slotList = (data.bookedSlots || [])
          .map(s => `${s.timeIn} – ${s.timeOut}`)
          .join(", ");
        setError(
          `${chef.name} has existing bookings on ${val} during: ${slotList}. Please choose a different time slot.`
        );
      }
    } catch { /* network error on busy check — ignore, don't block booking */ }
  };

  const handleTimeOutChange = (e) => {
    const val = e.target.value;
    setTimeOut(val);
    setError("");
    if (timeIn && val && val <= timeIn) {
      setError("Check-out must be after check-in.");
    }
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    const loggedUser = JSON.parse(localStorage.getItem("chop8_user") || "null");
    if (!loggedUser)       { setError("Please login to book."); return; }
    if (!date)             { setError("Please select a date."); return; }
    if (!timeIn)           { setError("Please select a check-in time."); return; }
    if (!timeOut)          { setError("Please select a check-out time."); return; }
    if (timeOut <= timeIn) { setError("Check-out must be after check-in."); return; }

    // Client-side overlap check
    const hasOverlap = bookedSlots.some(
      slot => timeIn < slot.timeOut && timeOut > slot.timeIn
    );
    if (hasOverlap) {
      const conflicting = bookedSlots
        .filter(s => timeIn < s.timeOut && timeOut > s.timeIn)
        .map(s => `${s.timeIn} – ${s.timeOut}`)
        .join(", ");
      setError(
        `Time conflict! ${chef.name} is already booked during ${conflicting} on ${date}. Please choose a different time.`
      );
      return;
    }

    if (!paymentMode) { setError("Please select a payment method."); return; }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(API.book, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date, timeIn, timeOut, paymentMode,
          chef: { id: chef.id },
          user: { id: loggedUser.userId },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // FIX: clean raw Spring/JPA exceptions before showing to user
        setError(cleanServerError(data.error || data.message || ""));
        return;
      }

      if (paymentMode === "ONLINE") {
        // FIX: set both states together atomically
        setPendingBooking(data);
        setShowPayWarning(false);
        setShowGateway(true);
      } else {
        if (onBooked) onBooked(data);
        if (onClose)  onClose();
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const timeInvalid = timeIn && timeOut && timeOut <= timeIn;
  const canConfirm  = !loading && !timeInvalid && !!paymentMode;
  const dur         = timeIn && timeOut && !timeInvalid ? calcDuration(timeIn, timeOut) : null;

  /* ── Render ── */
  return (
    <div className={styles.formWrap}>

      <h4 className={styles.formTitle}>Book {chef.name}</h4>

      {error && <div className={styles.errBox}>{error}</div>}

      {/* Date */}
      <div className={styles.fg}>
        <label className={styles.lbl}>📅 Select Date</label>
        <input
          type="date"
          min={new Date().toISOString().split("T")[0]}
          className={styles.inp}
          onChange={handleDateChange}
        />
      </div>

      {/* Times */}
      <div className={styles.timeRow}>
        <div className={styles.timeField}>
          <label className={styles.lbl}>🕐 Check-In</label>
          <input
            type="time"
            className={styles.inp}
            value={timeIn}
            onChange={e => { setTimeIn(e.target.value); setError(""); }}
          />
        </div>
        <div className={styles.timeField}>
          <label className={styles.lbl}>🕔 Check-Out</label>
          <input
            type="time"
            className={timeInvalid ? styles.inpError : styles.inp}
            value={timeOut}
            onChange={handleTimeOutChange}
          />
        </div>
      </div>

      {/* Status badges */}
      {dur && (
        <div className={styles.badgeGreen}>✅ {dur} · {timeIn} – {timeOut}</div>
      )}
      {date && !busy && (
        <div className={styles.badgeGreen}>✅ {chef.name} is free on {date}</div>
      )}
      {date && busy && (
        <div className={styles.badgeBlue}>
          ℹ️ {chef.name} has existing bookings today — choose a non-overlapping time slot.
        </div>
      )}

      {/* Price breakdown */}
      <div className={styles.priceBox}>
        <div className={styles.priceTitle}>
          💰 Price Breakdown
          {isEmergency && (
            <span className={styles.emergencyBadge}>🚨 Emergency</span>
          )}
        </div>

        {isEmergency ? (
          <>
            <PRow label="Base Chef Charges"
                  value={`₹${breakdown.baseChef}`} />
            <PRow label={`Emergency Surcharge (×${PAYMENT.EMERGENCY_MULTIPLIER})`}
                  value={`+₹${breakdown.surcharge}`} bold orange />
            <PRow label="Effective Chef Charges"
                  value={`₹${breakdown.chef}`} bold />
          </>
        ) : (
          <PRow label="Chef Charges" value={`₹${breakdown.chef}`} />
        )}

        <PRow label="Platform Fee" value={`₹${breakdown.platform}`} />
        <PRow label="GST (3%)"     value={`₹${breakdown.gst}`}      small />
        <hr className={styles.priceDivider} />
        <PRow label="Total Amount"        value={`₹${breakdown.total}`}   bold blue />
        <hr className={styles.priceDivider} />
        <PRow label="Advance Now (30%)"   value={`₹${breakdown.advance}`} bold orange />
        <PRow label="After Service (70%)" value={`₹${breakdown.final}`}   bold green />
      </div>

      {/* Emergency warning */}
      {isEmergency && (
        <div className={styles.emergencyWarn}>
          <div className={styles.emergencyWarnTitle}>🚨 Emergency Booking Detected</div>
          <p className={styles.emergencyWarnDesc}>
            This booking is within <strong>{PAYMENT.EMERGENCY_THRESHOLD_HRS} hours</strong> of
            start. Chef charges are <strong>×{PAYMENT.EMERGENCY_MULTIPLIER}</strong>{" "}
            (₹{breakdown.baseChef} → ₹{breakdown.chef}). Token will be marked as Emergency.
          </p>
        </div>
      )}

      {/* Cancellation policy */}
      <div className={styles.badgeYellow}>
        ⚠️ Cancellation charges will apply if the booking is canceled {PAYMENT.CANCEL_CUTOFF_HRS}  hours before the scheduled time
      </div>

      {/* Payment mode */}
      <div className={styles.fg}>
        <label className={styles.lbl}>💳 Payment Method</label>
        <div className={styles.modeRow}>

          <button
            type="button"
            onClick={() => { setPaymentMode("COD"); setError(""); }}
            className={paymentMode === "COD" ? styles.modeBtnActive : styles.modeBtn}
          >
            <span className={styles.modeIcon}>💵</span>
            <div className={paymentMode === "COD" ? styles.modeLabelActive : styles.modeLabel}>
              Cash on Delivery
            </div>
            <div className={styles.modeHint}>Full ₹{breakdown.total} in cash</div>
          </button>

          <button
            type="button"
            onClick={() => { setPaymentMode("ONLINE"); setError(""); }}
            className={paymentMode === "ONLINE" ? styles.modeBtnActive : styles.modeBtn}
          >
            <span className={styles.modeIcon}>💳</span>
            <div className={paymentMode === "ONLINE" ? styles.modeLabelActive : styles.modeLabel}>
              Online Payment
            </div>
            <div className={styles.modeHint}>Pay ₹{breakdown.advance} advance now</div>
          </button>

        </div>
      </div>

      {/* Mode notes */}
      {paymentMode === "ONLINE" && (
        <div className={styles.badgeBlue}>
          💳 Pay <strong>₹{breakdown.advance}</strong> advance now →{" "}
          <strong>token generated</strong> → pay <strong>₹{breakdown.final}</strong> after service.
        </div>
      )}
      {paymentMode === "COD" && (
        <div className={styles.badgeGreen}>
          ✅ Token generated immediately. Pay <strong>₹{breakdown.total}</strong> cash when chef arrives.
        </div>
      )}

      {/* Actions */}
      <div className={styles.actionRow}>
        <button
          onClick={handleSubmit}
          disabled={!canConfirm}
          className={canConfirm ? styles.btnConfirm : styles.btnConfirmDisabled}
        >
          {loading
            ? "Processing…"
            : paymentMode === "ONLINE"
            ? `Continue to Pay ₹${breakdown.advance} →`
            : paymentMode === "COD"
            ? "Confirm Booking (COD)"
            : "Confirm Booking"}
        </button>
        <button onClick={onClose} className={styles.btnCancel}>Cancel</button>
      </div>

    </div>
  );
}

export default BookingForm;