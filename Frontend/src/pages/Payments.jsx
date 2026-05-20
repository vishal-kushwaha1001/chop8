// // src/pages/Payments.jsx
// import React, { useEffect, useState } from "react";
// import { getUser } from "../services/AuthService";
// import { API } from "../config";
// import { Link } from "react-router";

// function calcDuration(timeIn, timeOut) {
//   try {
//     const [h1, m1] = timeIn.split(":").map(Number);
//     const [h2, m2] = timeOut.split(":").map(Number);
//     const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
//     if (mins <= 0) return null;
//     const h = Math.floor(mins / 60), m = mins % 60;
//     return m === 0 ? `${h} hrs` : `${h}h ${m}m`;
//   } catch { return null; }
// }

// function Payments() {
//   const [payments, setPayments] = useState([]);
//   const [loading,  setLoading]  = useState(true);
//   const loggedUser = getUser();

//   useEffect(() => {
//     if (!loggedUser || loggedUser.role !== "customer") { setLoading(false); return; }
//     fetch(`${API.payment}/user/${loggedUser.userId}`)
//       .then(r => r.json())
//       .then(data => { setPayments(Array.isArray(data) ? data : []); setLoading(false); })
//       .catch(() => setLoading(false));
//   }, []);

//   if (!loggedUser) return (
//     <div style={pageWrap}>
//       <div style={msgBox("#e3f2fd","#90caf9","#0d47a1")}>
//         <div style={iconSt}>🔒</div><h2>Login Required</h2>
//         <Link to="/login"><button style={btnPrimary}>Go to Login</button></Link>
//       </div>
//     </div>
//   );

//   if (loggedUser.role === "chef") return (
//     <div style={pageWrap}>
//       <div style={msgBox("#fff8e1","#ffe082","#7a5c00")}>
//         <div style={iconSt}>👨‍🍳</div><h2>Chefs don't have a payment section</h2>
//         <Link to="/chef-orders"><button style={btnYellow}>My Dashboard</button></Link>
//       </div>
//     </div>
//   );

//   const total = payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);

//   return (
//     <div style={{ padding: "40px 20px", maxWidth: "860px", margin: "0 auto" }}>

//       {/* Header */}
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
//         <h2 style={{ fontSize: "28px", color: "#1e3c72", margin: 0 }}>My Payments</h2>
//         <Link to="/services"><button style={btnPrimary}>+ Book a Chef</button></Link>
//       </div>
//       <p style={{ color: "#666", marginBottom: "24px" }}>
//         Hello, <strong>{loggedUser.name}</strong> — your payment receipts.
//       </p>

//       {/* Total spent summary */}
//       {payments.length > 0 && (
//         <div style={{ background: "linear-gradient(135deg,#1e3c72,#2a5298)", borderRadius: "14px", padding: "20px 24px", color: "white", marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//           <div>
//             <div style={{ fontSize: "13px", opacity: 0.8 }}>Total Spent</div>
//             <div style={{ fontSize: "32px", fontWeight: 700 }}>₹{total.toFixed(2)}</div>
//           </div>
//           <div style={{ textAlign: "right" }}>
//             <div style={{ fontSize: "13px", opacity: 0.8 }}>Payments</div>
//             <div style={{ fontSize: "32px", fontWeight: 700 }}>{payments.length}</div>
//           </div>
//         </div>
//       )}

//       {/* Receipt list */}
//       {loading ? (
//         <p style={{ color: "#888" }}>Loading payments...</p>
//       ) : payments.length === 0 ? (
//         <div style={msgBox("#f5faff","#e0eafc","#1e3c72")}>
//           <div style={iconSt}>💳</div>
//           <h3>No payments yet</h3>
//           <p style={{ fontSize: "14px", color: "#888" }}>Book a chef and complete payment to see receipts here.</p>
//           <Link to="/services"><button style={btnPrimary}>Browse Chefs</button></Link>
//         </div>
//       ) : (
//         <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
//           {payments.map(p => (
//             <div key={p.id} style={card}>
//               {/* Token badge */}
//               <div style={tokenBadge}>{p.tokenId}</div>

//               {/* PAID badge */}
//               <div style={paidBadge}>✅ PAID</div>

//               <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>

//                 <div>
//                   <div style={lbl}>Chef</div>
//                   <div style={val}>👨‍🍳 {p.chef?.name || "—"}</div>
//                 </div>

