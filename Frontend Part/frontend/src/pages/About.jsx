// src/pages/About.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import styles from "./Styles/About.module.css";
import Footer from "../Components/Footer";

/* ── Data ─────────────────────────────────────────────────── */
const STACK = [
  { icon: "⚛️",  label: "React.js 18",        desc: "Component-based UI with Vite + CSS Modules",    color: "#61dafb" },
  { icon: "☕",  label: "Spring Boot 4",       desc: "REST API backend with Java 20 + Hibernate JPA", color: "#6db33f" },
  { icon: "🐬",  label: "MySQL 8.0",           desc: "Relational database — 4 tables, Hibernate ORM", color: "#00618a" },
  { icon: "🐍",  label: "Python + Flask",      desc: "ML microservice on port 5000 — scikit-learn",   color: "#ffd43b" },
  { icon: "🔐",  label: "Spring Security",     desc: "BCrypt hashing — 2¹⁰ rounds, salted",           color: "#f05032" },
  { icon: "🤖",  label: "scikit-learn",        desc: "Logistic Regression — 83% sentiment accuracy",  color: "#f89939" },
];

const HOW_IT_WORKS = [
  { step: "01", icon: "🔍", title: "Browse Chefs",    desc: "Filter by specialisation — Indian, Italian, Japanese and more. See live availability, ratings, and pricing." },
  { step: "02", icon: "📅", title: "Book Instantly",  desc: "Pick your date, check-in/out time, and payment mode. Emergency same-day booking available at 1.5× rate." },
  { step: "03", icon: "💳", title: "Pay Flexibly",    desc: "COD confirmed instantly. Online: 30% advance now, 70% after service. Rs 49 platform fee + 3% GST." },
  { step: "04", icon: "⭐", title: "Rate & Improve",  desc: "Rate your chef after service. AI analyses your review text to rank chefs — words matter more than stars alone." },
];

const STATS = [
  { n: "500+",  l: "Chefs"        },
  { n: "10K+",  l: "Bookings"     },
  { n: "83%",   l: "ML Accuracy"  },
  { n: "4.8★",  l: "Avg Rating"   },
];

const PRICING = [
  { label: "Platform Fee",      value: "₹49",             note: "per booking" },
  { label: "GST",               value: "3%",              note: "on total" },
  { label: "Advance (Online)",  value: "30%",             note: "at booking" },
  { label: "Final (Online)",    value: "70%",             note: "after service" },
  { label: "Emergency Rate",    value: "1.5×",            note: "same-day ≤5 hrs" },
  { label: "Cancellation",      value: "Zero",            note: "penalty for COD" },
];

const POLICIES = [
  { icon: "⚡", title: "Emergency Booking", body: "Same-day bookings with check-in within 5 hours qualify as emergency. Price is automatically 1.5× the chef's daily rate. Emergency badge shown on all order cards." },
  { icon: "💳", title: "Payment",           body: "COD bookings are confirmed immediately — no money upfront. Online bookings require 30% advance via our secure gateway. Final 70% is collected after service." },
  { icon: "🛡️", title: "Cancellation",     body: "Cancel any time before service. A penalty equal to the advance amount applies only if: you cancel within 3 hours of check-in AND you already paid the advance." },
  { icon: "⭐", title: "Ratings",           body: "After your booking expires, a rating popup appears automatically. Rate 1–5 stars with an optional comment. Our ML model reads your words to help rank chefs fairly." },
];

const ML_FORMULA = [
  { label: "Avg Star Rating",     weight: "50%", color: "#26a0da", width: "50%" },
  { label: "Review Count (log)",  weight: "20%", color: "#4ade80", width: "20%" },
  { label: "ML Sentiment Score",  weight: "30%", color: "#fbbf24", width: "30%" },
];

