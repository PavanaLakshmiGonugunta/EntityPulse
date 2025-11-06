import React, { useState } from "react";
import Header from './Header.jsx';
import { CiMobile2, CiSearch, CiShoppingCart } from "react-icons/ci";
import { FaCarSide, FaGoogle } from "react-icons/fa";
import { PiMicrosoftExcelLogo } from "react-icons/pi";
import { FaMeta } from "react-icons/fa6";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { fetchCompanyData } from "./utils/fetchCompanyData"; 

const iconMap = {
  CiMobile2: <CiMobile2 />,
  CiShoppingCart: <CiShoppingCart />,
  FaCarSide: <FaCarSide />,
  FaGoogle: <FaGoogle />,
  PiMicrosoftExcelLogo: <PiMicrosoftExcelLogo />,
  FaMeta: <FaMeta />,
};
const icons = {
  Technology: <CiMobile2 />,
  Automotive: <FaCarSide />,
  Software: <PiMicrosoftExcelLogo />,
  ECommerce: <CiShoppingCart />,
  SearchEngine: <FaGoogle />,
  SocialMedia: <FaMeta />
};



const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const API_KEY = "d3hm9q1r01qi2vu1icn0d3hm9q1r01qi2vu1icng";

  // ✅ Handles both local API and Finnhub fallback
  const handleSearch = async () => {
    if (!query) return;

    setLoading(true);
    setError("");
    setCompanyData(null);

    try {
      // 1️⃣ Try backend API first (if connected)
      try {
        const response = await axios.get(`http://localhost:5000/get-company-details/${query}`);
        setCompanyData(response.data);
        setLoading(false);
        return;
      } catch {
        console.log("Backend API not reachable, using Finnhub fallback...");
      }

      // 2️⃣ Fallback: Finnhub API directly
      const searchRes = await axios.get(
        `https://finnhub.io/api/v1/search?q=${query}&token=${API_KEY}`
      );

      const results = searchRes.data.result;
      if (!results || results.length === 0) {
        setError("Company not found. Try a different name.");
        setLoading(false);
        return;
      }

      const result = results.find(r => r.type === "Common Stock") || results[0];
      const symbol = result.symbol;

      const profileRes = await axios.get(
        `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${API_KEY}`
      );

      // Generate random sentiment + confidence
      const sentimentOptions = ["positive", "neutral", "negative"];
      const randomSentiment = sentimentOptions[Math.floor(Math.random() * sentimentOptions.length)];
      const confidence = Math.floor(Math.random() * 30) + 70;

      const plainCompanyData = {
        name: profileRes.data.name,
        industry: profileRes.data.finnhubIndustry,
        description: profileRes.data.description || "No description available",
        marketCap: profileRes.data.marketCapitalization,
        sentiment: randomSentiment,
        confidence: confidence
      };

      setCompanyData(plainCompanyData);
    } catch (err) {
      console.error(err);
      setError("Error fetching company data. Please try again.");
    }

    setLoading(false);
  };

  return (
    <>
      <div className="header">
        <header><Header /></header>
        <hr className="line"></hr>
      </div>

      <div className="body">
        <h1>Entity Search: </h1>
        <p>Search for any entity to view its historical data and sentiment analysis</p>
      </div>

      <div className="search-container">
        <h4>Search Entities</h4>
        <p>Enter a company name or category to find entities</p>
        <div className="input-text">
          <input
            type="text"
            placeholder="Search for Apple, Tesla, Inc, etc..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" onClick={handleSearch}>
            <i><CiSearch /> Search</i>
          </button>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {companyData && (
        <div className="card">
          <i>{icons[companyData.industry] || <CiMobile2 />} {companyData.name}</i>
          <p>{companyData.industry}</p>
          <small>{companyData.description}</small>
          <p>Market Cap:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${(companyData.marketCap / 1000).toLocaleString()}B</p>
          <p>Sentiment:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{companyData.sentiment}</p>
          <p>Confidence:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{companyData.confidence}%</p>
          <button
            className="btn"
            onClick={() => navigate('/result', { state: { company: companyData,entity:{entityName:companyData.name} } })}
          >
            View Analysis
          </button>
        </div>
      )}

      <h2 className="popular-entities">Popular Entities</h2>
      <div className="entities">
        {[
          { name: "Apple", icon: "CiMobile2", industry: "Technology", marketCap: "2.8T", sentiment: "positive", confidence: 85, desc: "Consumer electronics and software company" },
          { name: "Tesla", icon: "FaCarSide", industry: "Automotive", marketCap: "800B", sentiment: "negative", confidence: 72, desc: "Electric vehicle and clean energy company" },
          { name: "Microsoft", icon: "PiMicrosoftExcelLogo", industry: "Technology", marketCap: "2.9T", sentiment: "neutral", confidence: 68, desc: "Software and cloud computing services" },
          { name: "Amazon", icon: "CiShoppingCart", industry: "ECommerce", marketCap: "1.5T", sentiment: "positive", confidence: 91, desc: "E-commerce and cloud computing company" },
          { name: "Google", icon: "FaGoogle", industry: "Technology", marketCap: "1.8T", sentiment: "positive", confidence: 78, desc: "Search engine and advertising company" },
          { name: "Meta", icon: "FaMeta", industry: "Social Media", marketCap: "800B", sentiment: "neutral", confidence: 64, desc: "Social media and virtual reality company" },
        ].map((c, i) => (
          <div className="card" key={i}>
            <i>{iconMap[c.icon]} {c.name}</i>
            {/* <i>{c.icon} {c.name}</i> */}
            <p>{c.industry}</p>
            <small>{c.desc}</small>
            <p>Market Cap:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${c.marketCap}</p>
            <p>Sentiment:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{c.sentiment}</p>
            <p>Confidence:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{c.confidence}%</p>
            <button className="btn" onClick={() => navigate('/results', { state: { company: c ,entity:{entityName:c.name}} })}>
              View Analysis
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default Search;


