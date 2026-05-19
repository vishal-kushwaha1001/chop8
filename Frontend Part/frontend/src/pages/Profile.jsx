// src/pages/Profile.jsx
import styles from "./Styles/Profile.module.css"
import React, { useState, useEffect, useRef } from "react";
import { getUser, fetchProfile, saveProfile, updateLocalUser } from "../services/AuthService";
import { API } from "../config";
import { useNavigate } from "react-router";


const SPECIALISATION_OPTIONS = [
  "Indian Chef", "Italian Chef", "Chinese Chef", "Mexican Chef",
  "Japanese Chef", "Continental Chef", "Dessert Chef", "Healthy Chef",
  "Mughlai Chef", "South Indian Chef", "Bengali Chef", "Gujarati Chef",
  "Multi-Cuisine Chef",
];

/* ── StarDisplay ─────────────────────────────────────────── */
function StarDisplay({ avg, count }) {
  const rounded = Math.round(avg || 0);
  return (
    <div className={styles.starRow}>
      <span className={styles.stars}>
        {"★".repeat(rounded)}
        <span className={styles.starsEmpty}>{"★".repeat(5 - rounded)}</span>
      </span>
      <span className={styles.ratingNum}>
        {avg > 0 ? Number(avg).toFixed(1) : "—"}
      </span>
      <span className={styles.ratingCount}>
        ({count} {count === 1 ? "review" : "reviews"})
      </span>
    </div>
  );
}

