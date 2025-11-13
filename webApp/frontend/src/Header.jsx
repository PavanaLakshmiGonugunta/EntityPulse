import React, { useEffect, useState, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { IoMdHome } from "react-icons/io";
import { CiSearch, CiCircleInfo } from "react-icons/ci";
import { BsFileBarGraph } from "react-icons/bs";
import { FaUserCircle } from "react-icons/fa";
import "./header.css";

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ Check login status
  const checkLogin = () => {
    const storedUser = localStorage.getItem("username");
    const storedId = localStorage.getItem("userId");

    if (storedUser && storedId) {
      setIsLoggedIn(true);
      setUsername(storedUser);
    } else {
      setIsLoggedIn(false);
      setUsername("");
    }
  };

  // Run check on load
  useEffect(() => {
    checkLogin();
  }, []);

  // Auto-updates when localStorage changes (login/logout)
  useEffect(() => {
    window.addEventListener("storage", checkLogin);
    return () => window.removeEventListener("storage", checkLogin);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setDropdownOpen(false);
    navigate("/login");
  };

  return (
    <header className="app-header" role="banner">
      {/* Left: Brand */}
      <Link to="/home" className="brand" aria-label="Entity Pulse Home">
        <BsFileBarGraph className="brand-icon" />
        <span className="brand-name">Entity Pulse</span>
      </Link>

      {/* Right side */}
      <div className="header-right">
        <nav className="main-nav" aria-label="Primary">
          <NavLink to="/home" className="navlink">
            <IoMdHome />
            <span>Analyze</span>
          </NavLink>

          <NavLink to="/search" className="navlink">
            <CiSearch />
            <span>Search</span>
          </NavLink>

          {isLoggedIn && (
            <NavLink to="/history" className="navlink">
              <span>History</span>
            </NavLink>
          )}

          <NavLink to="/about" className="navlink">
            <CiCircleInfo />
            <span>About</span>
          </NavLink>
        </nav>

        {/* Profile or Login */}
        <div className="header-actions" ref={dropdownRef}>
          {isLoggedIn ? (
            <div className="profile-section">
              <div className="profile-trigger" onClick={() => setDropdownOpen((o) => !o)}>
                <FaUserCircle className="avatar-icon" />
                <span className="username">{username}</span>
              </div>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <p className="greeting">Hello, <strong>{username}</strong></p>
                  <button className="logout-btn" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="login-btn">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
