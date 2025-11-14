// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import "./Login.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const slides = [
  { text: "Your Gateway to Smarter Financial Decisions.", bg: "#009D92" },
  { text: "Login to get real-time insights about market sentiment.", bg: "#008B72" },
  { text: "Analyze entities across global financial news instantly.", bg: "#007A87" },
  { text: "Track sentiment trends and understand market movements.", bg: "#006A99" },
  { text: "Make smarter, data-driven decisions with EntityPulse.", bg: "#005A7A" },
];

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((s) => (s + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return alert("Please enter email and password.");
    setLoading(true);

    try {
      console.log("[Login] submitting", { email });

      // 1) log in (session cookie is set by the backend)
      const loginResp = await axios.post(
        "http://localhost:5000/login",
        { email, password },
        { withCredentials: true }
      );
      console.log("[Login] login response:", loginResp?.data);

      // 2) fetch profile (server stores userId in session; profile returns role)
      try {
        const profileResp = await axios.get("http://localhost:5000/profile", {
          withCredentials: true,
        });
        console.log("[Login] profile response:", profileResp?.data);
        const role = profileResp?.data?.role || "user";
        navigate(role === "admin" ? "/admin" : "/home");
      } catch (profileErr) {
        // If profile fetch fails, still navigate to /home as a fallback and log error
        console.warn("[Login] profile fetch failed, fallback to /home", profileErr?.response?.data || profileErr.message);
        // If profile returns 401 it means something went wrong with session - show message
        if (profileErr.response?.status === 401) {
          alert("Login succeeded but profile couldn't be retrieved. Try refreshing or re-login.");
        }
        navigate("/home");
      }
    } catch (err) {
      console.error("[Login] Login error:", err, err?.response?.data);
      if (err.response?.data?.message) alert(err.response.data.message);
      else if (err.response?.status === 401) alert("Invalid credentials.");
      else alert("Something went wrong. Check the console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        {/* LEFT SECTION: overlay-shape kept for your CSS, plus sliding text */}
        <div
          className="left-section text-slide"
          style={{ backgroundColor: slides[currentSlide].bg }}
        >
          <div className="overlay-shape" />
          <div className="left-content">
            <div key={currentSlide} className="slide-text fade">
              {slides[currentSlide].text}
            </div>
            <p style={{ opacity: 0.9, marginTop: 16, fontSize: "0.9rem", maxWidth: 360 }}>
              Please login with your registered account to get real-time news
              about the stock market and listen to what the market says.
            </p>
          </div>
        </div>

        {/* RIGHT SECTION: login form */}
        <div className="right-section">
          <h2>Welcome Back!</h2>
          <p>Login in to your account to continue</p>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter your email ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword((s) => !s)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <a href="/forgot" className="forgot-password">
              Forgot your password?
            </a>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Logging in..." : "LOG IN"}
            </button>
          </form>

          <p className="signup">
            Don’t have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
