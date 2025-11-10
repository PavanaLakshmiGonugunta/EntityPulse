// import React from "react";
// import { Link } from "react-router-dom";
// const Login = ()=>{
//     return(
//         <>
//         <div className="container">
//             <h2>Welcome Back!</h2>
//             <p>Enter your details to continue further...</p>
//             <div className="uname">
//                 <h5><b>Username</b></h5>
//                 <input type="text" placeholder="Enter your username" required></input>
//             </div>

//             <div className="pwd">
//                 <h5><b>Password</b></h5>
//                 <input type="password" placeholder="Enter your password" required></input>
//             </div>
//             <div className="login">
//                 <button type="submit">Login</button>
//             </div>

//             <div className="forgot-pwd">
//                 <p>Forgot your password? Click Here <Link to={"/forgot-pwd"}>Forgot Password</Link></p>
                
//             </div>
//             <div className="sigin">
//                 <p>Don't have an account? <Link to={"/signin"}>Create Account</Link></p>
                
//             </div>

            
//         </div>
//         </>
//     )
// }
// export default Login;

// import React, { useState } from "react";
// import "./Login.css";

// import { FaEye, FaEyeSlash } from "react-icons/fa";
// import {Link} from "react-router-dom";
// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log("Email:", email);
//     console.log("Password:", password);
//   };

//   return (
//     <div className="login-wrapper">
//       <div className="login-container">
//         <div className="left-section">
//           <div className="overlay-shape"></div>
//           <div className="left-content">
//             <h1>Your Gateway to Smarter Financial Decisions.</h1><br></br>
//             <p>Please login with your registered account to get real-time news about stock market and listen to what the market says. </p>
//           </div>
//         </div>

//         {/* Right White Section */}
//         <div className="right-section">
//           <h2>Welcome Back!</h2>
//           <p>Login in to your account to continue</p>

//           <form onSubmit={handleSubmit}>
//             <input
//               type="email"
//               placeholder="Enter you email ID"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//             {/* <input
//               type="password"
//               placeholder="Enter your password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//              */}

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
//                 onClick={() => setShowPassword(!showPassword)}>
//                 {showPassword ? <FaEyeSlash /> : <FaEye />}
//               </span>
              
//             </div>
//             <a href="#" className="forgot-password">
//               Forgot your password?
//             </a>
//             <button type="submit" className="login-btn">
//               LOG IN
//             </button>
//           </form>

//           <p className="signup">
//             Don’t have an account? <Link to="/signup">Sign up</Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;


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
      const response = await axios.post("http://localhost:5000/login", {
        email,
        password,
      });

      alert(response.data.message);
      console.log("Login success:", response.data);

      // ✅ Redirect to Home page
      navigate("/home");
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
