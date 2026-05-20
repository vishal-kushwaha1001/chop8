// src/pages/ChefOrders.jsx
import React, { useEffect, useState, useCallback } from "react";
import styles from "./Styles/ChefOrders.module.css";
import { getUser } from "../services/AuthService";
import { API } from "../config";
import { Link } from "react-router";
import RatingModal from "../Components/RatingModal";

/* ─── Helpers ───────────────────────────────────────────── */
function isExpired(date, timeOut, status) {
  if (status === "EXPIRED")   return true;
  if (status === "CANCELLED") return false;
  if (!date) return false;
  const now = new Date();
  if (timeOut) return now > new Date(`${date}T${timeOut}:00`);
  return now > new Date(`${date}T23:59:59`);
}

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

/* ─── PayBadge ──────────────────────────────────────────── */
function PayBadge({ label, status, amount }) {
  const isPaid = status === "PAID";
  const isCOD  = status === "COD";
  const icon   = isPaid ? "✅" : isCOD ? "💵" : "⏳";
  const text   = isPaid ? `Paid ₹${amount || 0}` : isCOD ? "COD" : "Pending";
  const cls    = isPaid || isCOD ? styles.payPaid : isCOD ? styles.payCOD : styles.payPend;
  // refined: COD gets blue, paid gets green, pending gets yellow
  const realCls = isPaid ? styles.payPaid : isCOD ? styles.payCOD : styles.payPend;

  return (
    <div className={styles.payBadgeWrap}>
      <div className={styles.payBadgeLabel}>{label}</div>
      <div className={`${styles.payBadge} ${realCls}`}>
        {icon} {text}
      </div>
    </div>
  );
}

/* ─── PriceChip ─────────────────────────────────────────── */
function PriceChip({ label, value, bold }) {
  return (
    <div className={`${styles.priceChip} ${bold ? styles.priceChipBold : ""}`}>
      <div className={styles.priceChipLabel}>{label}</div>
      <div className={bold ? styles.priceChipValueBold : styles.priceChipValue}>{value}</div>
    </div>
  );
}

/* ─── PriceRow ──────────────────────────────────────────── */
function PriceRow({ b }) {
  if (!b.totalAmount || b.totalAmount <= 0) return null;
  return (
    <div className={`${styles.priceRow} ${b.isEmergency ? styles.priceRowEmergency : ""}`}>
      {b.isEmergency && (
        <span className={styles.emergencyBadge}>🚨 Emergency ×1.5</span>
      )}
      <PriceChip label="Chef"     value={`₹${b.chefAmount || 0}`} />
      <PriceChip label="Platform" value={`₹${b.platformCharge || 0}`} />
      <PriceChip label="GST"      value={`₹${b.gstAmount || 0}`} />
      {b.isEmergency && b.emergencySurcharge > 0 && (
        <PriceChip label="⚡ Surcharge" value={`+₹${b.emergencySurcharge}`} bold />
      )}
      <PriceChip label="Total" value={`₹${b.totalAmount || 0}`} bold />
    </div>
  );
}

/* ─── Section ───────────────────────────────────────────── */
function Section({ title, count, countCls, children }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        <span className={`${styles.sectionCount} ${countCls || ""}`}>{count}</span>
      </div>
      <div className={styles.sectionList}>{children}</div>
    </div>
  );
}

/* ─── Skeleton ──────────────────────────────────────────── */
function SkeletonList() {
  return (
    <div className={styles.skeletonList}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={styles.skeleton} style={{ height: i === 0 ? 140 : 110 }} />
      ))}
    </div>
  );
}

