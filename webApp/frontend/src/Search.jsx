import React, { useState } from "react";
import axios from "axios";
import Header from "./Header.jsx";
import { useNavigate } from "react-router-dom";
import './App.css'

// Icons
import { CiMobile2, CiSearch, CiShoppingCart } from "react-icons/ci";
import { FaCarSide, FaGoogle } from "react-icons/fa";
import { FaMeta } from "react-icons/fa6";
import { PiMicrosoftExcelLogo } from "react-icons/pi";

const icons = {
  Technology: <CiMobile2 />,
  Automotive: <FaCarSide />,
  Software: <PiMicrosoftExcelLogo />,
  ECommerce: <CiShoppingCart />,
  SearchEngine: <FaGoogle />,
  SocialMedia: <FaMeta />,
};

// Curated popular entities (use real symbols so ResultsPage can fetch immediately)
const popularEntities = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    industry: "Technology",
    description: "Consumer electronics and software company",
    marketCapDisplay: "2.8T",
    sentiment: "positive",
    confidence: 85,
    iconKey: "Technology",
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    industry: "Automotive",
    description: "Electric vehicle and clean energy company",
    marketCapDisplay: "800B",
    sentiment: "negative",
    confidence: 72,
    iconKey: "Automotive",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    industry: "Technology",
    description: "Software and cloud computing services",
    marketCapDisplay: "2.9T",
    sentiment: "neutral",
    confidence: 68,
    iconKey: "Software",
  },
  {
    symbol: "AMZN",
    name: "Amazon.com, Inc.",
    industry: "ECommerce",
    description: "E-commerce and cloud computing company",
    marketCapDisplay: "1.5T",
    sentiment: "positive",
    confidence: 91,
    iconKey: "ECommerce",
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc. (Google)",
    industry: "SearchEngine",
    description: "Search engine and advertising company",
    marketCapDisplay: "1.8T",
    sentiment: "positive",
    confidence: 78,
    iconKey: "SearchEngine",
  },
  {
    symbol: "META",
    name: "Meta Platforms, Inc.",
    industry: "SocialMedia",
    description: "Social media and virtual/AR experiences",
    marketCapDisplay: "800B",
    sentiment: "neutral",
    confidence: 64,
    iconKey: "SocialMedia",
  },
];

const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    setCompanyData(null);

    try {
      // Your backend should accept either a symbol or a name
      const response = await axios.get(
        `http://localhost:5000/get-company-details/${encodeURIComponent(trimmed)}`
      );
      const data = response.data;

      setCompanyData(data);

      // Navigate with the minimal, reliable payload
      const symbol = data?.symbol || data?.ticker || trimmed;
      const name = data?.name || data?.companyName || trimmed;

    } catch (err) {
      console.error("Error fetching company data:", err);
      setError("Error fetching company data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const goToResult = (symbol, name) => {
    navigate("/result", { state: { company: { symbol, name } } });
  };

  return (
    <>
      <div className="header">
        <header>
          <Header />
        </header>
        <hr className="line" />
      </div>

      <div className="body">
        <h1>Entity Search:</h1>
        <p>Search for any entity to view its historical data and sentiment analysis</p>
      </div>

      <div className="search-container">
        <h4>Search Entities</h4>
        <p>Enter a company name or symbol to find entities</p>
        <div className="input-text">
          <input
            type="text"
            placeholder="Search for Apple, TSLA, Microsoft, etc..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleEnter}
          />
          <button type="submit" onClick={handleSearch}>
            <i>
              <CiSearch /> Search
            </i>
          </button>
        </div>
      </div>

      {loading && <div className="loading">Loading...</div>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {companyData && (
        <div className="card">
          <i>
            {icons[companyData?.industry] || <CiMobile2 />} {companyData?.name || companyData?.symbol}
          </i>
          <p>{companyData?.industry || "—"}</p>
          <small>{companyData?.description || "No description available"}</small>
          {companyData?.marketCap && (
            <p>
              Market Cap:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$
              {(Number(companyData.marketCap) / 1000).toLocaleString()}
              B
            </p>
          )}
          {companyData?.sentiment && (
            <p>Sentiment:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{companyData.sentiment}</p>
          )}
          {companyData?.confidence && (
            <p>Confidence:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{companyData.confidence}%</p>
          )}
          <button
            className="btn"
            onClick={() =>
              goToResult(
                companyData?.symbol || companyData?.ticker || query.trim(),
                companyData?.name || companyData?.companyName || query.trim()
              )
            }
          >
            View Analysis
          </button>
        </div>
      )}

      <h2 className="popular-entities">Popular Entities</h2>
      <div className="entities">
        {popularEntities.map((c) => (
          <div className="card" key={c.symbol}>
            <i>
              {icons[c.industry] || <CiMobile2 />} {c.name}
            </i>
            <p>{c.industry}</p>
            <small>{c.description}</small>
            <p>Market Cap:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${c.marketCapDisplay}</p>
            <p>Sentiment:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{c.sentiment}</p>
            <p>Confidence:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{c.confidence}%</p>
            <button className="btn" onClick={() => goToResult(c.symbol, c.name)}>
              View Analysis
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default Search;
