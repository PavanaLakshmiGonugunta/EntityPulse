import React from "react";
import { NavLink, Link } from "react-router-dom";
import { IoMdHome } from "react-icons/io";
import { CiSearch, CiCircleInfo } from "react-icons/ci";
import { BsFileBarGraph } from "react-icons/bs";
import { FaUserCircle } from "react-icons/fa"; // user icon for avatar
import './header.css'

const Header = () => {
    return (
        <header className="app-header" role="banner">
        {/* Left: Brand */}
        <Link to="/home" className="brand" aria-label="Entity Pulse Home">
            <BsFileBarGraph aria-hidden="true" className="brand-icon" />
            <span className="brand-name">Entity Pulse</span>
        </Link>

        {/* Right: Navigation + Avatar */}
        <div className="header-right">
            <nav className="main-nav" aria-label="Primary">
            <NavLink to="/home" className="navlink">
                <IoMdHome aria-hidden="true" />
                <span>Analyze</span>
            </NavLink>
            <NavLink to="/search" className="navlink">
                <CiSearch aria-hidden="true" />
                <span>Search</span>
            </NavLink>
            <NavLink to="/about" className="navlink">
                <CiCircleInfo aria-hidden="true" />
                <span>About</span>
            </NavLink>
            </nav>

            {/* Avatar Icon */}
            <Link to="/profile" className="avatar" aria-label="Profile">
            <FaUserCircle className="avatar-icon" />
            </Link>
        </div>
        </header>
    );
};

export default Header;