/* ─── Active Booking Card ───────────────────────────────── */
function ActiveCard({ b }) {
  const isPending    = b.status === "PENDING";
  const isCOD        = b.paymentMode === "COD";
  const advPaid      = b.advancePaymentStatus === "PAID";
  const isEmergency  = b.isEmergency === true;

  let tokenCls, tokenText;
  if (isEmergency) {
    tokenCls  = styles.tokenEmergency;
    tokenText = `🚨 Emergency · ${isCOD ? b.tokenId + " · COD" : b.tokenId || "—"}`;
  } else if (isPending) {
    tokenCls  = styles.tokenPending;
    tokenText = "PAYMENT PENDING";
  } else if (isCOD) {
    tokenCls  = styles.tokenCOD;
    tokenText = `${b.tokenId} · COD`;
  } else {
    tokenCls  = styles.tokenConfirmed;
    tokenText = b.tokenId || "—";
  }

  const statusCls  = isPending ? styles.pillPending : styles.pillConfirmed;
  const statusText = isPending ? "Awaiting Payment" : "Confirmed";
  const dur        = b.timeIn && b.timeOut ? calcDuration(b.timeIn, b.timeOut) : null;

  return (
    <div className={styles.card}>
      <div className={`${styles.tokenBadge} ${tokenCls}`}>{tokenText}</div>

      <div className={styles.cardBody}>
        {/* Customer */}
        <div className={styles.fieldGroup}>
          <div className={styles.fieldLabel}>Customer</div>
          <div className={styles.fieldValue}>👤 {b.user?.name || "—"}</div>
          {b.user?.email  && <div className={styles.fieldSub}>{b.user.email}</div>}
          {b.user?.mobile && <div className={styles.fieldSub}>{b.user.mobile}</div>}
        </div>

        {/* Date */}
        <div className={styles.fieldGroup}>
          <div className={styles.fieldLabel}>Date</div>
          <div className={styles.fieldValue}>📅 {b.date}</div>
        </div>

        {/* Timings */}
        {(b.timeIn || b.timeOut) && (
          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabel}>Timings</div>
            <div className={styles.fieldValue}>
              🕐 {b.timeIn || "—"} → 🕔 {b.timeOut || "—"}
            </div>
            {dur && <div className={styles.fieldSub}>{dur}</div>}
          </div>
        )}

        {/* Status */}
        <div className={styles.fieldGroup}>
          <div className={styles.fieldLabel}>Status</div>
          <span className={`${styles.statusPill} ${statusCls}`}>{statusText}</span>
        </div>

        {/* Payment */}
        {isCOD ? (
          <PayBadge label="Full Payment" status="COD" amount={b.totalAmount} />
        ) : (
          <div className={styles.payGroup}>
            <PayBadge label="Advance (30%)" status={b.advancePaymentStatus} amount={b.advanceAmount} />
            <PayBadge label="Final (70%)"   status={b.finalPaymentStatus}   amount={b.finalAmount} />
          </div>
        )}
      </div>

      <PriceRow b={b} />
    </div>
  );
}

/* ─── Past Booking Card ─────────────────────────────────── */
function PastCard({ b, ratedSet, openRateModal }) {
  const isCOD       = b.paymentMode === "COD";
  const finStatus   = b.finalPaymentStatus || b.paymentStatus;
  const fullyPaid   = finStatus === "PAID" || isCOD;
  const chefRated   = ratedSet.has(b.id);
  const canRate     = fullyPaid && !chefRated;
  const isEmergency = b.isEmergency === true;
  const dur         = b.timeIn && b.timeOut ? calcDuration(b.timeIn, b.timeOut) : null;

  return (
    <div className={styles.watermarkWrap}>
      <div className={`${styles.card} ${styles.cardExpired}`}>
        <div className={`${styles.tokenBadge} ${isEmergency ? styles.tokenEmergency : styles.tokenExpired}`}>
          {isEmergency ? `🚨 Emergency · ${b.tokenId || "—"}` : b.tokenId || "—"}
        </div>

        <div className={styles.cardBody}>
          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabel}>Customer</div>
            <div className={styles.fieldValue}>👤 {b.user?.name || "—"}</div>
            {b.user?.email && <div className={styles.fieldSub}>{b.user.email}</div>}
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabel}>Date</div>
            <div className={styles.fieldValue}>📅 {b.date}</div>
          </div>

          {(b.timeIn || b.timeOut) && (
            <div className={styles.fieldGroup}>
              <div className={styles.fieldLabel}>Timings</div>
              <div className={styles.fieldValue}>
                🕐 {b.timeIn || "—"} → 🕔 {b.timeOut || "—"}
              </div>
              {dur && <div className={styles.fieldSub}>{dur}</div>}
            </div>
          )}

          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabel}>Status</div>
            <span className={`${styles.statusPill} ${styles.pillExpired}`}>Completed</span>
          </div>

          {isCOD ? (
            <PayBadge label="Full Payment" status="COD" amount={b.totalAmount} />
          ) : (
            <div className={styles.payGroup}>
              <PayBadge label="Advance (30%)" status={b.advancePaymentStatus} amount={b.advanceAmount} />
              <PayBadge label="Final (70%)"   status={finStatus}              amount={b.finalAmount} />
            </div>
          )}

          {/* Rate button */}
          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabel}>Rating</div>
            {canRate ? (
              <button className={styles.rateBtn} onClick={() => openRateModal(b)}>
                ⭐ Rate Customer
              </button>
            ) : chefRated ? (
              <span className={styles.ratedLabel}>✅ Rated</span>
            ) : null}
          </div>
        </div>

        <PriceRow b={b} />
      </div>

      <div className={styles.watermark}>
        <span className={`${styles.watermarkText} ${styles.watermarkExpired}`}>EXPIRED</span>
      </div>
    </div>
  );
}

