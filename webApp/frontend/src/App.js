import React from 'react';
import { Routes, Route } from 'react-router-dom'; 
import './App.css';
import LandingPage from './LandingPage.jsx';
import Home from './Home.jsx';
import ResultsPage from './ResultsPage.js';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/results" element={<ResultsPage />} />
    </Routes>
  );
}

export default App;