/* ── Profile ─────────────────────────────────────────────── */
function Profile() {
  const navigate   = useNavigate();
  const fileRef    = useRef(null);
  const loggedUser = getUser();

  const [form, setForm] = useState({
    name: "", mobile: "", address: "", pricePerDay: "", specialisation: "",
  });
  const [photo,       setPhoto]       = useState("");
  const [preview,     setPreview]     = useState("");
  const [ratings,     setRatings]     = useState([]);
  const [avgRating,   setAvgRating]   = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [success,     setSuccess]     = useState("");
  const [error,       setError]       = useState("");

  const isChef = loggedUser?.role === "chef";

  useEffect(() => {
    if (!loggedUser) { navigate("/login"); return; }

    fetchProfile(loggedUser.role, loggedUser.userId)
      .then(data => {
        setForm({
          name:           data.name           || "",
          mobile:         data.mobile         || "",
          address:        data.address        || "",
          pricePerDay:    data.pricePerDay != null ? String(data.pricePerDay) : "",
          specialisation: data.specialisation || "",
        });
        setPhoto(data.photo    || "");
        setPreview(data.photo  || "");
        setAvgRating(data.avgRating    || 0);
        setRatingCount(data.ratingCount || 0);
        setLoading(false);
      })
      .catch(() => { setError("Could not load profile."); setLoading(false); });

    fetch(`${API.ratings}/ratee/${loggedUser.userId}`)
      .then(r => r.json())
      .then(data => {
        setRatings(Array.isArray(data.ratings) ? data.ratings : []);
        if (data.average) setAvgRating(data.average);
        if (data.count)   setRatingCount(data.count);
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSuccess(""); setError("");
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) { setError("Photo must be under 1 MB."); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result);
      setPreview(reader.result);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhoto(""); setPreview("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Name cannot be empty."); return; }
    if (isChef) {
      const price = parseFloat(form.pricePerDay);
      if (isNaN(price) || price < 0) { setError("Please enter a valid price per day."); return; }
    }
    setSaving(true); setSuccess(""); setError("");
    try {
      const payload = {
        name:    form.name.trim(),
        mobile:  form.mobile.trim(),
        address: form.address.trim(),
        photo,
      };
      if (isChef) {
        payload.pricePerDay    = parseFloat(form.pricePerDay) || 0;
        payload.specialisation = form.specialisation.trim();
      }
      const saved = await saveProfile(loggedUser.role, loggedUser.userId, payload);
      updateLocalUser({
        name:   saved.name,
        mobile: saved.mobile,
        photo:  saved.photo,
        ...(isChef && {
          pricePerDay:    saved.pricePerDay,
          specialisation: saved.specialisation,
        }),
      });
      setSuccess("Profile saved successfully ✅");
    } catch (err) {
      setError(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (!loggedUser) return null;

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* ── Card Header ── */}
        <div className={styles.cardHeader}>
          <div>
            <div className={styles.cardHeaderTitle}>My Profile</div>
            <div className={styles.cardHeaderSub}>Manage your personal information</div>
          </div>
          <span className={isChef ? styles.roleBadgeChef : styles.roleBadgeCustomer}>
            {isChef ? "👨‍🍳 Chef" : "👤 Customer"}
          </span>
        </div>

        {/* ── Card Body ── */}
        <div className={styles.cardBody}>

          {/* Alerts */}
          {error   && <div className={styles.alertError}>{error}</div>}
          {success && <div className={styles.alertSuccess}>{success}</div>}

          {loading ? (
            <p className={styles.loading}>Loading profile…</p>
          ) : (
            <>
              {/* Rating Summary */}
              {ratingCount > 0 && (
                <div className={styles.sectionBoxHighlight}>
                  <div className={styles.ratingLabel}>
                    {isChef ? "⭐ Your Rating from Customers" : "⭐ Your Rating from Chefs"}
                  </div>
                  <StarDisplay avg={avgRating} count={ratingCount} />
                </div>
              )}

              {/* Photo Section */}
              <div className={`${styles.sectionBox} ${styles.photoSection}`}>
                <div className={styles.avatarRing}>
                  {preview
                    ? <img src={preview} alt="Profile" className={styles.avatarImg} />
                    : <span className={styles.avatarFallback}>{isChef ? "👨‍🍳" : "👤"}</span>
                  }
                </div>
                <div className={styles.photoControls}>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handlePhotoChange}
                  />
                  <button
                    className={styles.btnUpload}
                    onClick={() => fileRef.current?.click()}
                  >
                    📷 {preview ? "Change Photo" : "Upload Photo"}
                  </button>
                  {preview && (
                    <button className={styles.btnRemove} onClick={handleRemovePhoto}>
                      🗑 Remove
                    </button>
                  )}
                  <p className={styles.photoHint}>JPG / PNG · Max 1 MB</p>
                </div>
              </div>

              {/* Form Grid */}
              <div className={styles.formGrid}>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Full Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className={styles.input}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    Email
                    <span className={styles.labelNote}>(cannot be changed)</span>
                  </label>
                  <input
                    value={loggedUser.email || ""}
                    disabled
                    className={styles.inputDisabled}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Mobile Number</label>
                  <input
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    placeholder="Your mobile number"
                    className={styles.input}
                  />
                </div>

                {isChef && (
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Price Per Day (₹)</label>
                    <input
                      name="pricePerDay"
                      type="number"
                      min="0"
                      value={form.pricePerDay}
                      onChange={handleChange}
                      placeholder="e.g. 1500"
                      className={styles.input}
                    />
                  </div>
                )}

                <div className={styles.fieldFull}>
                  <label className={styles.label}>Address</label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Your address"
                    rows={2}
                    className={styles.textarea}
                  />
                </div>

              </div>

              {/* Specialisation — chef only */}
              {isChef && (
                <div className={styles.specSection}>
                  <label className={styles.label}>
                    Specialisation
                    <span className={styles.labelNote}>shown as badge on your card</span>
                  </label>
                  <div className={styles.specChips}>
                    {SPECIALISATION_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        type="button"
                        className={
                          form.specialisation === opt
                            ? styles.specChipActive
                            : styles.specChip
                        }
                        onClick={() => {
                          setForm(f => ({ ...f, specialisation: opt }));
                          setSuccess(""); setError("");
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  <input
                    name="specialisation"
                    value={form.specialisation}
                    onChange={handleChange}
                    placeholder="Or type a custom specialisation…"
                    className={styles.input}
                  />
                </div>
              )}

              {/* Chef card preview */}
              {isChef && (form.pricePerDay || form.specialisation) && (
                <div className={styles.sectionBoxHighlight}>
                  <div className={styles.previewLabel}>Your card will show:</div>
                  <div className={styles.previewRow}>
                    {form.specialisation && (
                      <span className={styles.previewSpec}>{form.specialisation}</span>
                    )}
                    {form.pricePerDay && (
                      <span className={styles.previewPrice}>₹{form.pricePerDay} / day</span>
                    )}
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className={styles.saveBtnRow}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={saving ? styles.btnSaveDisabled : styles.btnSave}
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>

              {/* Reviews Received */}
              {ratings.length > 0 && (
                <div className={styles.reviewsSection}>
                  <div className={styles.reviewsTitle}>
                    ⭐ Reviews Received ({ratings.length})
                  </div>
                  <div className={styles.reviewsList}>
                    {ratings.map(r => (
                      <div key={r.id} className={styles.reviewCard}>
                        <div className={styles.reviewCardHead}>
                          <div>
                            <span className={styles.reviewerName}>
                              {r.raterRole === "chef" ? "👨‍🍳" : "👤"} {r.raterName}
                            </span>
                            <span className={styles.reviewDate}>{r.createdAt}</span>
                          </div>
                          <span className={styles.reviewStars}>
                            {"★".repeat(r.stars)}
                            <span className={styles.starsEmpty}>{"★".repeat(5 - r.stars)}</span>
                          </span>
                        </div>
                        {r.comment && (
                          <p className={styles.reviewComment}>{r.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;