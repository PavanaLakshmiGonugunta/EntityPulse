// src/components/AdminLayout.jsx
import React from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";   // ⬅️ import icon
import '../App.css'
import './admin.css'

export default function AdminLayout() {
  return (
    <div className="admin-layout">

      {/* HEADER / NAVBAR */}
      <nav className="admin-nav">

        {/* LEFT SIDE NAV ITEMS */}
        <div className="nav-left">
          <NavLink to="/admin/stats" className="nav-item">Stats</NavLink>
          <NavLink to="/admin/users" className="nav-item">Users</NavLink>
          <NavLink to="/admin/activity" className="nav-item">Activity</NavLink>
          <NavLink to="/admin/input-methods" className="nav-item">Input Methods</NavLink>
          <NavLink to="/admin/leaderboard" className="nav-item">Leaderboard</NavLink>
        </div>

        {/* RIGHT SIDE AVATAR ICON */}
        <div className="nav-right">
          <Link to="/profile" className="avatar" aria-label="Profile">
            <FaUserCircle className="avatar-icon" />
          </Link>
        </div>

      </nav>

      {/* PAGE CONTENT */}
      <div className="admin-page-content">
        <Outlet />
      </div>
    </div>
  );
}
