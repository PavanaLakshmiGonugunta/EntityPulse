import React, {useState, useEffect} from 'react';
import axios from "axios";
import NewsAnalysis from './analysis-components/NewsAnalysis.jsx';
import NewsSentimentTrend from './analysis-components/NewsSentimentTrend.jsx';
import OverallSentimentDistribution from './analysis-components/OverallSentimentDistribution.jsx';
import SentimentByPlatform from './analysis-components/SentimentByPlatform.jsx';
import StockPerformance from './analysis-components/StockPerformance.jsx'
import StockDetailsCard from './analysis-components/StockDetailsCard.jsx';
import TradingVolumeTrends from './analysis-components/TradingVolumeTrends.jsx';
import { fetchCompanyData } from './utils/fetchCompanyData.js';

// money / $ icons
import { FaDollarSign } from "react-icons/fa";    

// increase / up arrow icons
import { MdTrendingUp } from "react-icons/md";

// people / users icons
import { FaUsers } from "react-icons/fa";

// calendar icons
import { FaCalendar } from "react-icons/fa";
import { useLocation } from 'react-router-dom';

export default function ResultsPage() {
  const [selectedDataType, setSelectedDataType]= useState('stock-performance'); // default
  const location = useLocation();
  const [companyData, setCompanyData] = useState(location.state?.company);
  const entityName = location.state?.entity.entityName
  const [entityDetails, setEntityDetails] = useState(null);

  useEffect(() => {
    if(!companyData){
      const handleSearch = async () => {
            if (!entityName){
              console.log("No entity!")
              return;
            }
            console.log("entity name: ", entityName.toLowerCase())
    
            setCompanyData(null);
    
            try {
              const response = await axios.get(`http://localhost:5000/get-company-details/${entityName}`);
              setCompanyData(response.data);
            } catch (err) {
              console.log("Error fetching company data. Please try again.");
            }
    
          };
      handleSearch();
    }
  }, [entityName])
  // fetch current price and market capital
  useEffect(()=>{
    if(companyData?.symbol){
      console.log(companyData.symbol);
      const fetchData = async ()=>{
        try{
          const res = await axios.get(`http://localhost:5000/get-current-price-market-cap/${companyData.symbol}`);
          setEntityDetails(res);
          console.log("fetched data successfully!");
          console.log(res.data)
          setEntityDetails(res.data);
        }catch(e){
          console.error("There was error fetching stock data: ", e);
        };
      }
      fetchData();
    }
  }, [companyData])

  // useEffect(() => {
  //   if (!companyData?.symbol) return; // 🧠 skip until companyData is available

  //   const fetchData = async () => {
  //     try {
  //       const res = await axios.get(
  //         `http://localhost:5000/get-current-price-market-cap/${companyData.symbol}`
  //       );
  //       console.log("Fetched price and market cap:", res.data);
  //       setEntityDetails(res.data);
  //     } catch (e) {
  //       console.error("Error fetching stock data:", e);
  //     }
  //   };
  //   fetchData();
  // }, [companyData]);

  
  // fetch news data
  const [newsData, setNewsData] = useState([]);
  useEffect(()=>{
      async function getNews(){
          try{
              const res = await axios.get(`http://localhost:5000/news-analysis/${companyData.symbol}`)
              console.log("result ", res)
              setNewsData(res.data);
              console.log("result from api: ", res);
          }
          catch(e){
              console.error(e);
          }
      }
      getNews();
  }, [companyData])
  // useEffect(() => {
  //   if (!companyData?.symbol) return;

  //   const getNews = async () => {
  //     try {
  //       const res = await axios.get(
  //         `http://localhost:5000/news-analysis/${companyData.symbol}`
  //       );
  //       setNewsData(res.data);
  //     } catch (e) {
  //       console.error("Error fetching news:", e);
  //     }
  //   };
  //   getNews();
  // }, [companyData]);

  
  // fetch stock price history and volume
  const [stockPriceVolume, setStockPriceVolume] = useState(null);
  useEffect(() => {
    async function getStockPriceVolume(){
      try{
        const response = await axios.get(`http://localhost:5000/stock-price-history/${companyData.symbol}`)
        console.log("stock data ",response.data)
        setStockPriceVolume(response.data);
      }
      catch(err){
        console.error("error fetching stock price and volumes, ",err);
      }
    }
    getStockPriceVolume();
  }, [companyData])
  // useEffect(() => {
  //   if (!companyData?.symbol) return;

  //   const getStockPriceVolume = async () => {
  //     try {
  //       const response = await axios.get(
  //         `http://localhost:5000/stock-price-history/${companyData.symbol}`
  //       );
  //       setStockPriceVolume(response.data);
  //     } catch (err) {
  //       console.error("Error fetching stock price and volume:", err);
  //     }
  //   };
  //   getStockPriceVolume();
  // }, [companyData]);


  return (
    <>
    {/* <div className="header">
      <span className="back">← Back</span>
      <h2>Entity Details</h2>
    </div> */}
    <div className="details-about-stock">
      <StockDetailsCard
        title="Current Price"
        icon={<FaDollarSign size={16} color='black' />}
        bodyText={entityDetails?.currentPrice}
        // bodyDetail="+2.04% from last month"
      />
      <StockDetailsCard
        title="Market Cap"
        icon = {<MdTrendingUp size={16} color='black'/>}
        bodyText = {entityDetails?.marketCap}
        // bodyDetail = "+2.3% from last quarter"
      />
      <StockDetailsCard
        title="Social Sentiment"
        icon = {<FaUsers size={16} color='black' />}
        bodyText = "58%"
        // bodyDetail = "Positive sentiment"
      />
      <StockDetailsCard
        title="Last Updated"
        icon = {<FaCalendar size={16} color='black'/>}
        bodyText = "Today"
        bodyDetail = "Real-time data"
      />
    </div>
    {/*selection buttons*/}
    <div className="select-analysis-type">
      <div 
        className={`analysis-type ${selectedDataType == 'stock-performance' ? 'active' : ''}`}
        onClick = {() => setSelectedDataType('stock-performance')}
      >Stock performance</div>
      <div className={`analysis-type ${selectedDataType == 'social-sentiment' ? 'active' : ''}`}
        onClick = {() => setSelectedDataType('social-sentiment')}
      >Social Sentiment</div>
      <div className={`analysis-type ${selectedDataType == 'news-analysis' ? 'active' : ''}`}
        onClick = {() => setSelectedDataType('news-analysis')}
      >News Analysis</div>
    </div>
    {/*conditionally render components */}
    {selectedDataType ==='news-analysis' && (
      <div className='details-twin-components news-analysis'>
        <NewsAnalysis headlines = {newsData.headlines} symbol = {companyData.symbol}/>
        <NewsSentimentTrend trendData = {newsData.trendData}/>
      </div>
    )}
    {selectedDataType ==='social-sentiment' && (
      <div className='details-twin-components social-sentiment'>
        <OverallSentimentDistribution/>
        <SentimentByPlatform/>
      </div>
    )}
    {selectedDataType === 'stock-performance' && (
      <div className='details-twin-components stock-performance' style={{'flexDirection': "column"}}>
        <StockPerformance stockData = {stockPriceVolume}/>
        <TradingVolumeTrends volumeData = {stockPriceVolume}/>
      </div>
    )}
    </>
  );
}



// import React from "react";
// import { useLocation } from "react-router-dom";
// import { CiMobile2, CiShoppingCart } from "react-icons/ci";
// import { FaCarSide, FaGoogle, FaFacebook } from "react-icons/fa";
// import { PiMicrosoftExcelLogo } from "react-icons/pi";

// const icons = {
//   Technology: <CiMobile2 />,
//   Automotive: <FaCarSide />,
//   Software: <PiMicrosoftExcelLogo />,
//   ECommerce: <CiShoppingCart />,
//   SearchEngine: <FaGoogle />,
//   SocialMedia: <FaFacebook />
// };

// export default function ResultsPage() {
//   const location = useLocation();
//   const company = location.state?.company;

//   if (!company) return <p>No company selected</p>;

//   return (
//     <div>
//       <h1>Results for {company.name}</h1>
//       <div>
//         <i>{icons[company.industry] || <CiMobile2 />} {company.name}</i>
//         <p>Industry: {company.industry}</p>
//         <p>Description: {company.description}</p>
//         <p>Market Cap: ${company.marketCap}B</p>
//         <p>Sentiment: {company.sentiment}</p>
//         <p>Confidence: {company.confidence}%</p>
//       </div>
//     </div>
//   );
// }

