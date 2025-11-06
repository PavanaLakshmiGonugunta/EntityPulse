import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchCompanyData } from "./utils/fetchCompanyData.js";

import NewsAnalysis from "./analysis-components/NewsAnalysis.js";
import NewsSentimentTrend from "./analysis-components/NewsSentimentTrend.js";
import OverallSentimentDistribution from "./analysis-components/OverallSentimentDistribution.js";
import SentimentByPlatform from "./analysis-components/SentimentByPlatform.js";
import StockPerformance from "./analysis-components/StockPerformance.js";
import StockDetailsCard from "./analysis-components/StockDetailsCard.js";

import { FaDollarSign, FaUsers, FaCalendar } from "react-icons/fa";
import { MdTrendingUp } from "react-icons/md";

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [selectedDataType, setSelectedDataType] = useState("stock-performance");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load company data from navigation, session, or fetch API
  useEffect(() => {
    const navCompany = location.state?.company;
    const entity =
      location.state?.entity?.entityName || location.state?.entityName;

    async function loadCompany() {
      setLoading(true);
      try {
        // Case 1: Company passed from previous page
        if (navCompany) {
          setCompany(navCompany);
          sessionStorage.setItem("companyData", JSON.stringify(navCompany));
          setLoading(false);
          return;
        }


        // Case 2: Cached company data in sessionStorage
        const stored = sessionStorage.getItem("companyData");
        if (stored) {
          const parsed = JSON.parse(stored);
          setCompany(parsed);
          return;
        }

        // Case 3: Fetch new company data
        if (entity) {
          const data = await fetchCompanyData(entity);
          setCompany(data);
          sessionStorage.setItem("companyData", JSON.stringify(data));
          return;
        }

        // Case 4: No data found
        setError("No company data available.");
      } catch (err) {
        console.error(err);
        setError("Failed to fetch company data.");
      } finally {
        setLoading(false);
      }
    }

    loadCompany();
  }, [location.state]);

  // 🧠 Loading or error states
  if (loading) {
    return (
      <div style={{ padding: "20px" }}>
        <h3>Loading company data...</h3>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>{error || "No company selected"}</h2>
        <p>Please go back and select a company to view its analysis.</p>
        <button className="btn" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  // ✅ Main Page
  return (
    <>
      <h1>{company.name}</h1>
      <h4>
        {company.industry} — Entity-level sentiment analysis of financial data
      </h4>

      {/* Stock Info Cards */}
      <div className="details-about-stock">
        <StockDetailsCard
          title="Current Price"
          icon={<FaDollarSign size={16} color="black" />}
          bodyText={`$${company.currentPrice || "N/A"}`}
          bodyDetail="Realtime price"
        />
        <StockDetailsCard
          title="Market Cap"
          icon={<MdTrendingUp size={16} color="black" />}
          bodyText={`$${(company.marketCap / 1000).toLocaleString()}B`}
          bodyDetail="Market capitalization"
        />
        <StockDetailsCard
          title="Social Sentiment"
          icon={<FaUsers size={16} color="black" />}
          bodyText={company.sentiment || "Neutral"}
          bodyDetail={`Confidence: ${company.confidence || 0}%`}
        />
        <StockDetailsCard
          title="Last Updated"
          icon={<FaCalendar size={16} color="black" />}
          bodyText="Today"
          bodyDetail="Real-time data"
        />
      </div>

      {/* Section Buttons */}
      <div className="select-analysis-type">
        {["stock-performance", "social-sentiment", "news-analysis"].map(
          (type) => (
            <div
              key={type}
              className={`analysis-type ${
                selectedDataType === type ? "active" : ""
              }`}
              onClick={() => setSelectedDataType(type)}
            >
              {type === "stock-performance" && "Stock Performance"}
              {type === "social-sentiment" && "Social Sentiment"}
              {type === "news-analysis" && "News Analysis"}
            </div>
          )
        )}
      </div>

      {/* Conditional Rendering for Analysis */}
      {selectedDataType === "news-analysis" && (
        <div className="details-twin-components news-analysis">
          <NewsAnalysis company={company} />
          <NewsSentimentTrend company={company} />
        </div>
      )}

      {selectedDataType === "social-sentiment" && (
        <div className="details-twin-components social-sentiment">
          <OverallSentimentDistribution company={company} />
          <SentimentByPlatform company={company} />
        </div>
      )}

      {selectedDataType === "stock-performance" && (
        <div className="details-twin-components stock-performance">
          <StockPerformance company={company} />
        </div>
      )}
    </>
  );
}
