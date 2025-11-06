import { useState } from "react";
import "./App.css";
import Search from "./Search.jsx";
import Header from "./Header.jsx";
import Home from "./Home.jsx";
import About from "./About.jsx";
import ResultsPage from "./ResultsPage.jsx";
import Analysis from "./Analysis.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/about" element={<About />} />
          <Route path="/result" element={<ResultsPage />} />
          <Route path="/analysis" element={<Analysis />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
