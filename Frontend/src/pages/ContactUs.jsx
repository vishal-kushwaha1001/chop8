



// src/pages/Contact.jsx
import React, { useState } from "react";
import styles from "./Styles/Contactus.module.css";
import Footer from "../Components/Footer";

const FAQS = [
  { q:"How do I book a chef?",          a:"Go to Services, browse available chefs, click 'Book Now', pick your date and time, and choose COD or Online payment." },
  { q:"What is emergency booking?",     a:"Same-day booking with check-in within 5 hours. Price is automatically 1.5× the chef's daily rate. An emergency badge is shown on your order." },
  { q:"Can I cancel my booking?",       a:"Yes, any time before the booking starts. Cancellations within 3 hours of check-in with an advance already paid will forfeit the advance amount." },
  { q:"How does online payment work?",  a:"Pay 30% advance at booking to confirm. The remaining 70% is collected after service. Total includes ₹49 platform fee + 3% GST." },
  { q:"What is the AI Leaderboard?",    a:"Our Python ML model (83% accuracy) analyses review text with Logistic Regression to rank chefs beyond star ratings. Words matter more than numbers." },
  { q:"How do ratings affect chefs?",   a:"After your booking expires, a rating popup appears. Your star + comment feeds the ML model. Highly Recommended ≥ 4.5, Recommended ≥ 3.5." },
];

const CONTACT_INFO = [
  { icon:"📍", label:"Address",   value:"JSS Academy of Technical Education, C-20/1, Sector-62, Noida, Uttar Pradesh — 201301" },
  { icon:"📧", label:"Email",     value:"support@chop8.in",      link:"mailto:support@chop8.in" },
  { icon:"📞", label:"Phone",     value:"+6204267787",        link:"tel:+916204267787" },
  { icon:"🕐", label:"Hours",     value:"Mon – Sat · 9 AM to 7 PM IST" },
  { icon:"🐙", label:"GitHub",    value:"github.com/VinayakSingh3002/Chop8", link:"https://github.com/VinayakSingh3002/Chop8" },
];

const TEAM = [
  { name:" vishal kushwaha , Vinayak Singh  & Anant Sagar", role:"Full Stack Developer",      emoji:"👨‍💻", note:"React · Spring Boot · ML Integration" },
  { name:"Chef Support Team",   role:"Operations & Onboarding",   emoji:"👨‍🍳", note:"Chef verification · Booking support" },
  { name:"ML & AI Team",        role:"Data Science",               emoji:"🤖", note:"Logistic Regression · Sentiment analysis" },
];

