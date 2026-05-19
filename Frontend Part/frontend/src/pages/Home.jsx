

// src/pages/Home.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { API } from "../config";
import styles from "./Styles/Home.module.css";
import Footer from "../Components/Footer";

/* ─── Static Data ───────────────────────────────────────── */
const CATEGORIES = [
  { icon: "🍛", label: "Indian Chef"   },
  { icon: "🍝", label: "Italian Chef"  },
  { icon: "🍰", label: "Dessert Chef"  },
  { icon: "🥗", label: "Healthy Chef"  },
  { icon: "🍱", label: "Japanese Chef" },
  { icon: "🌮", label: "Mexican Chef"  },
  { icon: "🥘", label: "Continental"   },
  { icon: "🍜", label: "Chinese Chef"  },
];

const SLIDES = [
  {
    badge:      "Chefs Available Now",
    title:      ["Restaurant", "Quality", "At Home"],
    accentLine: 2,
    desc:       "Book certified professional chefs for home cooking. From intimate dinners to grand celebrations.",
    btn1:       "Explore Chefs",    btn1To: "/services",
    btn2:       "How It Works",     btn2To: "/about",
    emoji:      "🍛",
    showStats:  true,
  },
  {
    badge:      "AI-Powered Rankings",
    title:      ["ML-Ranked", "Chef", "Leaderboard"],
    accentLine: 2,
    desc:       "Our ML model analyses review sentiment to rank chefs beyond just star ratings. 83% accuracy.",
    btn1:       "View Leaderboard", btn1To: "/recommended",
    btn2:       "Learn More",       btn2To: "/about",
    emoji:      "🤖",
  },
  {
    badge:      "Emergency Booking",
    title:      ["Same Day", "Chef", "Booking"],
    accentLine: 2,
    desc:       "Need a chef today? Emergency booking gets you a pro chef within 5 hours. 1.5× rate applies.",
    btn1:       "Book Now",    btn1To: "/services",
    btn2:       "See Pricing", btn2To: "/about",
    emoji:      "⚡",
  },
];

const RANK_CLASSES = ["rk1", "rk2", "rk3", "rko"];

// Fallback leaderboard if API fails
const PLACEHOLDER_CHEFS = [
  { name: "Arjun Sharma",  specialisation: "Indian Chef · Delhi",       avgRating: 4.9, recommendScore: 4.9 },
  { name: "Kavita Reddy",  specialisation: "Dessert Chef · Hyderabad",  avgRating: 4.7, recommendScore: 4.7 },
  { name: "Priya Nair",    specialisation: "Continental · Mumbai",       avgRating: 4.5, recommendScore: 4.5 },
  { name: "Siddharth Roy", specialisation: "Japanese Chef · Bangalore",  avgRating: 4.2, recommendScore: 4.2 },
  { name: "Ananya Gupta",  specialisation: "Italian Chef · Chennai",     avgRating: 4.0, recommendScore: 4.0 },
];
const PLACEHOLDER_REVIEWS = [142, 98, 211, 76, 54];

