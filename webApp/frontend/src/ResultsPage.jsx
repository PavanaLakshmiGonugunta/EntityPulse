import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "./Header.jsx";
import NewsAnalysis from "./analysis-components/NewsAnalysis.jsx";
import StockPerformance from "./analysis-components/StockPerformance.jsx";
import StockDetailsCard from "./analysis-components/StockDetailsCard.jsx";
import TradingVolumeTrends from "./analysis-components/TradingVolumeTrends.jsx";
import { FaDollarSign, FaUsers, FaCalendar } from "react-icons/fa";
import { MdTrendingUp } from "react-icons/md";
import { useLocation } from "react-router-dom";

export default function ResultsPage() {
  const [selectedDataType, setSelectedDataType] = useState("stock-performance");
  const location = useLocation();

  // Accepts: { company } OR { entity } (entity can be string or {entityName})
  const initialCompany = location.state?.company ?? null;
  const rawEntity = location.state?.entity;

  // If entity is a string, use it directly; if object, use its entityName
  const entityFromAnalysis =
    typeof rawEntity === "string" ? rawEntity : rawEntity?.entityName;

  const [companyData, setCompanyData] = useState(initialCompany);
  const [entityDetails, setEntityDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [newsData, setNewsData] = useState({ headlines: [], trendData: [] });
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [newsError, setNewsError] = useState(null);
  const [stockPriceVolume, setStockPriceVolume] = useState(null);

  // Decide the lookup key we’ll use to fetch if companyData isn't present
  const entityName =
    entityFromAnalysis ||
    companyData?.symbol ||
    companyData?.name || // last resort if your backend accepts names
    null;

  // Fetch company details only if we DON'T already have companyData
  useEffect(() => {
    const handleSearch = async () => {
      if (!entityName || companyData) return;
      try {
        const response = await axios.get(
          `http://localhost:5000/get-company-details/${entityName}`
        );
        setCompanyData(response.data);
      } catch (err) {
        console.error("Error fetching company data:", err);
        setErrorMessage(`Sorry, we could not find any data on ${entityName}.`);
      }
    };
    handleSearch();
    // include companyData so we don't refetch once it's filled
  }, [entityName, companyData]);

  // current price & market cap
  useEffect(() => {
    if (!companyData?.symbol) return;
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/get-current-price-market-cap/${companyData.symbol}`
        );
        setEntityDetails(res.data);
      } catch (e) {
        console.error("There was error fetching stock data: ", e);
      }
    };
    fetchData();
  }, [companyData?.symbol]);

  // stock price history & volume
  useEffect(() => {
    if (!companyData?.symbol) return;
    async function getStockPriceVolume() {
      try {
        const response = await axios.get(
          `http://localhost:5000/stock-price-history/${companyData.symbol}`
        );
        setStockPriceVolume(response.data);
        console.log("stock data: ", stockPriceVolume)
      } catch (err) {
        console.error("error fetching stock price and volumes, ", err);
      }
    }
    getStockPriceVolume();
  }, [companyData?.symbol]);

  // news data
  useEffect(() => {
    if (!companyData?.symbol) return;
    const controller = new AbortController();

    async function fetchNewsData() {
      setIsLoadingNews(true);
      setNewsError(null);
      setNewsData({ headlines: [], trendData: [] });

      try {
        const res = await axios.get(`http://localhost:5000/news-analysis`, {
          params: { symbol: companyData.symbol, companyName: companyData.name },
          timeout: 15000,          // <-- client timeout
          signal: controller.signal // <-- abortable
        });
        setNewsData(res.data);
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log("News request cancelled");
        } else {
          console.error("Error fetching news data: ", err?.message);
          setNewsError("Couldn't load news sentiment right now.");
        }
      } finally {
        setIsLoadingNews(false);
      }
    }

    fetchNewsData();
    return () => controller.abort();
  }, [companyData?.symbol, companyData?.name]);


  if (errorMessage) {
    return (
      <>
        <Header />
        <main className="page">
          <div style={{ textAlign: "center", marginTop: "2rem", color: "red" }}>
            {errorMessage}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header /> {/* ← header at top */}
      <main className="page">
        <div className="details-about-stock">
          <StockDetailsCard
            title="Current Price"
            icon={<FaDollarSign size={16} color="black" />}
            bodyText={entityDetails?.currentPrice}
          />
          <StockDetailsCard
            title="Market Cap"
            icon={<MdTrendingUp size={16} color="black" />}
            bodyText={entityDetails?.marketCap}
          />
          {/* <StockDetailsCard
            title="Social Sentiment"
            icon={<FaUsers size={16} color="black" />}
            bodyText="58%"
          /> */}
          <StockDetailsCard
            title="Last Updated"
            icon={<FaCalendar size={16} color="black" />}
            bodyText="Today"
            bodyDetail="Real-time data"
          />
        </div>

        <div className="select-analysis-type">
          <div
            className={`analysis-type ${selectedDataType === "stock-performance" ? "active" : ""}`}
            onClick={() => setSelectedDataType("stock-performance")}
          >
            Stock performance
          </div>
          <div
            className={`analysis-type ${selectedDataType === "trading-volume" ? "active" : ""}`}
            onClick={() => setSelectedDataType("trading-volume")}
          >
            Trading Volume
          </div>
          <div
            className={`analysis-type ${selectedDataType === "news-analysis" ? "active" : ""}`}
            onClick={() => setSelectedDataType("news-analysis")}
          >
            News Analysis
          </div>
        </div>

        {selectedDataType === "news-analysis" && (
          <div className="details-twin-components news-analysis">
            <NewsAnalysis
              headlines={newsData.headlines}
              symbol={companyData?.symbol}
              isLoading={isLoadingNews}
              error={newsError}
            />
            {/* <NewsSentimentTrend trendData={newsData.trendData}/> */}
          </div>
        )}

        {selectedDataType === "trading-volume" && (
          <div className="details-twin-components trading-volume">
            <TradingVolumeTrends volumeData={stockPriceVolume} />
          </div>
        )}

        {selectedDataType === "stock-performance" && (
          <div className="details-twin-components stock-performance" style={{ flexDirection: "column" }}>
            <StockPerformance stockData={stockPriceVolume} />
          </div>
        )}
      </main>
    </>
  );
}