/* ── useInView hook ────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ── Section wrapper ───────────────────────────────────────── */
function Reveal({ children, delay = 0 }) {
  const [ref, visible] = useInView();
  return (
    <div
      ref={ref}
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ── About ─────────────────────────────────────────────────── */
export default function About() {
  return (
    <div className={styles.page}>

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroContent}>
          <Reveal>
            <div className={styles.heroBadge}>
              <span className={styles.bdot} /> About CHOP8
            </div>
            <h1 className={styles.heroTitle}>
              Restaurant Quality<br />
              <span className={styles.accent}>Delivered Home</span>
            </h1>
            <p className={styles.heroDesc}>
              CHOP8 is a full-stack AI-powered chef booking marketplace. Customers find verified
              professional chefs, book them online, pay flexibly, and get ML-ranked recommendations
              based on real review sentiment — not just star counts.
            </p>
            <div className={styles.heroBtns}>
              <Link to="/services" className={styles.btnP}>Browse Chefs</Link>
              <Link to="/recommended" className={styles.btnS}>View Leaderboard</Link>
            </div>
          </Reveal>
        </div>
        <div className={styles.heroStats}>
          {STATS.map(({ n, l }) => (
            <div key={l} className={styles.heroStat}>
              <div className={styles.heroStatN}>{n}</div>
              <div className={styles.heroStatL}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════ */}
      <section className={styles.sec}>
        <Reveal>
          <div className={styles.secLabel}>How It Works</div>
          <h2 className={styles.secTitle}>From Browse to Bite in 4 Steps</h2>
        </Reveal>

        <div className={styles.stepsGrid}>
          {HOW_IT_WORKS.map((s, i) => (
            <Reveal key={s.step} delay={i * 80}>
              <div className={styles.stepCard}>
                <div className={styles.stepNum}>{s.step}</div>
                <div className={styles.stepIcon}>{s.icon}</div>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══ TECH STACK ════════════════════════════════════════ */}
      <section className={styles.secDark}>
        <Reveal>
          <div className={styles.secLabel}>Architecture</div>
          <h2 className={styles.secTitle}>Built on a 4-Layer Stack</h2>
          <p className={styles.secSub}>
            React frontend → Spring Boot REST API → MySQL database → Python ML microservice.
            Each layer communicates via HTTP JSON, with BCrypt security and Hibernate ORM.
          </p>
        </Reveal>

        <div className={styles.stackGrid}>
          {STACK.map((s, i) => (
            <Reveal key={s.label} delay={i * 60}>
              <div className={styles.stackCard} style={{ "--accent": s.color }}>
                <div className={styles.stackIcon}>{s.icon}</div>
                <div className={styles.stackLabel}>{s.label}</div>
                <div className={styles.stackDesc}>{s.desc}</div>
                <div className={styles.stackAccentBar} />
              </div>
            </Reveal>
          ))}
        </div>

        {/* Architecture flow */}
        <Reveal delay={200}>
          <div className={styles.archFlow}>
            {[
              { icon: "⚛️",  label: "React",       sub: "Port 5173" },
              { icon: "↔",   label: "REST API",    sub: "JSON/HTTP",  arrow: true },
              { icon: "☕",  label: "Spring Boot",  sub: "Port 8080" },
              { icon: "↔",   label: "JPA/SQL",     sub: "Hibernate",  arrow: true },
              { icon: "🐬",  label: "MySQL",        sub: "Port 3306" },
              { icon: "↔",   label: "HTTP POST",   sub: "/recommend", arrow: true },
              { icon: "🐍",  label: "Python ML",    sub: "Port 5000" },
            ].map((n, i) => (
              n.arrow
                ? <div key={i} className={styles.archArrow}>{n.icon}<div className={styles.archArrowSub}>{n.sub}</div></div>
                : <div key={i} className={styles.archNode}>
                    <div className={styles.archNodeIcon}>{n.icon}</div>
                    <div className={styles.archNodeLabel}>{n.label}</div>
                    <div className={styles.archNodeSub}>{n.sub}</div>
                  </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ══ ML SECTION ════════════════════════════════════════ */}
      <section className={styles.sec}>
        <Reveal>
          <div className={styles.secLabel}>AI Recommendation</div>
          <h2 className={styles.secTitle}>The ML Engine Behind the Leaderboard</h2>
          <p className={styles.secSub}>
            A Logistic Regression model trained on 1,000 restaurant reviews with 83% accuracy.
            Every review comment is cleaned, vectorized into 1,507 word-count features,
            and scored for positive/negative sentiment.
          </p>
        </Reveal>

        <div className={styles.mlRow}>
          <Reveal>
            <div className={styles.mlFormula}>
              <div className={styles.mlFormulaTitle}>Recommendation Score Formula</div>
              <div className={styles.mlFormulaEq}>
                Score = <span style={{ color: "#26a0da" }}>avgRating × 0.50</span>
                {" "}+{" "}<span style={{ color: "#4ade80" }}>log(reviews+1) × 0.20</span>
                {" "}+{" "}<span style={{ color: "#fbbf24" }}>sentimentScore × 0.30 × 5</span>
              </div>
              <div className={styles.mlBars}>
                {ML_FORMULA.map(m => (
                  <div key={m.label} className={styles.mlBarRow}>
                    <div className={styles.mlBarLabel}>{m.label}</div>
                    <div className={styles.mlBarTrack}>
                      <div className={styles.mlBarFill} style={{ width: m.width, background: m.color }} />
                    </div>
                    <div className={styles.mlBarWeight} style={{ color: m.color }}>{m.weight}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className={styles.mlSteps}>
              <div className={styles.mlStepsTitle}>Text Preprocessing Pipeline</div>
              {[
                { n: "1", t: "Strip HTML tags",          ex: "<b>good</b> → good" },
                { n: "2", t: "Expand contractions",       ex: "can't → can not" },
                { n: "3", t: "Mask phone numbers",        ex: "9876543210 → mobno" },
                { n: "4", t: "Remove non-alpha chars",    ex: "great! → great" },
                { n: "5", t: "Lowercase everything",      ex: "GOOD → good" },
              ].map(s => (
                <div key={s.n} className={styles.mlStep}>
                  <div className={styles.mlStepN}>{s.n}</div>
                  <div>
                    <div className={styles.mlStepT}>{s.t}</div>
                    <div className={styles.mlStepEx}>{s.ex}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Score labels */}
        <Reveal delay={150}>
          <div className={styles.scoreLabels}>
            {[
              { range: "4.5 – 5.0", label: "Highly Recommended", cls: styles.pillGreen },
              { range: "3.5 – 4.4", label: "Recommended",        cls: styles.pillBlue  },
              { range: "2.5 – 3.4", label: "Good",               cls: styles.pillYellow },
              { range: "1.0 – 2.4", label: "Average",            cls: styles.pillRed   },
            ].map(s => (
              <div key={s.label} className={`${styles.scorePill} ${s.cls}`}>
                <span className={styles.scoreRange}>{s.range}</span>
                <span className={styles.scoreLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ══ PRICING ═══════════════════════════════════════════ */}
      <section className={styles.secDark}>
        <Reveal>
          <div className={styles.secLabel}>Pricing & Policies</div>
          <h2 className={styles.secTitle}>Transparent. No Surprises.</h2>
        </Reveal>

        <div className={styles.pricingRow}>
          <Reveal>
            <div className={styles.pricingGrid}>
              {PRICING.map(p => (
                <div key={p.label} className={styles.pricingCard}>
                  <div className={styles.pricingValue}>{p.value}</div>
                  <div className={styles.pricingLabel}>{p.label}</div>
                  <div className={styles.pricingNote}>{p.note}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <div className={styles.policiesGrid}>
          {POLICIES.map((p, i) => (
            <Reveal key={p.title} delay={i * 70}>
              <div className={styles.policyCard}>
                <div className={styles.policyIcon}>{p.icon}</div>
                <h4 className={styles.policyTitle}>{p.title}</h4>
                <p className={styles.policyBody}>{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══ BOOKING STATUS FLOW ════════════════════════════════ */}
      <section className={styles.sec}>
        <Reveal>
          <div className={styles.secLabel}>Booking Lifecycle</div>
          <h2 className={styles.secTitle}>Status Flow</h2>
        </Reveal>
        <Reveal delay={80}>
          <div className={styles.statusFlow}>
            {[
              { s: "PENDING",    c: styles.sPending,   desc: "ONLINE booking — advance not yet paid" },
              { arrow: "→" },
              { s: "CONFIRMED",  c: styles.sConfirmed, desc: "Active booking — COD instant or after advance paid" },
              { arrow: "→" },
              { s: "EXPIRED",    c: styles.sExpired,   desc: "Service delivered — final payment complete" },
            ].map((n, i) =>
              n.arrow
                ? <div key={i} className={styles.statusArrow}>{n.arrow}</div>
                : <div key={i} className={styles.statusNode}>
                    <div className={`${styles.statusBadge} ${n.c}`}>{n.s}</div>
                    <div className={styles.statusDesc}>{n.desc}</div>
                  </div>
            )}
            <div className={styles.cancelBranch}>
              <div className={styles.cancelArrow}>↓ (anytime)</div>
              <div className={`${styles.statusBadge} ${styles.sCancelled}`}>CANCELLED</div>
              <div className={styles.statusDesc}>Customer cancelled — penalty only within 3hrs + advance paid</div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ══ ABOUT THE BUILDER ═════════════════════════════════ */}
      <section className={styles.secDark}>
        <Reveal>
          <div className={styles.builderCard}>
            <div className={styles.builderEmoji}>👨‍💻</div>
            <div className={styles.builderInfo}>
              <div className={styles.builderName}>Vinayak Prasad Singh </div>
              <div className={styles.builderName}>Vishal Kumar Kushwaha </div>
              <div className={styles.builderName}>Anant Sagar</div>
              <div className={styles.builderInst}>JSS Academy of Technical Education, Noida · 2026</div>
              <p className={styles.builderDesc}>
                Built CHOP8 as a full-stack capstone project demonstrating React.js, Spring Boot,
                MySQL, and Python ML integration. The platform features real-time availability tracking,
                AI-powered chef ranking, online payments, and a role-based user system.
              </p>
              <div className={styles.builderLinks}>
                <a
                  href="https://github.com/VinayakSingh3002/Chop8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.builderGithub}
                >
                  🐙 GitHub — VinayakSingh3002/Chop8
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ══ CTA ═══════════════════════════════════════════════ */}
      <section className={styles.cta}>
        <Reveal>
          <h2 className={styles.ctaTitle}>Ready to Book a Chef?</h2>
          <p className={styles.ctaDesc}>Browse certified professionals and book in under 2 minutes.</p>
          <div className={styles.ctaBtns}>
            <Link to="/services"     className={styles.btnP}>Explore Chefs →</Link>
            <Link to="/recommended"  className={styles.btnS}>AI Leaderboard</Link>
          </div>
        </Reveal>
      </section>
      <Footer/>

    </div>
  );
}