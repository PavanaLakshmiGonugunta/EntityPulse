// import React, { useState } from "react";
// import { FaEye, FaEyeSlash } from "react-icons/fa";
// import {Link} from "react-router-dom";
// import "./Signup.css";

// const Signup = () => {
//   const [username, setUsername] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (password !== confirmPassword) {
//       alert("Passwords do not match!");
//       return;
//     }

//     console.log("Username:", username);
//     console.log("Email:", email);
//     console.log("Password:", password);
//     console.log("Confirm Password:", confirmPassword);
//   };

//   return (
//     <div className="signup-wrapper">
//       <div className="signup-container">
//         {/* Left Green Section */}
//         <div className="left-section">
//           <div className="overlay-shape"></div>
//           <div className="left-content">
//             <h1>Join the Future of Financial Insights.</h1>
//             <p>
//               Create your account to unlock powerful entity-level sentiment
//               analytics and make smarter investment decisions.
//             </p>
//           </div>
//         </div>

//         {/* Right White Section */}
//         <div className="right-section">
//           <h2>Create Your Account</h2>
//           <p>Sign up to start exploring insights and trends</p>

//           <form onSubmit={handleSubmit}>
//             <input
//               type="text"
//               placeholder="Enter your username"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               required
//             />

//             <input
//               type="email"
//               placeholder="Enter your email ID"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />

//             <div className="password-wrapper">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 placeholder="Enter your password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//               <span
//                 className="toggle-password"
//                 onClick={() => setShowPassword(!showPassword)}
//               >
//                 {showPassword ? <FaEyeSlash /> : <FaEye />}
//               </span>
//             </div>

//             <div className="password-wrapper">
//               <input
//                 type={showConfirmPassword ? "text" : "password"}
//                 placeholder="Confirm your password"
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//                 required
//               />
//               <span
//                 className="toggle-password"
//                 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//               >
//                 {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
//               </span>
//             </div>

//             <button type="submit" className="signup-btn">
//               SIGN UP
//             </button>
//           </form>

//           <p className="login-link">
//             Already have an account? <Link to="/login">Log in</Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Signup;

import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Signup.css";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      // Send signup data to backend
      const response = await axios.post("http://localhost:5000/signup", {
        username,
        email,
        password,
      });

      alert(response.data.message); // e.g., "User registered successfully!"
      console.log("Signup success:", response.data);

      // Redirect to login page
      window.location.href = "/login";
    } catch (error) {
      console.error("Signup error:", error);
      if (error.response && error.response.data.message) {
        alert(error.response.data.message); // e.g., "User already exists!"
      } else {
        alert("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-container">
        {/* Left Green Section */}
        <div className="left-section">
          <div className="overlay-shape"></div>
          <div className="left-content">
            <h1>Join the Future of Financial Insights.</h1>
            <p>
              Create your account to unlock powerful entity-level sentiment
              analytics and make smarter investment decisions.
            </p>
          </div>
        </div>

        {/* Right White Section */}
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
            />

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

            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <span
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
