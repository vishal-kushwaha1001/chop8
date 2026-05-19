// src/Components/PaymentGateway.jsx
import React, { useState } from "react";
import ReactDOM from "react-dom";
import { API } from "../config";
import styles from "./css/PaymentGateway.module.css";

/* ─── Portal wrapper — renders directly into document.body ─
   This escapes ANY parent container that has overflow:hidden,
   transform, or creates a stacking context, which would trap
   position:fixed inside the parent instead of the viewport.
─────────────────────────────────────────────────────────── */
function Portal({ children }) {
  return ReactDOM.createPortal(children, document.body);
}

function PaymentGateway({ booking, paymentType = "ADVANCE", onSuccess, onClose }) {
  const [step,      setStep]      = useState("form");
  const [card,      setCard]      = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [error,     setError]     = useState("");
  const [receipt,   setReceipt]   = useState(null);
  const [smsCopied, setSmsCopied] = useState(false);

  const isFinal = paymentType === "FINAL";
  const amount  = isFinal
    ? (booking?.finalAmount   || 0)
    : (booking?.advanceAmount || 0);
  const label   = isFinal ? "Final Payment (70%)" : "Advance Payment (30%)";

  /* ── Card input handlers ── */
  const handleCardNumber = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 16);
    setCard({ ...card, number: val.match(/.{1,4}/g)?.join(" ") || val });
    setError("");
  };

  const handleExpiry = (e) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (val.length >= 3) val = val.slice(0, 2) + "/" + val.slice(2);
    setCard({ ...card, expiry: val });
    setError("");
  };

  /* ── Pay handler ── */
  const handlePay = async () => {
    const raw = card.number.replace(/\s/g, "");
    if (!card.name.trim())        { setError("Please enter cardholder name."); return; }
    if (raw.length !== 16)        { setError("Please enter a valid 16-digit card number."); return; }
    if (card.expiry.length !== 5) { setError("Please enter a valid expiry (MM/YY)."); return; }
    if (card.cvv.length < 3)      { setError("Please enter a valid CVV."); return; }

    setStep("processing");
    setError("");
    await new Promise(r => setTimeout(r, 2500));

    try {
      const res  = await fetch(`${API.payment}/process`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id, amount, paymentType }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Payment failed. Please try again.");
        setStep("form");
        return;
      }

      setReceipt(data);
      setStep("success");
      setTimeout(() => { if (onSuccess) onSuccess(data); }, 100);

    } catch {
      setError("Network error. Please check your connection and try again.");
      setStep("form");
    }
  };

  const handleCopySms = () => {
    if (!receipt?.smsText) return;
    navigator.clipboard.writeText(receipt.smsText)
      .then(() => { setSmsCopied(true); setTimeout(() => setSmsCopied(false), 2500); })
      .catch(() => {});
  };

  /* ── Processing screen ── */
  if (step === "processing") return (
    <Portal>
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.processingWrap}>
            <div className={isFinal ? styles.spinnerFinal : styles.spinner} />
            <div className={styles.processingTitle}>Processing {label}…</div>
            <p className={styles.processingNote}>Please do not close this window</p>
            <div className={isFinal ? styles.processingAmountFinal : styles.processingAmount}>
              ₹{amount}
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );

  /* ── Success screen ── */
  if (step === "success" && receipt) return (
    <Portal>
      <div className={styles.overlay}>
        <div className={styles.modal}>

          <div className={styles.successHeader}>
            <span className={styles.successIcon}>✅</span>
            <div className={styles.successTitle}>{receipt.paymentLabel} Successful!</div>
            <p className={styles.successSub}>
              ₹{receipt.amountPaid} paid
              {receipt.tokenId ? ` · Token: ${receipt.tokenId}` : ""}
            </p>
          </div>

          <div className={styles.successBody}>

            <div className={styles.receiptBox}>
              <div className={styles.receiptTitle}>🧾 Payment Receipt</div>
              <div className={styles.receiptGrid}>
                <Row label="Payment ID"    value={receipt.paymentId} />
                <Row label="Type"          value={receipt.paymentLabel} />
                {receipt.tokenId && <Row label="Token" value={receipt.tokenId} />}
                <Row label="Chef"          value={receipt.chefName} />
                <Row label="Date"          value={receipt.date} />
                {receipt.timeIn && <Row label="Timings" value={`${receipt.timeIn} – ${receipt.timeOut}`} />}
                <div className={styles.receiptDivider} />
                <Row label="Chef Charges"  value={`₹${receipt.chefAmount}`} />
                <Row label="Platform Fee"  value={`₹${receipt.platformCharge}`} />
                <Row label="GST (3%)"      value={`₹${receipt.gstAmount}`} />
                <div className={styles.receiptDivider} />
                <Row label="Total Amount"  value={`₹${receipt.totalAmount}`}  highlight />
                <Row label="Amount Paid"   value={`₹${receipt.amountPaid}`}   highlight />
                {!isFinal && <Row label="Remaining (70%)" value={`₹${receipt.finalAmount}`} />}
                <Row label="Paid At"       value={receipt.paidAt} />
              </div>
            </div>

            <div className={styles.smsPanel}>
              <div className={styles.smsPanelTitle}>📱 SMS Confirmation</div>
              <div className={styles.smsTextBox}>{receipt.smsText}</div>
              <button onClick={handleCopySms} className={styles.btnCopySms}>
                {smsCopied ? "✅ Copied!" : "📋 Copy Message"}
              </button>
            </div>

            <a
              href={`${API.receipt}/${receipt.bookingId}`}
              download={`Chop8_Receipt_${receipt.tokenId || receipt.bookingId}.txt`}
              className={styles.btnDownload}
            >
              ⬇️ Download Receipt
            </a>

            <button onClick={onClose} className={styles.btnDone}>Done</button>
          </div>
        </div>
      </div>
    </Portal>
  );

  /* ── Payment form ── */
  return (
    <Portal>
      <div className={styles.overlay}>
        <div className={styles.modal}>

          {/* Header */}
          <div className={isFinal ? styles.headerFinal : styles.headerAdvance}>
            <div className={styles.headerLeft}>
              <div className={styles.headerLabel}>{label}</div>
              <div className={styles.headerAmount}>₹{amount}</div>
              <div className={styles.headerChef}>
                {booking?.tokenId ? `${booking.tokenId} · ` : ""}Chef {booking?.chef?.name}
              </div>
            </div>
            <div className={styles.headerIcon}>💳</div>
          </div>

          {/* Body */}
          <div className={styles.body}>

            {error && <div className={styles.errBox}>{error}</div>}

            {/* Price summary */}
            <div className={styles.priceSummary}>
              <div className={styles.priceSummaryRow}>
                <span>Chef + Platform + GST</span>
                <span className={styles.priceSummaryTotal}>
                  ₹{booking?.totalAmount || amount}
                </span>
              </div>
              <hr className={styles.priceDivider} />
              <div className={styles.priceDueRow}>
                <span className={isFinal ? styles.priceDueLabelFinal : styles.priceDueLabelAdvance}>
                  {isFinal ? "Final 70% Due Now" : "Advance 30% Due Now"}
                </span>
                <span className={isFinal ? styles.priceDueAmountFinal : styles.priceDueAmountAdvance}>
                  ₹{amount}
                </span>
              </div>
            </div>

            {/* Card number */}
            <div className={styles.fg}>
              <label className={styles.lbl}>Card Number</label>
              <input
                placeholder="1234 5678 9012 3456"
                value={card.number}
                onChange={handleCardNumber}
                maxLength={19}
                className={styles.inp}
              />
            </div>

            {/* Cardholder name */}
            <div className={styles.fg}>
              <label className={styles.lbl}>Cardholder Name</label>
              <input
                placeholder="Name on card"
                value={card.name}
                onChange={e => { setCard({ ...card, name: e.target.value }); setError(""); }}
                className={styles.inp}
              />
            </div>

            {/* Expiry + CVV */}
            <div className={styles.twoCol}>
              <div className={styles.fg}>
                <label className={styles.lbl}>Expiry (MM/YY)</label>
                <input
                  placeholder="MM/YY"
                  value={card.expiry}
                  onChange={handleExpiry}
                  maxLength={5}
                  className={styles.inp}
                />
              </div>
              <div className={styles.fg}>
                <label className={styles.lbl}>CVV</label>
                <input
                  placeholder="•••"
                  type="password"
                  value={card.cvv}
                  maxLength={4}
                  onChange={e => { setCard({ ...card, cvv: e.target.value.replace(/\D/g, "") }); setError(""); }}
                  className={styles.inp}
                />
              </div>
            </div>

            {/* Actions */}
            <div className={styles.actionRow}>
              <button
                onClick={handlePay}
                className={isFinal ? styles.btnPayFinal : styles.btnPayAdvance}
              >
                🔒 Pay ₹{amount}
              </button>
              <button onClick={onClose} className={styles.btnCancel}>Cancel</button>
            </div>

            <p className={styles.simNote}>🔒 Simulated payment — no real money charged</p>
          </div>
        </div>
      </div>
    </Portal>
  );
}

/* ── Receipt row ── */
function Row({ label, value, highlight }) {
  return (
    <>
      <div className={styles.receiptLabel}>{label}</div>
      <div className={highlight ? styles.receiptValueHighlight : styles.receiptValue}>{value}</div>
    </>
  );
}

export default PaymentGateway;