export default function Contact() {
  const [openFaq, setOpenFaq]   = useState(null);
  const [form,    setForm]       = useState({ name:"", email:"", subject:"", message:"" });
  const [sent,    setSent]       = useState(false);
  const [sending, setSending]   = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name||!form.email||!form.message) return;
    setSending(true);
    setTimeout(()=>{ setSent(true); setSending(false); },1200);
  };

  return (
    <div className={styles.page}>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg}/>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.bdot}/> Get In Touch
          </div>
          <h1 className={styles.heroTitle}>
            We're Here<br/>
            <span className={styles.accent}>To Help</span>
          </h1>
          <p className={styles.heroDesc}>
            Questions about bookings, payments, chef onboarding, or the AI system?
            Reach out and our team will get back to you within 24 hours.
          </p>
        </div>
        <div className={styles.heroEmoji}>📞</div>
      </section>

      {/* ── MAIN GRID ── */}
      <div className={styles.mainGrid}>

        {/* Left: contact info + team */}
        <div className={styles.leftCol}>

          {/* Contact info cards */}
          <div className={styles.infoSection}>
            <div className={styles.sectionLabel}>Contact Details</div>
            <div className={styles.infoCards}>
              {CONTACT_INFO.map((c,i)=>(
                <div key={i} className={styles.infoCard}>
                  <div className={styles.infoCardIcon}>{c.icon}</div>
                  <div>
                    <div className={styles.infoCardLabel}>{c.label}</div>
                    {c.link
                      ? <a href={c.link} className={styles.infoCardLink}>{c.value}</a>
                      : <div className={styles.infoCardValue}>{c.value}</div>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team */}
          <div className={styles.teamSection}>
            <div className={styles.sectionLabel}>Our Team</div>
            <div className={styles.teamCards}>
              {TEAM.map((t,i)=>(
                <div key={i} className={styles.teamCard}>
                  <div className={styles.teamEmoji}>{t.emoji}</div>
                  <div>
                    <div className={styles.teamName}>{t.name}</div>
                    <div className={styles.teamRole}>{t.role}</div>
                    <div className={styles.teamNote}>{t.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map placeholder */}
          <div className={styles.mapCard}>
            <div className={styles.mapLabel}>📍 JSS Academy, Sector-62, Noida</div>
            <div className={styles.mapEmbed}>
              <iframe
                title="JSS Academy Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.0!2d77.3710!3d28.6270!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce5d1d3b3b3b3%3A0x1!2sJSS+Academy+of+Technical+Education%2C+Noida!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="200"
                style={{border:"none",borderRadius:"10px"}}
                allowFullScreen=""
                loading="lazy"
              />
              {/* Fallback if iframe blocked */}
              <noscript>
                <div className={styles.mapFallback}>
                  📍 JSS Academy of Technical Education<br/>C-20/1, Sector-62, Noida — 201301
                </div>
              </noscript>
            </div>
          </div>
        </div>

        {/* Right: contact form + FAQ */}
        <div className={styles.rightCol}>

          {/* Form */}
          <div className={styles.formCard}>
            <div className={styles.sectionLabel}>Send a Message</div>

            {sent ? (
              <div className={styles.sentState}>
                <div className={styles.sentIcon}>✅</div>
                <div className={styles.sentTitle}>Message Sent!</div>
                <div className={styles.sentDesc}>
                  Thanks, <strong>{form.name}</strong>! We'll reply to <strong>{form.email}</strong> within 24 hours.
                </div>
                <button className={styles.sentReset} onClick={()=>{ setSent(false); setForm({name:"",email:"",subject:"",message:""}); }}>
                  Send Another
                </button>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formRow}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Your Name</label>
                    <input
                      className={styles.input}
                      placeholder="Your Name"
                      value={form.name}
                      onChange={e=>setForm({...form,name:e.target.value})}
                      required
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Email Address</label>
                    <input
                      className={styles.input}
                      type="email"
                      placeholder="you@email.com"
                      value={form.email}
                      onChange={e=>setForm({...form,email:e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Subject</label>
                  <select
                    className={styles.input}
                    value={form.subject}
                    onChange={e=>setForm({...form,subject:e.target.value})}
                  >
                    <option value="">Select a topic</option>
                    <option>Booking Issue</option>
                    <option>Payment Problem</option>
                    <option>Chef Onboarding</option>
                    <option>Rating / Review</option>
                    <option>Technical Bug</option>
                    <option>General Inquiry</option>
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Message</label>
                  <textarea
                    className={`${styles.input} ${styles.textarea}`}
                    placeholder="Describe your issue or question..."
                    rows={5}
                    value={form.message}
                    onChange={e=>setForm({...form,message:e.target.value})}
                    required
                  />
                </div>

                <button type="submit" className={styles.submitBtn} disabled={sending}>
                  {sending ? "Sending..." : "Send Message →"}
                </button>

                <p className={styles.formNote}>
                  🔒 Your information is never shared with third parties.
                </p>
              </form>
            )}
          </div>

          {/* FAQ */}
          <div className={styles.faqSection}>
            <div className={styles.sectionLabel}>Frequently Asked</div>
            <div className={styles.faqList}>
              {FAQS.map((faq,i)=>(
                <div
                  key={i}
                  className={`${styles.faqItem} ${openFaq===i?styles.faqOpen:""}`}
                  onClick={()=>setOpenFaq(openFaq===i?null:i)}
                >
                  <div className={styles.faqQuestion}>
                    <span>{faq.q}</span>
                    <span className={styles.faqChevron}>{openFaq===i?"▲":"▼"}</span>
                  </div>
                  {openFaq===i && (
                    <div className={styles.faqAnswer}>{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM STRIP ── */}
      <Footer/>
    </div>
  );
}