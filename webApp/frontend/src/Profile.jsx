import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Profile.css";

export default function Profile() {
    const [user, setUser] = useState({ username: "", email: "" });
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
            const res = await axios.get("http://localhost:5000/profile", { withCredentials: true });
            if (!mounted) return;
            setUser({ username: res.data.username || "", email: res.data.email || "" });
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
        try {
        const userId = localStorage.getItem("userId");
        if (!userId) throw new Error("No userId available; please login.");
        const res = await axios.put("http://localhost:5000/profile", {
            username: user.username,
            email: user.email
        }, { withCredentials: true });

        setUser(res.data.user); 
        alert(res.data.message || "Profile updated.");
        setError(null);
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
            navigate("/login");
        } catch (err) {
            console.warn("Logout request failed (continuing):", err);
        }
        localStorage.removeItem("userId");
        navigate("/login");
    };

    if (loading) return <div className="profile-page"><div className="loading">Loading profile...</div></div>;

    return (
        <div className="profile-page">
        <div className="profile-card">
            <div className="left-section">
            <div className="overlay-shape" />
            <div className="left-content">
                <div className="avatar">{(user.username || "U").charAt(0).toUpperCase()}</div>
                <div className="left-text">
                <h2>{user.username || "Unnamed"}</h2>
                <p className="email">{user.email || "no-email"}</p>
                </div>
            </div>
            </div>

            <div className="right-section">
            <form className="profile-form" onSubmit={handleSave}>
                <h2>Profile</h2>
                <p>Edit your username and email below.</p>

                <label>Username</label>
                <input name="username" value={user.username} onChange={handleChange} placeholder="Your username" required />

                <label>Email</label>
                <input name="email" type="email" value={user.email} onChange={handleChange} placeholder="you@example.com" required />

                {error && <div className="error">{error}</div>}

                <div className="actions">
                <button type="submit" className="save-btn" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                </button>

                <button type="button" className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>

                <Link to="/home" className="back-link">Back to Home</Link>
                </div>
            </form>
            </div>
        </div>
        </div>
    );
}