/* ─── Cancelled Booking Card ────────────────────────────── */
function CancelledCard({ b }) {
  const dur = b.timeIn && b.timeOut ? calcDuration(b.timeIn, b.timeOut) : null;
  return (
    <div className={styles.watermarkWrap}>
      <div className={`${styles.card} ${styles.cardCancelled}`}>
        <div className={`${styles.tokenBadge} ${styles.tokenCancelled}`}>
          {b.tokenId || "—"}
        </div>

        <div className={styles.cardBody}>
          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabel}>Customer</div>
            <div className={styles.fieldValue}>👤 {b.user?.name || "—"}</div>
            {b.user?.email && <div className={styles.fieldSub}>{b.user.email}</div>}
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabel}>Date</div>
            <div className={styles.fieldValue}>📅 {b.date}</div>
          </div>

          {(b.timeIn || b.timeOut) && (
            <div className={styles.fieldGroup}>
              <div className={styles.fieldLabel}>Timings</div>
              <div className={styles.fieldValue}>
                🕐 {b.timeIn || "—"} → 🕔 {b.timeOut || "—"}
              </div>
              {dur && <div className={styles.fieldSub}>{dur}</div>}
            </div>
          )}

          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabel}>Status</div>
            <span className={`${styles.statusPill} ${styles.pillCancelled}`}>Cancelled</span>
          </div>

          {b.cancellationPenalty > 0 && (
            <div className={styles.fieldGroup}>
              <div className={styles.fieldLabel}>Penalty</div>
              <span className={styles.penaltyChip}>
                💸 ₹{b.cancellationPenalty} forfeited
              </span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.watermark}>
        <span className={`${styles.watermarkText} ${styles.watermarkCancelled}`}>CANCELLED</span>
      </div>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────── */
function ChefOrders() {
  const [bookings,     setBookings]     = useState([]);
  const [available,    setAvailable]    = useState(false);
  const [toggling,     setToggling]     = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [rateData,     setRateData]     = useState(null);
  const [ratedSet,     setRatedSet]     = useState(new Set());

  const loggedUser = getUser();

  const fetchData = useCallback(() => {
    if (!loggedUser || loggedUser.role !== "chef") { setLoading(false); return; }

    Promise.all([
      fetch(`${API.bookings}/chef/${loggedUser.userId}`).then(r => r.json()),
      fetch(`${API.chefs}`).then(r => r.json()),
    ]).then(([bookingsData, chefsData]) => {
      const list = Array.isArray(bookingsData) ? bookingsData : [];
      setBookings(list);
      if (Array.isArray(chefsData)) {
        const me = chefsData.find(c => c.id === loggedUser.userId);
        if (me) setAvailable(me.available ?? false);
      }
      setLoading(false);
      list.forEach(b => {
        fetch(`${API.ratings}/booking/${b.id}/rater/${loggedUser.userId}?role=chef`)
          .then(r => r.json())
          .then(d => { if (d.alreadyRated) setRatedSet(prev => new Set([...prev, b.id])); })
          .catch(() => {});
      });
    }).catch(() => setLoading(false));
  }, [loggedUser?.userId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleAvailability = async () => {
    setToggling(true);
    try {
      const res  = await fetch(`${API.chefs}/${loggedUser.userId}/toggle-availability`, { method: "PUT" });
      const data = await res.json();
      if (res.ok) setAvailable(data.available);
    } finally { setToggling(false); }
  };

  const openRateModal = async (b) => {
    try {
      const cr = await fetch(`${API.ratings}/booking/${b.id}/rater/${loggedUser.userId}?role=chef`);
      const cd = await cr.json();
      if (cd.alreadyRated) { setRatedSet(prev => new Set([...prev, b.id])); return; }
    } catch { /* proceed */ }

    let rateeId   = b.user?.id;
    let rateeName = b.user?.name || "Customer";

    try {
      const r    = await fetch(`${API.ratings}/booking/${b.id}/customer-rated`);
      const data = await r.json();
      if (data.customerId) { rateeId = data.customerId; rateeName = data.customerName || "Customer"; }
    } catch { /* fallback */ }

    if (!rateeId) { alert("Could not load customer details. Please refresh and try again."); return; }
    setRateData({ booking: b, rateeId, rateeName });
  };

  /* ── Guards ── */
  if (!loggedUser) return (
    <div className={styles.page}>
      <div className={styles.guardWrap}>
        <div className={styles.guardBox}>
          <span className={styles.guardIcon}>🔒</span>
          <h2>Login Required</h2>
          <p>Please login to access the chef dashboard.</p>
          <Link to="/login" className={styles.guardBtnBlue}>Go to Login</Link>
        </div>
      </div>
    </div>
  );

  if (loggedUser.role !== "chef") return (
    <div className={styles.page}>
      <div className={styles.guardWrap}>
        <div className={styles.guardBox}>
          <span className={styles.guardIcon}>👤</span>
          <h2>Chefs Only</h2>
          <p>This dashboard is only for chef accounts.</p>
          <Link to="/orders" className={styles.guardBtnGold}>My Orders</Link>
        </div>
      </div>
    </div>
  );

  const active    = bookings.filter(b => b.status === "CONFIRMED" || b.status === "PENDING");
  const cancelled = bookings.filter(b => b.status === "CANCELLED");
  const past      = bookings.filter(b => b.status === "EXPIRED");

  return (
    <div className={styles.page}>

      {/* Rating Modal */}
      {rateData && (
        <RatingModal
          booking={rateData.booking}
          raterId={loggedUser.userId}
          raterName={loggedUser.name}
          raterRole="chef"
          rateeId={rateData.rateeId}
          rateeName={rateData.rateeName}
          rateeRole="customer"
          onClose={() => setRateData(null)}
          onSubmitted={() => {
            setRatedSet(prev => new Set([...prev, rateData.booking.id]));
            setRateData(null);
          }}
        />
      )}

      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>
            Chef <span>Dashboard</span>
          </h1>
          <p className={styles.pageSubtitle}>
            Welcome back, {loggedUser.name} · Manage your bookings and availability
          </p>
        </div>

        <div className={styles.headerRight}>
          {/* Availability status badge */}
          <div className={`${styles.statusBadge} ${available ? styles.statusAvailable : styles.statusUnavailable}`}>
            <span className={`${styles.statusDot} ${available ? styles.dotGreen : styles.dotRed}`} />
            {available ? "Available" : "Unavailable"}
          </div>

          {/* Toggle button */}
          <button
            className={`${styles.toggleBtn} ${available ? styles.toggleBtnOn : styles.toggleBtnOff}`}
            onClick={toggleAvailability}
            disabled={toggling}
          >
            {toggling ? "Updating…" : available ? "Go Unavailable" : "Go Available"}
          </button>
        </div>
      </div>

      {/* ── Stats Row ── */}
      {!loading && (
        <div className={styles.statsRow}>
          {[
            { icon: "📋", num: bookings.length,  label: "Total Bookings"    },
            { icon: "✅", num: active.length,    label: "Active"            },
            { icon: "🏁", num: past.length,      label: "Completed"         },
            { icon: "❌", num: cancelled.length, label: "Cancelled"         },
          ].map(({ icon, num, label }) => (
            <div key={label} className={styles.statCard}>
              <span className={styles.statIcon}>{icon}</span>
              <div>
                <div className={styles.statNum}>{num}</div>
                <div className={styles.statLabel}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <SkeletonList />
      ) : (
        <>
          {/* Active */}
          <Section
            title="Active Bookings"
            count={active.length}
            countCls={styles.sectionCountActive}
          >
            {active.length === 0
              ? <p className={styles.emptyMsg}>No active bookings right now.</p>
              : active.map(b => <ActiveCard key={b.id} b={b} />)
            }
          </Section>

          {/* Past */}
          <Section
            title="Past Bookings"
            count={past.length}
            countCls={styles.sectionCountPast}
          >
            {past.length === 0
              ? <p className={styles.emptyMsg}>No completed bookings yet.</p>
              : past.map(b => (
                  <PastCard
                    key={b.id}
                    b={b}
                    ratedSet={ratedSet}
                    openRateModal={openRateModal}
                  />
                ))
            }
          </Section>

          {/* Cancelled */}
          <Section
            title="Cancelled Bookings"
            count={cancelled.length}
            countCls={styles.sectionCountCancelled}
          >
            {cancelled.length === 0
              ? <p className={styles.emptyMsg}>No cancellations.</p>
              : cancelled.map(b => <CancelledCard key={b.id} b={b} />)
            }
          </Section>
        </>
      )}
    </div>
  );
}

export default ChefOrders;