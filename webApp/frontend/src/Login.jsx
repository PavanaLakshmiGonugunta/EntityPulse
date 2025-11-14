import React, { useState } from "react";
import "./Login.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/login", { email, password }, { withCredentials: true });
      alert(response.data.message);
      // Redirect to profile or home
      navigate("/home"); // or "/home"
    } catch (error) {
      console.error("Login error:", error);
      if (error.response && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert("Something went wrong. Please try again.");
      }
    }
  };


  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="left-section">
          <div className="overlay-shape"></div>
          <div className="left-content">
            <h1>Your Gateway to Smarter Financial Decisions.</h1>
            <br />
            <p>
              Please login with your registered account to get real-time news
              about stock market and listen to what the market says.
            </p>
          </div>
        </div>

        {/* Right White Section */}
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
            />

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <a href="#" className="forgot-password">
              Forgot your password?
            </a>

            <button type="submit" className="login-btn">
              LOG IN
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
