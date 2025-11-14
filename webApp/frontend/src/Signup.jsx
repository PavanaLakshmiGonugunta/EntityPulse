// src/pages/Signup.jsx
import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Signup.css";

/* -----------------------------
   SLIDES FOR THE LEFT SECTION
------------------------------ */
const signupSlides = [
  {
    text: "Create your account and unlock powerful financial insights.",
    bg: "#009D92",
  },
  {
    text: "Discover entity-level sentiment across global financial news.",
    bg: "#008B72",
  },
  {
    text: "Analyze market trends with AI-driven sentiment intelligence.",
    bg: "#007A87",
  },
  {
    text: "Track companies, industries, and market shifts in real time.",
    bg: "#006A99",
  },
  {
    text: "Join EntityPulse and make smarter, data-driven decisions.",
    bg: "#005A7A",
  },
];

const Signup = () => {
  // form state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // password toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // slider state
  const [currentSlide, setCurrentSlide] = useState(0);

  // auto-slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % signupSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      // include credentials so express-session cookie is set by backend
      const response = await axios.post(
        "http://localhost:5000/signup",
        { username, email, password },
        { withCredentials: true, timeout: 10000 }
      );

      // success message from server
      alert(response.data.message || "Registered successfully!");
      // redirect to login page
      window.location.href = "/login";
    } catch (error) {
      console.error("Signup error:", error);
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-container">
        {/* LEFT SECTION WITH SLIDER */}
        <div
          className="left-section"
          style={{ backgroundColor: signupSlides[currentSlide].bg }}
        >
          <div className="overlay-shape" />
          <div className="left-content">
            <div key={currentSlide} className="slide-text fade" aria-live="polite">
              {signupSlides[currentSlide].text}
            </div>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="right-section">
          <h2>Create Your Account</h2>
          <p>Sign up to start exploring insights and trends</p>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />

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
                autoComplete="new-password"
                minLength={6}
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword((s) => !s)}
                role="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setShowPassword((s) => !s)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
              />
              <span
                className="toggle-password"
                onClick={() => setShowConfirmPassword((s) => !s)}
                role="button"
                aria-label={
                  showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                }
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setShowConfirmPassword((s) => !s)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button type="submit" className="signup-btn">
              SIGN UP
            </button>
          </form>

          <p className="login-link">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