//                 <div>
//                   <div style={lbl}>Date</div>
//                   <div style={val}>📅 {p.date}</div>
//                 </div>

//                 {(p.timeIn || p.timeOut) && (
//                   <div>
//                     <div style={lbl}>Timings</div>
//                     <div style={val}>🕐 {p.timeIn} → 🕔 {p.timeOut}</div>
//                     {p.timeIn && p.timeOut && calcDuration(p.timeIn, p.timeOut) && (
//                       <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>{calcDuration(p.timeIn, p.timeOut)}</div>
//                     )}
//                   </div>
//                 )}

//                 <div>
//                   <div style={lbl}>Payment ID</div>
//                   <div style={{ ...val, fontSize: "13px", color: "#555", fontWeight: 500 }}>{p.paymentId}</div>
//                 </div>

//                 <div>
//                   <div style={lbl}>Amount Paid</div>
//                   <div style={{ ...val, fontSize: "20px", color: "#2e7d32" }}>₹{p.amountPaid}</div>
//                 </div>

//               </div>

//               {/* Receipt strip */}
//               <div style={{ marginTop: "14px", padding: "10px 14px", background: "#f0fff4", border: "1px solid #a5d6a7", borderRadius: "8px", fontSize: "12px", color: "#2e7d32" }}>
//                 📱 SMS sent to {p.user?.mobile || loggedUser.mobile || "registered mobile"} · Txn: {p.paymentId}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// const pageWrap  = { padding: "60px 20px", maxWidth: "500px", margin: "0 auto" };
// const msgBox    = (bg, border, color) => ({ background: bg, border: `1px solid ${border}`, borderRadius: "16px", padding: "40px 30px", textAlign: "center", color });
// const iconSt    = { fontSize: "48px", marginBottom: "16px" };
// const btnPrimary = { padding: "10px 24px", background: "linear-gradient(135deg,#4facfe,#00c6ff)", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "14px" };
// const btnYellow  = { marginTop: "16px", padding: "10px 28px", background: "#ffc107", color: "#3e2000", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "15px" };
// const card      = { background: "#fff", border: "1px solid #e0eafc", borderRadius: "14px", padding: "20px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", position: "relative" };
// const tokenBadge = { position: "absolute", top: "16px", left: "20px", background: "linear-gradient(135deg,#4facfe,#00c6ff)", color: "white", borderRadius: "20px", padding: "4px 14px", fontSize: "13px", fontWeight: 700, letterSpacing: "1px" };
// const paidBadge  = { position: "absolute", top: "16px", right: "20px", background: "#e8f5e9", color: "#2e7d32", border: "1px solid #a5d6a7", borderRadius: "20px", padding: "4px 12px", fontSize: "12px", fontWeight: 700 };
// const lbl       = { fontSize: "11px", color: "#999", textTransform: "uppercase", marginBottom: "4px" };
// const val       = { fontSize: "15px", fontWeight: 600, color: "#1e3c72" };

// export default Payments;



// src/pages/Payments.jsx
import React, { useEffect, useState } from "react";
import { getUser } from "../services/AuthService";
import { API } from "../config";
import { Link } from "react-router";
import styles from "./Styles/Payments.module.css";

function calcDuration(timeIn, timeOut) {
  try {
    const [h1, m1] = timeIn.split(":").map(Number);
    const [h2, m2] = timeOut.split(":").map(Number);
    const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (mins <= 0) return null;
    const h = Math.floor(mins / 60), m = mins % 60;
    return m === 0 ? `${h} hrs` : `${h}h ${m}m`;
  } catch { return null; }
}

