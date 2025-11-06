import React, { useState, useEffect } from 'react';
import axios from "axios";
import NewsAnalysis from './analysis-components/NewsAnalysis.jsx';
import NewsSentimentTrend from './analysis-components/NewsSentimentTrend.jsx';
import StockPerformance from './analysis-components/StockPerformance.jsx';
import StockDetailsCard from './analysis-components/StockDetailsCard.jsx';
import TradingVolumeTrends from './analysis-components/TradingVolumeTrends.jsx';
import { FaDollarSign, FaUsers, FaCalendar } from "react-icons/fa";
import { MdTrendingUp } from "react-icons/md";
import { useLocation, useNavigate } from 'react-router-dom';

export default function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Extract data passed from previous page
  const [companyData, setCompanyData] = useState(location.state?.company || null);
  const [entityName, setEntityName] = useState(
    location.state?.entity?.entityName ||
    location.state?.company?.name ||
    ""
  );

  const [selectedDataType, setSelectedDataType] = useState('stock-performance');
  const [entityDetails, setEntityDetails] = useState(null);
  const [stockPriceVolume, setStockPriceVolume] = useState(null);
  const [newsData, setNewsData] = useState({ headlines: [], trendData: [] });
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [newsError, setNewsError] = useState(null);

  // ✅ Detect navigation changes and update entity
  useEffect(() => {
    if (location.state?.company) {
      setCompanyData(location.state.company);
    }
    if (location.state?.entity?.entityName || location.state?.company?.name) {
      setEntityName(location.state?.entity?.entityName || location.state?.company?.name);
    }
  }, [location.state]);

  // ✅ Fetch company details if not already provided
  useEffect(() => {
    async function fetchCompany() {
      if (!entityName || companyData) return;
      try {
        console.log("Fetching data for entity:", entityName);
        const response = await axios.get(`http://localhost:5000/get-company-details/${entityName}`);
        setCompanyData(response.data);
      } catch (err) {
        console.error("Error fetching company data:", err);
        setErrorMessage(`Sorry, we could not find any data on ${entityName}.`);
      }
    }
    fetchCompany();
  }, [entityName]);

  // ✅ Fetch price & market cap
  useEffect(() => {
    if (!companyData?.symbol) return;
    const fetchDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/get-current-price-market-cap/${companyData.symbol}`);
        setEntityDetails(res.data);
      } catch (err) {
        console.error("Error fetching entity details:", err);
      }
    };
    fetchDetails();
  }, [companyData]);

  // ✅ Fetch stock price & volume
  useEffect(() => {
    if (!companyData?.symbol) return;
    async function fetchStock() {
      try {
        const response = await axios.get(`http://localhost:5000/stock-price-history/${companyData.symbol}`);
        setStockPriceVolume(response.data);
      } catch (err) {
        console.error("Error fetching stock data:", err);
      }
    }
    fetchStock();
  }, [companyData]);

  // ✅ Fetch news & sentiment trend
  useEffect(() => {
    if (!companyData?.symbol) return;
    async function fetchNewsData() {
      setIsLoadingNews(true);
      setNewsError(null);
      try {
        const response = await axios.get(`http://localhost:5000/news-analysis`, {
          params: {
            symbol: companyData.symbol,
            companyName: companyData.name
          }
        });
        setNewsData(response.data);
      } catch (err) {
        console.error("Error fetching news data:", err);
        setNewsError("Couldn't load news sentiment right now.");
      } finally {
        setIsLoadingNews(false);
      }
    }
    fetchNewsData();
  }, [companyData]);

  // ✅ Handle error or missing data
  if (errorMessage) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem', color: 'red' }}>
        {errorMessage}
        <br />
        <button className="btn" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (!companyData) {
    return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading company data...</div>;
  }

  // ✅ Render UI
  return (
    <>
      <div className="details-about-stock">
        <StockDetailsCard
          title="Current Price"
          icon={<FaDollarSign size={16} color='black' />}
          bodyText={entityDetails?.currentPrice || "N/A"}
        />
        <StockDetailsCard
          title="Market Cap"
          icon={<MdTrendingUp size={16} color='black' />}
          bodyText={entityDetails?.marketCap || "N/A"}
        />
        <StockDetailsCard
          title="Social Sentiment"
          icon={<FaUsers size={16} color='black' />}
          bodyText="58%"
        />
        <StockDetailsCard
          title="Last Updated"
          icon={<FaCalendar size={16} color='black' />}
          bodyText="Today"
          bodyDetail="Real-time data"
        />
      </div>

      {/* Selection buttons */}
      <div className="select-analysis-type">
        {['stock-performance', 'trading-volume', 'news-analysis'].map((type) => (
          <div
            key={type}
            className={`analysis-type ${selectedDataType === type ? 'active' : ''}`}
            onClick={() => setSelectedDataType(type)}
          >
            {type === 'stock-performance' && 'Stock Performance'}
            {type === 'trading-volume' && 'Trading Volume'}
            {type === 'news-analysis' && 'News Analysis'}
          </div>
        ))}
      </div>

      {/* Conditional rendering */}
      {selectedDataType === 'news-analysis' && (
        <div className='details-twin-components news-analysis'>
          <NewsAnalysis
            headlines={newsData.headlines}
            symbol={companyData.symbol}
            isLoading={isLoadingNews}
            error={newsError}
          />
          {newsData.trendData?.length > 0 && (
            <NewsSentimentTrend trendData={newsData.trendData} />
          )}
        </div>
      )}

      {selectedDataType === 'trading-volume' && (
        <div className='details-twin-components trading-volume'>
          <TradingVolumeTrends volumeData={stockPriceVolume} />
        </div>
      )}

      {selectedDataType === 'stock-performance' && (
        <div className='details-twin-components stock-performance' style={{ flexDirection: "column" }}>
          <StockPerformance stockData={stockPriceVolume} />
        </div>
      )}
    </>
  );
}