/* ─── HeroSlide ─────────────────────────────────────────── */
function HeroSlide({ slide, active }) {
  return (
    <div className={`${styles.heroSlide} ${active ? styles.active : ""}`}>
      <div className={styles.heroContent}>
        <div className={styles.heroBadge}>
          <span className={styles.bdot} />
          {slide.badge}
        </div>
        <h1 className={styles.heroTitle}>
          {slide.title.map((line, i) =>
            i === slide.accentLine
              ? <span key={i} className={styles.accent}>{line}<br /></span>
              : <span key={i}>{line}<br /></span>
          )}
        </h1>
        <p className={styles.heroDesc}>{slide.desc}</p>
        <div className={styles.heroBtns}>
          <Link to={slide.btn1To} className={styles.hbtnP}>{slide.btn1}</Link>
          <Link to={slide.btn2To} className={styles.hbtnS}>{slide.btn2}</Link>
        </div>
        {slide.showStats && (
          <div className={styles.heroStats}>
            {[["500+", "Chefs"], ["4.8★", "Avg Rating"], ["10K+", "Bookings"]].map(([n, l]) => (
              <div key={l}>
                <div className={styles.hstatN}>{n}</div>
                <div className={styles.hstatL}>{l}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
// home card component
/* ─── FeaturedChefCard ──────────────────────────────────── */
function FeaturedChefCard({ chef, rating, isBusy, navigate }) {
  const available = chef.available !== false;
  const status = !available ? "off" : isBusy ? "busy" : "available";

  return (
    <div className={styles.chefCard} onClick={() => navigate("/services")}>
      <div className={styles.ccImg}>
        {chef.photo ? (
          <div className= {styles.photoWrap }> <img
            src={chef.photo}
            alt={chef.name}
            style={{ width: "100%", height: "100%", objectFit: "cover"  }}
          /></div>
         
        ) : (
          <span style={{ fontSize: "52px" }}>👨‍🍳</span>
        )}
        <div className={styles.ccBadge}>
          ★ {rating > 0 ? rating.toFixed(1) : "New"}
        </div>
      </div>
      <div className={styles.ccBody}>
        <div className={styles.ccName}>{chef.name}</div>
        <div className={styles.ccSpec}>
          {chef.specialisation || "Professional Chef"}
        </div>
        <div className={styles.ccFoot}>
          {status === "available" && (
            <span>
              <span className={styles.avdot} />
              <span className={styles.ccAvail}>Available</span>
            </span>
          )}
          {status === "busy" && <span className={styles.ccBusy}>● Busy Today</span>}
          {status === "off"  && <span className={styles.ccOff}>● Unavailable</span>}
          <span className={styles.ccPrice}>
            {chef.pricePerDay ? `₹${chef.pricePerDay}/day` : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── FeaturedChefSkeleton ──────────────────────────────── */
function FeaturedChefSkeleton() {
  return (
    <div className={styles.chefCard} style={{ minWidth: "176px", cursor: "default" }}>
      <div className={styles.ccImg} style={{ background: "linear-gradient(90deg, #1e293b 25%, #273449 50%, #1e293b 75%)", backgroundSize: "400px 100%", animation: "shimmer 1.4s infinite linear" }} />
      <div className={styles.ccBody}>
        <div style={{ height: "12px", borderRadius: "6px", background: "#273449", marginBottom: "6px" }} />
        <div style={{ height: "10px", borderRadius: "6px", background: "#1e293b", width: "70%", marginBottom: "10px" }} />
        <div style={{ height: "10px", borderRadius: "6px", background: "#1e293b", width: "50%" }} />
      </div>
    </div>
  );
}
//  leaderbord component
/* ─── LeaderRow ─────────────────────────────────────────── */
function LeaderRow({ chef, index, reviewCount }) {
  const score   = Number(chef.recommendScore || chef.avgRating || 0);
  const stars   = Math.min(5, Math.max(0, Math.round(Number(chef.avgRating) || 0)));
  const rankCls = RANK_CLASSES[index] ?? "rko";
  const isHighly = score >= 4.5;

  return (
    <div className={styles.lbRow}>
      <div className={`${styles.lbRk} ${styles[rankCls]}`}>{index + 1}</div>
      <div className={styles.lbAv}>🧑‍🍳</div>
      <div className={styles.lbInf}>
        <div className={styles.lbNm}>{chef.name}</div>
        {chef.specialisation && <div className={styles.lbSp}>{chef.specialisation}</div>}
        <span className={`${styles.lbPill} ${isHighly ? styles.pillGreen : styles.pillYellow}`}>
          {isHighly ? "Highly Recommended" : "Recommended"}
        </span>
      </div>
      <div className={styles.lbRt}>
        <div className={styles.lbSc}>{score.toFixed(1)}</div>
        <div className={styles.lbStars}>
          {"★".repeat(stars)}
          <span className={styles.lbStarsEmpty}>{"★".repeat(5 - stars)}</span>
        </div>
        {reviewCount != null && <div className={styles.lbRev}>{reviewCount} reviews</div>}
      </div>
    </div>
  );
}

/* ─── Home ──────────────────────────────────────────────── */
function Home() {
  const navigate = useNavigate();

  // Slider state
  const [slide,    setSlide]    = useState(0);
  const [emojiKey, setEmojiKey] = useState(0);

  // Featured chefs — fetched from API
  const [featuredChefs,        setFeaturedChefs]        = useState([]);
  const [featuredRatings,      setFeaturedRatings]      = useState({});
  const [featuredBusy,         setFeaturedBusy]         = useState({});
  const [featuredLoading,      setFeaturedLoading]      = useState(true);

  // AI Leaderboard
  const [chefs, setChefs] = useState([]);

  const today = new Date().toISOString().split("T")[0];

  /* ── Fetch Featured Chefs from DB ── */
  useEffect(() => {
    fetch(API.chefs)
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        // Show up to 6 chefs; prefer available ones first
        const sorted = [...data].sort((a, b) => {
          if (a.available === b.available) return 0;
          return a.available ? -1 : 1;
        });
        const featured = sorted.slice(0, 6);
        setFeaturedChefs(featured);

        // Fetch ratings and busy status for each
        featured.forEach(chef => {
          // Ratings
          fetch(`${API.ratings}/ratee/${chef.id}`)
            .then(r => r.json())
            .then(rd => setFeaturedRatings(prev => ({
              ...prev,
              [chef.id]: rd.average || 0,
            })))
            .catch(() => {});

          // Busy today
          fetch(`${API.bookings}/chef/${chef.id}/busy?date=${today}`)
            .then(r => r.json())
            .then(bd => setFeaturedBusy(prev => ({
              ...prev,
              [chef.id]: bd.busy === true,
            })))
            .catch(() => {});
        });
      })
      .catch(() => {})
      .finally(() => setFeaturedLoading(false));
  }, [today]);

  /* ── Fetch ML Leaderboard ── */
  useEffect(() => {
    fetch(API.recommend)
      .then(r => r.json())
      .then(data => setChefs(Array.isArray(data?.ranked) ? data.ranked.slice(0, 5) : []))
      .catch(() => {});
  }, []);

  /* ── Auto-slide every 4.2s ── */
  useEffect(() => {
    const t = setInterval(() => {
      setSlide(prev => (prev + 1) % SLIDES.length);
      setEmojiKey(k => k + 1);
    }, 4200);
    return () => clearInterval(t);
  }, []);

  const goSlide = useCallback((n) => {
    setSlide(n);
    setEmojiKey(k => k + 1);
  }, []);

  const leaderData = chefs.length > 0 ? chefs : PLACEHOLDER_CHEFS;

  return (
    <div className={styles.page}>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroBgImg}>
          <img
            src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1400&auto=format&fit=crop&q=80"
            alt="Professional kitchen"
          />
        </div>
        <div className={styles.heroOverlay} />

        {SLIDES.map((sl, i) => (
          <HeroSlide key={i} slide={sl} active={i === slide} />
        ))}

        <div key={emojiKey} className={styles.heroFood}>
          {SLIDES[slide].emoji}
        </div>

        <div className={styles.heroDots}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === slide ? styles.dotActive : ""}`}
              onClick={() => goSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ── ANNOUNCEMENT ── */}
      

      {/* ── FEATURED CHEFS (live from DB) ── */}
      <section className={styles.sec}>
        <div className={styles.secHead}>
          <div className={styles.secTitle}>👨‍🍳 Featured Chefs</div>
          <Link to="/services" className={styles.secAll}>See All →</Link>
        </div>

        <div className={styles.chefRow}>
          {featuredLoading
            ? [1, 2, 3, 4, 5, 6].map(i => <FeaturedChefSkeleton key={i} />)
            : featuredChefs.length === 0
            ? (
              <p style={{ color: "#64748b", fontSize: "14px", padding: "20px 0" }}>
                No chefs available right now.
              </p>
            )
            : featuredChefs.map((chef) => (
              <FeaturedChefCard
                key={chef.id}
                chef={chef}
                rating={featuredRatings[chef.id] || 0}
                isBusy={featuredBusy[chef.id] === true}
                navigate={navigate}
              />
            ))
          }
        </div>
      </section>

      {/* ── AI LEADERBOARD ── */}
      <div className={styles.lbWrap}>
        <div className={styles.lbTop}>
          <div>
            <div className={styles.lbHeading}>🏆 Chef Leaderboard</div>
            <div className={styles.lbSub}>
              Ranked by ML Sentiment Analysis + Star Ratings · 83% model accuracy
            </div>
          </div>
          <Link to="/recommended" className={styles.secAll}>View Full →</Link>
        </div>

        {leaderData.map((chef, i) => (
          <LeaderRow
            key={chef.id ?? i}
            chef={chef}
            index={i}
            reviewCount={chefs.length === 0 ? PLACEHOLDER_REVIEWS[i] : undefined}
          />
        ))}
      </div>

      {/* ── BROWSE BY SPECIALISATION ── */}
      <section className={styles.sec}>
        <div className={styles.secHead}>
          <div className={styles.secTitle}>🎯 Browse by Specialisation</div>
        </div>
        <div className={styles.catGrid}>
          {CATEGORIES.map((cat, i) => (
            <Link
              key={i}
              to={`/services?specialisation=${encodeURIComponent(cat.label)}`}
              className={styles.catCard}
            >
              <span className={styles.catIcon}>{cat.icon}</span>
              <div className={styles.catLabel}>{cat.label}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── INFO CARDS ── */}
      <div className={styles.infoRow}>
        {[
          {
            icon: "⚡", h: "Emergency Booking",
            p:   "Book a certified chef within 5 hours. Same-day service available 24/7.",
            acc: "1.5× rate applies",
          },
          {
            icon: "💳", h: "Flexible Payment",
            p:   "Pay by Cash or Online. 30% advance + 70% after service completion.",
            acc: "₹49 fee + 3% GST",
          },
          {
            icon: "🛡️", h: "Safe Cancellation",
            p:   "Cancel anytime. Penalty only if cancelled within 3 hrs of check-in with advance paid.",
            acc: "3hr Before Cancellation with Zero penalty",
          },
        ].map((card, i) => (
          <div key={i} className={styles.infoCard}>
            <div className={styles.infoIcon}>{card.icon}</div>
            <h4 className={styles.infoH}>{card.h}</h4>
            <p className={styles.infoP}>{card.p}</p>
            <div className={styles.infoAcc}>{card.acc}</div>
          </div>
        ))}
      </div>

      {/* ── CHEF PARTNER PROMO ── */}
      <div className={styles.promo}>
        <div>
          <h2 className={styles.promoH2}>
            Become a <span>Chef Partner</span>
          </h2>
          <p className={styles.promoP}>
            Start earning by sharing your culinary skills. Set your own price,
            manage your schedule, and build your reputation.
          </p>
          <div className={styles.promoFeats}>
            {["Set your own price", "Verified ratings", "Instant payouts"].map(f => (
              <div key={f} className={styles.pf}>
                <span className={styles.ck}>✓</span> {f}
              </div>
            ))}
          </div>
          <Link to="/signup" className={styles.promoBtn}>
            Register as Chef →
          </Link>
        </div>
        <div className={styles.promoEmoji}>👨‍🍳</div>
      </div>

      {/* ── FOOTER ── */}
      <div className={styles.divider} />
      <Footer/>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
      `}</style>
    </div>
  );
}

export default Home;