function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const loggedUser = getUser();

  useEffect(() => {
    if (!loggedUser || loggedUser.role !== "customer") { setLoading(false); return; }
    fetch(`${API.payment}/user/${loggedUser.userId}`)
      .then(r => r.json())
      .then(data => { setPayments(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  /* ── Not logged in ── */
  if (!loggedUser) return (
    <div className={styles.page}>
      <div className={styles.msgWrap}>
        <div className={styles.msgBox}>
          <span className={styles.msgIcon}>🔒</span>
          <div className={styles.msgTitle}>Login Required</div>
          <p className={styles.msgDesc}>Please log in to view your payment history.</p>
          <Link to="/login" className={styles.btnMsgPrimary}>Go to Login</Link>
        </div>
      </div>
    </div>
  );

  /* ── Chef account ── */
  if (loggedUser.role === "chef") return (
    <div className={styles.page}>
      <div className={styles.msgWrap}>
        <div className={styles.msgBox}>
          <span className={styles.msgIcon}>👨‍🍳</span>
          <div className={styles.msgTitle}>Chefs don't have a payment section</div>
          <p className={styles.msgDesc}>Head to your chef dashboard to manage bookings.</p>
          <Link to="/chef-orders" className={styles.btnMsgYellow}>My Dashboard</Link>
        </div>
      </div>
    </div>
  );

  const total = payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        {/* ── Header ── */}
        <div className={styles.pageHeader}>
          <h2 className={styles.pageTitle}>My Payments</h2>
          <Link to="/services" className={styles.btnBook}>+ Book a Chef</Link>
        </div>
        <p className={styles.pageGreeting}>
          Hello, <strong>{loggedUser.name}</strong> — your payment receipts.
        </p>

        {/* ── Summary card ── */}
        {payments.length > 0 && (
          <div className={styles.summaryCard}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Total Spent</span>
              <span className={styles.summaryValue}>₹{total.toFixed(0)}</span>
            </div>
            <div className={styles.summaryDivider} />
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Transactions</span>
              <span className={styles.summaryValueBlue}>{payments.length}</span>
            </div>
            <div className={styles.summaryDivider} />
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Avg per Booking</span>
              <span className={styles.summaryValue}>
                ₹{payments.length > 0 ? Math.round(total / payments.length) : 0}
              </span>
            </div>
          </div>
        )}

        {/* ── Loading ── */}
        {loading && <p className={styles.loadingText}>Loading payments…</p>}

        {/* ── Empty state ── */}
        {!loading && payments.length === 0 && (
          <div className={styles.msgBox}>
            <span className={styles.msgIcon}>💳</span>
            <div className={styles.msgTitle}>No payments yet</div>
            <p className={styles.msgDesc}>
              Book a chef and complete payment to see receipts here.
            </p>
            <Link to="/services" className={styles.btnMsgPrimary}>Browse Chefs</Link>
          </div>
        )}

        {/* ── Payment Cards ── */}
        {!loading && payments.length > 0 && (
          <div className={styles.paymentList}>
            {payments.map((p, idx) => {
              const dur = p.timeIn && p.timeOut ? calcDuration(p.timeIn, p.timeOut) : null;
              return (
                <div
                  key={p.id}
                  className={styles.payCard}
                  style={{ animationDelay: `${idx * 0.06}s` }}
                >
                  {/* Badges */}
                  <div className={styles.tokenBadge}>{p.tokenId}</div>
                  <div className={styles.paidBadge}>✅ PAID</div>

                  {/* Body */}
                  <div className={styles.payCardBody}>

                    <div className={styles.payField}>
                      <span className={styles.payFieldLabel}>Chef</span>
                      <span className={styles.payFieldValue}>
                        👨‍🍳 {p.chef?.name || "—"}
                      </span>
                    </div>

                    <div className={styles.payField}>
                      <span className={styles.payFieldLabel}>Date</span>
                      <span className={styles.payFieldValue}>📅 {p.date}</span>
                    </div>

                    {(p.timeIn || p.timeOut) && (
                      <div className={styles.payField}>
                        <span className={styles.payFieldLabel}>Timings</span>
                        <span className={styles.payFieldValue}>
                          🕐 {p.timeIn} → 🕔 {p.timeOut}
                        </span>
                        {dur && <span className={styles.payDuration}>{dur}</span>}
                      </div>
                    )}

                    <div className={styles.payField}>
                      <span className={styles.payFieldLabel}>Payment ID</span>
                      <span className={styles.payFieldValueSmall}>{p.paymentId}</span>
                    </div>

                    <div className={styles.payField}>
                      <span className={styles.payFieldLabel}>Amount Paid</span>
                      <span className={styles.payAmount}>₹{p.amountPaid}</span>
                    </div>

                  </div>

                  {/* SMS confirmation strip */}
                  <div className={styles.smsStrip}>
                    📱 SMS sent to {p.user?.mobile || loggedUser.mobile || "registered mobile"} · Txn: {p.paymentId}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

export default Payments;