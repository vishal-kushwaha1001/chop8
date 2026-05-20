// src/Components/RatingPoller.jsx
// No UI of its own — triggers RatingModal when a booking is eligible.
// All logic unchanged. No inline styles needed (RatingModal handles its own styles).
import React, { useEffect, useState, useRef } from "react";
import { getUser } from "../services/AuthService";
import { API } from "../config";
import RatingModal from "./RatingModal";

/* ── sessionStorage helpers (unchanged) ─────────────────── */
const SS_KEY = "chop8_rated_bookings";

function getSessionRated() {
  try {
    const raw = sessionStorage.getItem(SS_KEY);
    return raw ? new Set(raw.split(",").map(Number).filter(Boolean)) : new Set();
  } catch { return new Set(); }
}

function markSessionRated(bookingId) {
  try {
    const set = getSessionRated();
    set.add(Number(bookingId));
    sessionStorage.setItem(SS_KEY, [...set].join(","));
  } catch { /* ignore */ }
}

/* ── Time helpers (unchanged) ────────────────────────────── */
function hasTimeOutPassed(date, timeOut) {
  if (!date || !timeOut) return false;
  return new Date() > new Date(`${date}T${timeOut}:00`);
}

function isWithin24Hours(date, timeOut) {
  if (!date || !timeOut) return false;
  const expireAt = new Date(`${date}T${timeOut}:00`);
  const now      = new Date();
  if (now < expireAt) return false;
  return (now - expireAt) <= 24 * 60 * 60 * 1000;
}

/* ── Component ───────────────────────────────────────────── */
function RatingPoller() {
  const [current, setCurrent] = useState(null);
  const processingRef = useRef(false);
  const mountedRef    = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  /* ── Polling logic (unchanged) ── */
  const pollAndShow = async () => {
    if (processingRef.current) return;
    const user = getUser();
    if (!user) return;

    processingRef.current = true;

    try {
      let bookings = [];
      if (user.role === "customer") {
        const res = await fetch(`${API.bookings}/user/${user.userId}`);
        bookings  = await res.json();
      } else if (user.role === "chef") {
        const res = await fetch(`${API.bookings}/chef/${user.userId}`);
        bookings  = await res.json();
      }
      if (!Array.isArray(bookings)) return;

      const sessionRated = getSessionRated();

      for (const b of bookings) {
        if (b.status === "CANCELLED" || b.status === "PENDING") continue;
        if (sessionRated.has(Number(b.id))) continue;

        const isExpired   = b.status === "EXPIRED";
        const isConfirmed = b.status === "CONFIRMED";
        const timePassed  = hasTimeOutPassed(b.date, b.timeOut);
        const within24h   = isWithin24Hours(b.date, b.timeOut);

        const eligible = (isExpired && within24h) ||
                         (isConfirmed && timePassed && within24h);

        if (!eligible) continue;

        let rateeId   = null;
        let rateeName = null;

        if (user.role === "customer") {
          if (!b.chef?.id) continue;
          rateeId   = b.chef.id;
          rateeName = b.chef.name || "Chef";

        } else if (user.role === "chef") {
          try {
            const cr    = await fetch(`${API.ratings}/booking/${b.id}/customer-rated`);
            const cdata = await cr.json();
            if (!cdata.rated) continue;
            if (cdata.customerId) {
              rateeId   = cdata.customerId;
              rateeName = cdata.customerName || "Customer";
            } else if (b.user?.id) {
              rateeId   = b.user.id;
              rateeName = b.user.name || "Customer";
            }
          } catch {
            if (b.user?.id) { rateeId = b.user.id; rateeName = b.user.name || "Customer"; }
            else continue;
          }
          if (!rateeId) continue;
        }

        try {
          const dr = await fetch(`${API.ratings}/booking/${b.id}/rater/${user.userId}?role=${user.role}`);
          const dd = await dr.json();
          if (dd.alreadyRated) {
            markSessionRated(b.id);
            continue;
          }
        } catch { continue; }

        if (!mountedRef.current) break;
        setCurrent({
          booking:   b,
          rateeId,
          rateeName,
          rateeRole: user.role === "customer" ? "chef" : "customer",
        });
        break;
      }
    } catch { /* ignore */ }
    finally {
      processingRef.current = false;
    }
  };

  useEffect(() => {
    pollAndShow();
    const interval = setInterval(() => {
      if (!current) pollAndShow();
    }, 30_000);
    return () => clearInterval(interval);
  }, [current]);

  const loggedUser = getUser();
  if (!current || !loggedUser) return null;
  if (!current.rateeId) {
    markSessionRated(current.booking.id);
    setCurrent(null);
    return null;
  }

  return (
    <RatingModal
      booking={current.booking}
      raterId={loggedUser.userId}
      raterName={loggedUser.name}
      raterRole={loggedUser.role}
      rateeId={current.rateeId}
      rateeName={current.rateeName}
      rateeRole={current.rateeRole}
      onClose={() => {
        markSessionRated(current.booking.id);
        setCurrent(null);
      }}
      onSubmitted={() => {
        markSessionRated(current.booking.id);
        setCurrent(null);
      }}
    />
  );
}

export default RatingPoller;