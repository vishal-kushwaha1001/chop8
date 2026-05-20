


// src/pages/RecommendedChefs.jsx
import React, { useEffect, useState, useCallback } from "react";
import styles from "./Styles/RecommendedChefs.module.css";
import { API } from "../config";
import BookingForm from "../Components/BookingForm.jsx";
import { getUser } from "../services/AuthService";

/* ─── Rank badge config ─────────────────────────────────── */
const RANK_CLS   = ["rankGold", "rankSilver", "rankBronze"];
const RANK_EMOJI = ["🥇", "🥈", "🥉"];

/* ─── Recommendation label → pill class ────────────────── */
const PILL_CLS = {
  "Highly Recommended": "pillHighly",
  "Recommended":        "pillRec",
  "Good":               "pillGood",
  "Average":            "pillAvg",
  "Unrated":            "pillUnrated",
  "—":                  "pillUnrated",
};

/* ─── Stars ─────────────────────────────────────────────── */
function Stars({ avg, count }) {
  const n = Math.min(5, Math.max(0, Math.round(Number(avg) || 0)));
  return (
    <div className={styles.starsWrap}>
      <span className={styles.starsOn}>{"★".repeat(n)}</span>
      <span className={styles.starsOff}>{"★".repeat(5 - n)}</span>
      <span className={styles.ratingText}>
        {Number(avg || 0).toFixed(1)} ({count || 0} review{count !== 1 ? "s" : ""})
      </span>
    </div>
  );
}

