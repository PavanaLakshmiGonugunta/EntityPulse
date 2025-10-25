// import React from "react";
// // import Header from "./Header.jsx";
// import {  motion } from "framer-motion";
// import "./LandingPage.css"; // import the CSS file
// import sentimentImg from "./sentiment2.png"; // ✅ correct way to import
// import { Link } from 'react-router-dom';
// import Header from "./Header";
// const LandingPage = () => {
//   return (
//     <div className="landing-container">
//       <div className="navbar">

//       </div>
//       {/* Hero Section */}
//       <header className="hero-section">
//         {/* ✅ Use imported image */}
//         <img src={sentimentImg} alt="Background" className="hero-bg" />
//         <div className="overlay"></div>

//         <motion.div
//           className="hero-content"
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1 }}
//         >
//           <h1 style={{color:'white'}}>Analyze Financial Texts Effortlessly</h1>
//           <p>
//             EntityPulse connects you to actionable insights from financial
//             documents and news using AI-powered analytics.
//           </p>
//           {/* <a href="/Home" className="btn">
//             Get Started
//           </a> */}
//           <Link to="/home" className="btn">
//             Get Started
//           </Link>
//         </motion.div>
//       </header>

      
//     </div>
//   );
// };

// export default LandingPage;
import React from "react";
import { motion } from "framer-motion";
import "./LandingPage.css";
import sentimentImg from "./sentiment2.png";
import { Link } from "react-router-dom";
import Search from "./Search";
import About from "./About";
import { BsFileBarGraph } from "react-icons/bs";

const LandingPage = () => {
  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo"><i><BsFileBarGraph /></i> <strong>Sentiment Scope</strong></div>
        <ul className="nav-links">
          
          <li><Link to="/signin">Sign In</Link></li>
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
          <h1 style={{ color: "white" }}>Analyze Financial Texts Effortlessly</h1>
          <p>
            EntityPulse connects you to actionable insights from financial
            documents and news using AI-powered analytics.
          </p>
          <Link to="/home" className="btn">
            Get Started
          </Link>
        </motion.div>
      </header>
    </div>
  );
};

export default LandingPage;
