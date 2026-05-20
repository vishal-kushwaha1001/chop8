// src/Components/RatingModal.jsx
import React, { useState } from "react";
import { API } from "../config";

const injectFonts = `@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');`;

const T = {
  bg:      "#0f172a",
  surface: "#1e293b",
  border:  "#334155",
  accent:  "#26a0da",
  green:   "#4ade80",
  yellow:  "#fbbf24",
  red:     "#f87171",
  text:    "#f8fafc",
  muted:   "#94a3b8",
  dim:     "#64748b",
  font:    "'DM Sans', sans-serif",
  display: "'Bebas Neue', sans-serif",
};

const LABELS = ["","😞 Poor","😐 Fair","🙂 Good","😊 Very Good","🤩 Excellent!"];

function RatingModal({
  booking,
  raterId, raterName, raterRole,
  rateeId, rateeName, rateeRole,
  onClose, onSubmitted,
}) {
  const [stars,       setStars]       = useState(0);
  const [hover,       setHover]       = useState(0);
  const [comment,     setComment]     = useState("");
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);

  if (!rateeId || !booking?.id) return null;

  const isChefRating = rateeRole === "chef";
  const activeStars  = hover || stars;

  const handleSubmit = async () => {
    if (stars===0) { setError("Please tap a star to give your rating."); return; }
    if (!rateeId)  { setError("Something went wrong. Please refresh."); return; }
    if (saving) return;
    setSaving(true); setError("");
    try {
      const res  = await fetch(API.ratings,{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ bookingId:booking.id, raterId, raterName, raterRole, rateeId, rateeRole, stars, comment:comment.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error?.toLowerCase().includes("already rated")) {
          setAlreadyDone(true);
          setTimeout(()=>{ if(onSubmitted) onSubmitted(stars); },2000);
          return;
        }
        setError(data.error||"Failed to submit."); setSaving(false); return;
      }
      setSuccess(true);
      setTimeout(()=>{ if(onSubmitted) onSubmitted(stars); },1400);
    } catch { setError("Network error."); setSaving(false); }
  };

  /* ── Already done ── */
  if (alreadyDone) return (
    <div style={s.overlay}>
      <style>{injectFonts}{`@keyframes popIn{0%{transform:scale(0.85);opacity:0}60%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}`}</style>
      <div style={{...s.modal,textAlign:"center",padding:"52px 32px",animation:"popIn 0.4s ease"}}>
        <div style={{fontSize:"56px",marginBottom:"14px"}}>✅</div>
        <div style={{fontFamily:T.display,fontSize:"28px",letterSpacing:"1px",color:T.green,marginBottom:"8px"}}>Already Rated</div>
        <div style={{fontSize:"14px",color:T.muted}}>You have already submitted your rating for this booking.</div>
        <div style={{fontSize:"12px",color:T.dim,marginTop:"10px"}}>Closing automatically...</div>
      </div>
    </div>
  );

  /* ── Success ── */
  if (success) return (
    <div style={s.overlay}>
      <style>{injectFonts}{`@keyframes popIn{0%{transform:scale(0.85);opacity:0}60%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}@keyframes starBurst{0%{transform:scale(0);opacity:0}60%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}`}</style>
      <div style={{...s.modal,textAlign:"center",animation:"popIn 0.4s ease"}}>
        <div style={s.successHeader}>
          <div style={{fontSize:"62px",animation:"starBurst 0.5s ease 0.1s both"}}>🌟</div>
          <div style={{fontFamily:T.display,fontSize:"32px",letterSpacing:"1px",color:T.text,marginTop:"10px"}}>Rating Submitted!</div>
          <div style={{fontSize:"15px",color:T.muted,marginTop:"6px"}}>You rated <strong style={{color:T.text}}>{rateeName}</strong></div>
          <div style={{fontSize:"40px",margin:"14px 0 0",letterSpacing:"6px",color:T.yellow}}>
            {"★".repeat(stars)}<span style={{color:T.border}}>{"★".repeat(5-stars)}</span>
          </div>
          <div style={{fontSize:"16px",color:T.yellow,marginTop:"8px",fontWeight:700}}>{LABELS[stars]}</div>
        </div>
      </div>
    </div>
  );

  /* ── Form ── */
  const starColor = (n) => n<=activeStars ? T.yellow : T.border;

  return (
    <div style={s.overlay} onClick={e=>e.stopPropagation()}>
      <style>{injectFonts}{`
        @keyframes modalIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .rm-star{transition:color 0.12s,transform 0.12s;cursor:pointer;user-select:none;display:inline-block;line-height:1}
        .rm-star:hover{transform:scale(1.3)!important}
        .rm-textarea{resize:vertical;transition:border-color 0.2s}
        .rm-textarea:focus{border-color:#26a0da!important;outline:none}
        .rm-input:focus{border-color:#26a0da!important;outline:none}
        .rm-pay-btn:hover:not(:disabled){opacity:0.88}
      `}</style>
      <div style={{...s.modal,animation:"modalIn 0.3s ease"}} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={s.header}>
          <div style={{flex:1}}>
            <div style={{fontSize:"10px",fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",color:T.dim,marginBottom:"6px"}}>
              {isChefRating ? "Rate Your Chef" : "Rate This Customer"}
            </div>
            <div style={{fontFamily:T.display,fontSize:"28px",letterSpacing:"1px",color:T.text}}>
              {isChefRating?"👨‍🍳":"👤"} {rateeName}
            </div>
            <div style={{fontSize:"12px",color:T.dim,marginTop:"4px"}}>
              {booking?.tokenId||`Booking #${booking?.id}`} · {booking?.date}
            </div>
          </div>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={{padding:"24px",display:"flex",flexDirection:"column",gap:"20px"}}>

          {error && <div style={s.errorBox}>⚠️ {error}</div>}

          {/* Stars section */}
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:"12px",color:T.dim,marginBottom:"16px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.8px"}}>
              Your Rating
            </div>

            {/* Star row */}
            <div style={{display:"flex",justifyContent:"center",gap:"6px",marginBottom:"10px"}}>
              {[1,2,3,4,5].map(n=>(
                <span
                  key={n}
                  className="rm-star"
                  role="button" tabIndex={0}
                  aria-label={`${n} star`}
                  style={{
                    fontSize:"46px",
                    color:starColor(n),
                    transform:n<=activeStars?"scale(1.2)":"scale(1)",
                  }}
                  onMouseEnter={()=>setHover(n)}
                  onMouseLeave={()=>setHover(0)}
                  onClick={e=>{ e.stopPropagation(); setStars(n); setError(""); }}
                  onKeyDown={e=>{ if(e.key==="Enter"||e.key===" "){ setStars(n); setError(""); } }}
                >★</span>
              ))}
            </div>

            {/* Label */}
            <div style={{
              minHeight:"28px",
              fontSize:"16px",fontWeight:700,
              color: stars>0?T.yellow:T.dim,
              transition:"color 0.2s",
            }}>
              {stars>0 ? LABELS[stars] : "— tap a star —"}
            </div>

            {/* Progress bar */}
            <div style={{height:"3px",background:T.border,borderRadius:"2px",marginTop:"12px",overflow:"hidden"}}>
              <div style={{
                height:"100%",
                width:`${(activeStars/5)*100}%`,
                background:`linear-gradient(90deg, ${T.accent}, ${T.yellow})`,
                borderRadius:"2px",
                transition:"width 0.25s ease",
              }}/>
            </div>
          </div>

          {/* Comment */}
          <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
            <label style={{fontSize:"10px",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:T.dim}}>
              Comment <span style={{fontWeight:400,textTransform:"none",color:T.dim,letterSpacing:0}}>(optional)</span>
            </label>
            <textarea
              className="rm-textarea"
              value={comment}
              onChange={e=>setComment(e.target.value)}
              placeholder={`Share your experience with ${rateeName}...`}
              rows={3}
              maxLength={300}
              style={{
                background:"#0f172a",
                border:`1.5px solid ${T.border}`,
                borderRadius:"10px",
                padding:"11px 14px",
                fontSize:"14px",
                color:T.text,
                fontFamily:T.font,
                width:"100%",
                boxSizing:"border-box",
                lineHeight:1.6,
              }}
            />
            <div style={{fontSize:"11px",color:T.dim,textAlign:"right"}}>{comment.length}/300</div>
          </div>

          {/* Buttons */}
          <div style={{display:"flex",gap:"10px"}}>
            <button
              className="rm-pay-btn"
              onClick={handleSubmit}
              disabled={stars===0||saving}
              style={{
                flex:1,padding:"13px",
                background: stars===0||saving?"#1e293b"
                  : isChefRating?"linear-gradient(135deg,#26a0da,#1976d2)"
                  : "linear-gradient(135deg,#d97706,#f59e0b)",
                color: stars===0||saving?T.dim:"#fff",
                border: `1px solid ${stars===0||saving?T.border:"transparent"}`,
                borderRadius:"10px",fontWeight:700,
                fontSize:"15px",cursor:stars===0||saving?"not-allowed":"pointer",
                fontFamily:T.font,transition:"opacity 0.2s",
              }}
            >
              {saving?"Submitting...":stars===0?"⭐ Select a rating":`Submit ${stars}★ Rating`}
            </button>
            <button
              onClick={onClose}
              style={{
                padding:"13px 18px",
                background:"rgba(248,250,252,0.05)",
                border:`1px solid ${T.border}`,
                borderRadius:"10px",
                cursor:"pointer",fontSize:"14px",
                color:T.muted,fontFamily:T.font,
                transition:"all 0.2s",
              }}
            >
              Later
            </button>
          </div>

          <p style={{fontSize:"11px",color:T.dim,textAlign:"center",margin:0}}>
            You can rate later from the Orders page.
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position:"fixed",inset:0,
    background:"rgba(0,0,0,0.75)",
    display:"flex",alignItems:"center",justifyContent:"center",
    zIndex:1000,padding:"16px",
    backdropFilter:"blur(6px)",
  },
  modal: {
    background:T.surface,
    border:`1px solid ${T.border}`,
    borderRadius:"18px",
    width:"100%",maxWidth:"420px",
    boxShadow:"0 32px 80px rgba(0,0,0,0.7)",
    overflow:"hidden",
  },
  header: {
    display:"flex",alignItems:"flex-start",justifyContent:"space-between",
    padding:"24px 24px 20px",
    background:"linear-gradient(135deg,#0c1a3a,#162032)",
    borderBottom:`1px solid ${T.border}`,
    gap:"12px",
  },
  closeBtn: {
    background:"rgba(248,250,252,0.07)",
    border:`1px solid ${T.border}`,
    borderRadius:"8px",
    width:"32px",height:"32px",
    cursor:"pointer",
    color:T.muted,fontSize:"14px",
    display:"flex",alignItems:"center",justifyContent:"center",
    flexShrink:0,marginTop:"2px",
  },
  successHeader: {
    padding:"36px 28px 30px",
    background:"linear-gradient(135deg,#052e16,#14532d)",
    borderBottom:`1px solid rgba(74,222,128,0.2)`,
    textAlign:"center",
  },
  errorBox: {
    background:"rgba(248,113,113,0.08)",
    border:`1px solid rgba(248,113,113,0.25)`,
    borderRadius:"10px",
    padding:"10px 14px",
    fontSize:"13px",
    color:T.red,fontWeight:500,
  },
};

export default RatingModal;