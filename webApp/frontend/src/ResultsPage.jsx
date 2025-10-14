import React, {useState, useEffect} from 'react';
import axios from "axios";
import NewsAnalysis from './analysis-components/NewsAnalysis.jsx';
import NewsSentimentTrend from './analysis-components/NewsSentimentTrend.jsx';
import OverallSentimentDistribution from './analysis-components/OverallSentimentDistribution.jsx';
import SentimentByPlatform from './analysis-components/SentimentByPlatform.jsx';
import StockPerformance from './analysis-components/StockPerformance.jsx'
import StockDetailsCard from './analysis-components/StockDetailsCard.jsx';

// money / $ icons
<<<<<<< HEAD
import { FaDollarSign } from "react-icons/fa";     // FontAwesome
=======
import { FaDollarSign } from "react-icons/fa";    
>>>>>>> 22908ed05e857632b50adf1d3cb38377a1538e6d

// increase / up arrow icons
import { MdTrendingUp } from "react-icons/md";

// people / users icons
import { FaUsers } from "react-icons/fa";

// calendar icons
import { FaCalendar } from "react-icons/fa";

export default function ResultsPage() {
  const [selectedDataType, setSelectedDataType]= useState('stock-performance'); // default
  
  const [entityDetails, setEntityDetails] = useState(null);
  useEffect(()=>{
    const fetchData = async ()=>{
      try{
<<<<<<< HEAD
        const res = axios.get(`http://localhost:5000/get-current-price-market-cap/AAPL`);
=======
        const res = await axios.get(`http://localhost:5000/get-current-price-market-cap/AAPL`);
>>>>>>> 22908ed05e857632b50adf1d3cb38377a1538e6d
        setEntityDetails(res);
        console.log("fetched data successfully!");
        console.log(res.data)
        console.log(entityDetails)
      }catch(e){
        console.error("There was error fetching stock data: ", e);
      };
    }
    fetchData();
  }, [])
  
  return (
    <>
    <h1>Entity Pulse</h1>
    <h4>Entity level sentiment analysis of Financial Data</h4>
<<<<<<< HEAD
    <div class="details-about-stock">
      <StockDetailsCard
=======
    <div className="details-about-stock">
      {/* <StockDetailsCard
>>>>>>> 22908ed05e857632b50adf1d3cb38377a1538e6d
        title="Current Price"
        icon = {<FaDollarSign size={16} color='black'/>}
        bodyText = {entityDetails?.currentPrice}
        bodyDetail = "+2.04% from last month"
<<<<<<< HEAD
=======
      /> */}
       <StockDetailsCard
        title="Current Price"
        icon={<FaDollarSign size={16} color='black' />}
        bodyText={entityDetails?.currentPrice}
        bodyDetail="+2.04% from last month"
>>>>>>> 22908ed05e857632b50adf1d3cb38377a1538e6d
      />
      <StockDetailsCard
        title="Market Cap"
        icon = {<MdTrendingUp size={16} color='black'/>}
        bodyText = {entityDetails?.marketCap}
        bodyDetail = "+2.3% from last quarter"
      />
      <StockDetailsCard
        title="Social Sentiment"
        icon = {<FaUsers size={16} color='black' />}
        bodyText = "58%"
        bodyDetail = "Positive sentiment"
      />
      <StockDetailsCard
        title="Last Updated"
        icon = {<FaCalendar size={16} color='black'/>}
        bodyText = "Today"
        bodyDetail = "Real-time data"
      />
    </div>
    {/*selection buttons*/}
<<<<<<< HEAD
    <div class="select-analysis-type">
      <div 
        class={`analysis-type ${selectedDataType == 'stock-performance' ? 'active' : ''}`}
        onClick = {() => setSelectedDataType('stock-performance')}
      >Stock performance</div>
      <div class={`analysis-type ${selectedDataType == 'social-sentiment' ? 'active' : ''}`}
        onClick = {() => setSelectedDataType('social-sentiment')}
      >Social Sentiment</div>
      <div class={`analysis-type ${selectedDataType == 'news-analysis' ? 'active' : ''}`}
=======
    <div className="select-analysis-type">
      <div 
        className={`analysis-type ${selectedDataType == 'stock-performance' ? 'active' : ''}`}
        onClick = {() => setSelectedDataType('stock-performance')}
      >Stock performance</div>
      <div className={`analysis-type ${selectedDataType == 'social-sentiment' ? 'active' : ''}`}
        onClick = {() => setSelectedDataType('social-sentiment')}
      >Social Sentiment</div>
      <div className={`analysis-type ${selectedDataType == 'news-analysis' ? 'active' : ''}`}
>>>>>>> 22908ed05e857632b50adf1d3cb38377a1538e6d
        onClick = {() => setSelectedDataType('news-analysis')}
      >News Analysis</div>
    </div>
    {/*conditionally render components */}
    {selectedDataType ==='news-analysis' && (
<<<<<<< HEAD
      <div class='details-twin-components news-analysis'>
=======
      <div className='details-twin-components news-analysis'>
>>>>>>> 22908ed05e857632b50adf1d3cb38377a1538e6d
        <NewsAnalysis/>
        <NewsSentimentTrend/>
      </div>
    )}
    {selectedDataType ==='social-sentiment' && (
<<<<<<< HEAD
      <div class='details-twin-components social-sentiment'>
=======
      <div className='details-twin-components social-sentiment'>
>>>>>>> 22908ed05e857632b50adf1d3cb38377a1538e6d
        <OverallSentimentDistribution/>
        <SentimentByPlatform/>
      </div>
    )}
    {selectedDataType === 'stock-performance' && (
<<<<<<< HEAD
      <div class='details-twin-components stock-performance'>
=======
      <div className='details-twin-components stock-performance'>
>>>>>>> 22908ed05e857632b50adf1d3cb38377a1538e6d
        <StockPerformance/>
      </div>
    )}
    </>
  );
}
<<<<<<< HEAD
=======



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

>>>>>>> 22908ed05e857632b50adf1d3cb38377a1538e6d