/* ─── Score Bar ─────────────────────────────────────────── */
function ScoreBar({ score }) {
  const val  = Number(score) || 0;
  const pct  = Math.min(100, (val / 5) * 100);
  const fill = pct >= 80 ? "fillHigh" : pct >= 60 ? "fillMid" : pct >= 40 ? "fillLow" : "fillRed";
  const col  = pct >= 80 ? "#4ade80"  : pct >= 60 ? "#26a0da" : pct >= 40 ? "#fbbf24" : "#f87171";

  return (
    <div className={styles.scoreBarWrap}>
      <div className={styles.scoreBarLabel}>
        <span>ML Score</span>
        <span className={styles.scoreBarValue} style={{ color: col }}>
          {val.toFixed(2)} / 5.00
        </span>
      </div>
      <div className={styles.scoreBarTrack}>
        <div
          className={`${styles.scoreBarFill} ${styles[fill]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ─── Sentiment Chips ───────────────────────────────────── */
function Sentiment({ bd }) {
  if (!bd) return null;
  const { positive: p = 0, negative: n = 0, neutral: u = 0 } = bd;

  if (p + n + u === 0) return (
    <div className={styles.sentimentRow}>
      <span className={styles.sentNone}>No review comments yet</span>
    </div>
  );

  return (
    <div className={styles.sentimentRow}>
      {p > 0 && <span className={`${styles.sentChip} ${styles.sentPos}`}>😊 {p} positive</span>}
      {u > 0 && <span className={`${styles.sentChip} ${styles.sentNeut}`}>😐 {u} neutral</span>}
      {n > 0 && <span className={`${styles.sentChip} ${styles.sentNeg}`}>😞 {n} negative</span>}
    </div>
  );
}

/* ─── Skeleton ──────────────────────────────────────────── */
function SkeletonList() {
  return (
    <div className={styles.skeletonList}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={styles.skeleton} style={{ height: i === 0 ? 120 : 100 }} />
      ))}
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────── */
export default function RecommendedChefs() {
  const [chefs,        setChefs]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [fallback,     setFallback]     = useState(false);
  const [rawDebug,     setRawDebug]     = useState(null);
  const [selectedChef, setSelectedChef] = useState(null);
  const [busyMap,      setBusyMap]      = useState({});
  const [myBookings,   setMyBookings]   = useState([]);

  const loggedUser = getUser();
  const isCustomer = loggedUser?.role === "customer";
  const today      = new Date().toISOString().split("T")[0];

  /* ── Fetch leaderboard ── */
  const loadLeaderboard = useCallback(() => {
    setLoading(true);
    setError("");

    fetch(API.recommend)
      .then(r => {
        if (!r.ok) throw new Error("HTTP " + r.status + " from backend");
        return r.json();
      })
      .then(data => {
        console.log("[RecommendedChefs] raw:", data);
        setRawDebug(data);

        let list = [];
        if (Array.isArray(data))              list = data;
        else if (Array.isArray(data?.ranked)) list = data.ranked;
        else if (data?.error)                 throw new Error(data.error);

        setChefs(list);
        setFallback(!!data?.fallback);
        setLoading(false);

        list.forEach(chef => {
          fetch(`${API.bookings}/chef/${chef.id}/busy?date=${today}`)
            .then(r => r.json())
            .then(d => setBusyMap(prev => ({ ...prev, [chef.id]: d.busy === true })))
            .catch(() => {});
        });
      })
      .catch(err => {
        console.error("[RecommendedChefs] error:", err);
        setError(err.message || "Could not load chefs. Is Spring Boot running on port 8080?");
        setLoading(false);
      });
  }, [today]);

  useEffect(() => {
    loadLeaderboard();
    if (isCustomer && loggedUser?.userId) {
      fetch(`${API.bookings}/user/${loggedUser.userId}`)
        .then(r => r.json())
        .then(d => setMyBookings(Array.isArray(d) ? d : []))
        .catch(() => {});
    }
  }, [loadLeaderboard, isCustomer, loggedUser?.userId]);

  function getMyActiveBooking(chefId) {
    return myBookings.find(b =>
      b.chefId === chefId &&
      b.status === "CONFIRMED" &&
      b.date &&
      new Date() < new Date(`${b.date}T${b.timeOut || "23:59"}:00`)
    ) || null;
  }

  /* ── Loading ── */
  if (loading) return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>AI <span>Leaderboard</span></h1>
          <p className={styles.pageSubtitle}>Loading chef rankings…</p>
        </div>
      </div>
      <SkeletonList />
    </div>
  );

  /* ── Error ── */
  if (error) return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>AI <span>Leaderboard</span></h1>
          <p className={styles.pageSubtitle}>Could not load rankings</p>
        </div>
      </div>
      <div className={styles.errorBox}>
        <span className={styles.errorIcon}>⚠️</span>
        <p className={styles.errorText}>{error}</p>
        <button className={styles.errorRetry} onClick={loadLeaderboard}>Retry</button>
      </div>
    </div>
  );

  /* ── Main ── */
  return (
    <div className={styles.page}>

      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>🏆 <span>Chef Leaderboard</span></h1>
          <p className={styles.pageSubtitle}>
            Ranked by ML Sentiment Analysis + Star Ratings · 83% model accuracy
          </p>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.mlBadge}>
            <span className={styles.mlDot} />
            ML Active
          </span>
          <button className={styles.retryBtn} onClick={loadLeaderboard}>↺ Refresh</button>
        </div>
      </div>

      {/* ── Fallback Warning ── */}
      {fallback && (
        <div className={styles.fallbackBanner}>
          <span className={styles.fallbackIcon}>⚠️</span>
          <div className={styles.fallbackText}>
            <strong>Python ML engine is offline.</strong> Showing star-rating fallback only.
            <br />
            Start Python: <code>cd recommend_service &amp;&amp; python app.py</code>
          </div>
        </div>
      )}

      {/* ── Empty State ── */}
      {chefs.length === 0 ? (
        <div className={styles.emptyWrap}>
          <span className={styles.emptyIcon}>👨‍🍳</span>
          <p className={styles.emptyTitle}>No chefs found</p>
          <p className={styles.emptyDesc}>
            Register some chefs first — they'll appear here once they have bookings.
          </p>
          <a
            href="http://localhost:8080/api/recommend/debug"
            target="_blank"
            rel="noreferrer"
            className={styles.debugLink}
          >
            🔍 Open debug endpoint
          </a>
          {rawDebug && (
            <details className={styles.debugDetails}>
              <summary>Raw API response (developer debug)</summary>
              <pre className={styles.debugPre}>{JSON.stringify(rawDebug, null, 2)}</pre>
            </details>
          )}
        </div>
      ) : (
        <>
          {/* Column headers */}
          <div className={styles.colHeaders}>
            <span>Rank</span>
            <span>Chef</span>
            <span className={styles.colRight}>Score</span>
          </div>

          {/* Chef rows */}
          <div className={styles.list}>
            {chefs.map((chef, i) => {
              const rankCls   = RANK_CLS[i]   ?? "rankOther";
              const rankEmoji = RANK_EMOJI[i]  ?? null;
              const pillCls   = PILL_CLS[chef.recommendLabel] ?? "pillUnrated";
              const isBusy    = busyMap[chef.id] === true;
              const myBooking = getMyActiveBooking(chef.id);
              const isOpen    = selectedChef?.id === chef.id;
              const score     = Number(chef.recommendScore || 0);

              return (
                <div key={chef.id ?? i}>

                  {/* ── Chef Row ── */}
                  <div
                    className={`${styles.row} ${isOpen ? styles.rowOpen : ""}`}
                    onClick={() => isCustomer && setSelectedChef(isOpen ? null : chef)}
                  >
                    {/* Rank badge */}
                    <div className={`${styles.rankBadge} ${styles[rankCls]}`}>
                      {rankEmoji
                        ? <span className={styles.rankEmoji}>{rankEmoji}</span>
                        : `#${i + 1}`
                      }
                    </div>

                    {/* Info */}
                    <div className={styles.info}>
                      <div className={styles.nameRow}>
                        <span className={styles.chefName}>🧑‍🍳 {chef.name || "—"}</span>

                        {chef.recommendLabel && chef.recommendLabel !== "—" && (
                          <span className={`${styles.pill} ${styles[pillCls]}`}>
                            {chef.recommendLabel}
                          </span>
                        )}

                        {chef.specialisation && (
                          <span className={styles.specPill}>{chef.specialisation}</span>
                        )}
                      </div>

                      <div className={styles.metaRow}>
                        {Number(chef.pricePerDay) > 0 && (
                          <span className={styles.price}>
                            💰 ₹{chef.pricePerDay}
                            <span className={styles.priceUnit}>/day</span>
                          </span>
                        )}
                        <Stars avg={chef.avgRating} count={chef.ratingCount} />
                      </div>

                      <ScoreBar score={chef.recommendScore} />
                      <Sentiment bd={chef.sentimentBreakdown} />

                      {isCustomer && !isOpen && (
                        <p className={styles.clickHint}>
                          {isBusy ? "Busy today — click to view" : "Click to book this chef →"}
                        </p>
                      )}
                    </div>

                    {/* Score number */}
                    <div className={styles.scoreCol}>
                      <div className={styles.scoreNum}>{score.toFixed(1)}</div>
                      <div className={styles.scoreMax}>/ 5.0</div>
                    </div>
                  </div>

                  {/* ── Booking Panel ── */}
                  {isOpen && isCustomer && (
                    <div className={styles.bookingPanel}>
                      {isBusy ? (
                        <div className={styles.busyMsg}>
                          🔴 <strong>{chef.name}</strong> is busy today. Try booking for another date!
                          <br />
                          <button className={styles.closeBtn} onClick={() => setSelectedChef(null)}>
                            Close
                          </button>
                        </div>
                      ) : myBooking ? (
                        <div className={styles.alreadyMsg}>
                          ✅ You already have an active booking with <strong>{chef.name}</strong>.
                          <br />
                          <button className={styles.closeBtn} onClick={() => setSelectedChef(null)}>
                            Close
                          </button>
                        </div>
                      ) : (
                        <BookingForm
                          chef={chef}
                          onClose={() => setSelectedChef(null)}
                          onBooked={() => {
                            setSelectedChef(null);
                            loadLeaderboard();
                            if (loggedUser?.userId) {
                              fetch(`${API.bookings}/user/${loggedUser.userId}`)
                                .then(r => r.json())
                                .then(d => setMyBookings(Array.isArray(d) ? d : []))
                                .catch(() => {});
                            }
                          }}
                        />
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}