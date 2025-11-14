// import React from "react";
// import { motion } from "framer-motion";
// import "./LandingPage.css";
// import sentimentImg from "./sentiment2.png";
// import { Link } from "react-router-dom";
// import Search from "./Search";
// import About from "./About";
// import { BsFileBarGraph } from "react-icons/bs";
// import './LandingPage.css'

// const LandingPage = () => {
//     return (
//         <div className="landing-container">
//         {/* Navbar */}
//         <nav className="navbar">
//             <div className="logo"><i><BsFileBarGraph /></i> <strong>Sentiment Scope</strong></div>
//             <ul className="nav-links">
            
//             <li><Link to="/login">Sign In</Link></li>
//             <li><Link to="/signup" className="signup-btn">Sign Up</Link></li>
//             <li><Link to="/search">Search</Link></li>
//             <li><Link to="/about">About Us</Link></li>
//             </ul>
//         </nav>

//         {/* Hero Section */}
//         <header className="hero-section">
//             <img src={sentimentImg} alt="Background" className="hero-bg" />
//             <div className="overlay"></div>

//             <motion.div
//             className="hero-content"
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 1 }}
//             >
//             <h1 style={{ color: "white" }}>Analyze Financial Texts Effortlessly</h1>
//             <p>
//                 EntityPulse connects you to actionable insights from financial
//                 documents and news using AI-powered analytics.
//             </p>
//             <Link to="/home" className="btn">
//                 Get Started
//             </Link>
//             </motion.div>
//         </header>
//         </div>
//     );
// };

// export default LandingPage;


import React from "react";
import { motion } from "framer-motion";
import "./LandingPage.css";
import sentimentImg from "./sentiment2.png";
import { Link } from "react-router-dom";
import { BsFileBarGraph } from "react-icons/bs";

const LandingPage = () => {
  return (
    <div className="landing-container">
      
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          <i><BsFileBarGraph /></i> <strong>Sentiment Scope</strong>
        </div>
        <ul className="nav-links">
          <li><Link to="/login">Sign In</Link></li>
          <li><Link to="/signup" className="signup-btn">Sign Up</Link></li>
          <li><Link to="/search">Search</Link></li>
          <li><Link to="/about">About Us</Link></li>
        </ul>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <img src={sentimentImg} alt="Background" className="hero-bg" />
        <div className="overlay"></div>

        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 style={{ color: "white",}}>Analyze Financial Texts Effortlessly</h1>
          <p>
            EntityPulse connects you to actionable insights from financial
            documents and news using AI-powered analytics.
          </p>
          <Link to="/home" className="btn">
            Get Started
          </Link>
        </motion.div>
      </header>

      {/* ------------------ SCROLLING FEATURE BAND ------------------ */}
      <div className="scroll-band">
        <div className="scroll-track">
          <span className="pill">AI Entity Recognition</span>
          <span className="pill">Multilingual Sentiment Analysis</span>
          <span className="pill">Financial Entity Extraction</span>
          <span className="pill">Market Trend Detection</span>
          <span className="pill">OCR & Voice Input Support</span>
          <span className="pill">Financial Data Awareness</span>
          <span className="pill">Real-time Insights</span>
        </div>

        {/* Duplicate for seamless animation */}
        <div className="scroll-track">
          <span className="pill">AI Entity Recognition</span>
          <span className="pill">Multilingual Sentiment Analysis</span>
          <span className="pill">Financial Entity Extraction</span>
          <span className="pill">Market Trend Detection</span>
          <span className="pill">OCR & Voice Input Support</span>
          <span className="pill">Financial Data Awareness</span>
          <span className="pill">Real-time Insights</span>
        </div>
      </div>

    </div>
  );
};

export default LandingPage;
