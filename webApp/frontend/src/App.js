import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import LandingPage from "./LandingPage.jsx";
import Home from "./Home.jsx";
import ResultsPage from "./ResultsPage.js";
import Analysis from "./Analysis.jsx";
import Search from "./Search.jsx";
import About from "./About.jsx";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import History from "./History.jsx";
function App() {
  return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login/>}></Route>
        <Route path="/signup" element={<Signup/>}></Route>
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About/>}></Route>
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/search"  element={<Search />} />
        <Route path="/history" element={<History />} />

      </Routes>
  );
}
export default App;