import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Profile.css";

export default function Profile() {
  const [user, setUser] = useState({ username: "", email: "", role: "user" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get("http://localhost:5000/profile", {
          withCredentials: true,
        });
        if (!mounted) return;
        setUser({
          username: res.data.username || "",
          email: res.data.email || "",
          role: res.data.role || "user",
        });
        setError(null);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        const status = err.response?.status;
        if (status === 401) setError("Not authenticated. Please login.");
        else setError(err.response?.data?.message || err.message || "Could not load profile.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => (mounted = false);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // Note: backend should implement PUT /profile to accept updates.
      const res = await axios.put(
        "http://localhost:5000/profile",
        { username: user.username, email: user.email },
        { withCredentials: true }
      );

      // if server returns updated user or message
      if (res.data?.user) setUser(res.data.user);
      alert(res.data?.message || "Profile updated.");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/logout", {}, { withCredentials: true });
    } catch (err) {
      console.warn("Logout request failed (continuing):", err);
    }
    localStorage.removeItem("userId");
    navigate("/login");
  };

  if (loading)
    return (
      <div className="profile-wrapper">
        <div className="profile-container">
          <div className="loading-block">Loading profile…</div>
        </div>
      </div>
    );

  return (
    <div className="profile-wrapper">
      <div className="profile-container">
        {/* LEFT: gradient panel with overlay shape + avatar */}
        <div className="left-section profile-left">
          <div className="overlay-shape" />
          <div className="left-content">
            <div className="avatar">
              {(user.username || "U").charAt(0).toUpperCase()}
            </div>
            <div className="left-text">
              <h2>{user.username || "Unnamed"}</h2>
              <p className="email">{user.email || "no-email"}</p>
              <p className="small-desc">
                {user.role === "admin" ? "Administrator" : "Standard user"}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: form */}
        <div className="right-section profile-right">
          <form className="profile-form" onSubmit={handleSave}>
            <h2>Profile</h2>
            <p className="muted">Edit your username and email below.</p>

            <label>
              Username
              <input
                name="username"
                value={user.username}
                onChange={handleChange}
                placeholder="Your username"
                required
              />
            </label>

            <label>
              Email
              <input
                name="email"
                type="email"
                value={user.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </label>

            {error && <div className="error">{error}</div>}

            <div className="actions">
              <button type="submit" className="save-btn" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button type="button" className="logout-btn" onClick={handleLogout}>
                Logout
              </button>

              <Link
                to={user.role === "admin" ? "/admin/stats" : "/home"}
                className="back-link"
              >
                {user.role === "admin" ? "Back to Stats" : "Back to Home"}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
