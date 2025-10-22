// import React, {useState} from 'react';
// import NewsAnalysis from './analysis-components/NewsAnalysis.js';
// import NewsSentimentTrend from './analysis-components/NewsSentimentTrend.js';
// import OverallSentimentDistribution from './analysis-components/OverallSentimentDistribution.js';
// import SentimentByPlatform from './analysis-components/SentimentByPlatform.js';
// import StockPerformance from './analysis-components/StockPerformance.js'
// import StockDetailsCard from './analysis-components/StockDetailsCard.js';
// import { useLocation } from 'react-router-dom';


// // money / $ icons
// import { FaDollarSign } from "react-icons/fa";     // FontAwesome

// // increase / up arrow icons
// import { MdTrendingUp } from "react-icons/md";

// // people / users icons
// import { FaUsers } from "react-icons/fa";

// // calendar icons
// import { FaCalendar } from "react-icons/fa";

// export default function ResultsPage() {
//   const [selectedDataType, setSelectedDataType]= useState('stock-performance'); // default
//   const location = useLocation();
//   const company = location.state?.company;

//   if (!company) {
//     return <p>No company selected. Go back and select a company.</p>;
//   }

//   return (
//     <>
//     <h1>Entity Pulse</h1>
//     <h4>Entity level sentiment analysis of Financial Data</h4>
//     <div class="details-about-stock">
//       <StockDetailsCard
//         title="Current Price"
//         icon = {<FaDollarSign size={16} color='black'/>}
//         bodyText = "$182.25"
//         bodyDetail = "+2.04% from last month"
//       />
//       <StockDetailsCard
//         title="Market Cap"
//         icon = {<MdTrendingUp size={16} color='black'/>}
//         bodyText = "$2.8T"
//         bodyDetail = "+2.3% from last quarter"
//       />
//       <StockDetailsCard
//         title="Social Sentiment"
//         icon = {<FaUsers size={16} color='black' />}
//         bodyText = "58%"
//         bodyDetail = "Positive sentiment"
//       />
//       <StockDetailsCard
//         title="Last Updated"
//         icon = {<FaCalendar size={16} color='black'/>}
//         bodyText = "Today"
//         bodyDetail = "Real-time data"
//       />
//     </div>
//     {/*selection buttons*/}
//     <div class="select-analysis-type">
//       <div 
//         class={`analysis-type ${selectedDataType == 'stock-performance' ? 'active' : ''}`}
//         onClick = {() => setSelectedDataType('stock-performance')}
//       >Stock performance</div>
//       <div class={`analysis-type ${selectedDataType == 'social-sentiment' ? 'active' : ''}`}
//         onClick = {() => setSelectedDataType('social-sentiment')}
//       >Social Sentiment</div>
//       <div class={`analysis-type ${selectedDataType == 'news-analysis' ? 'active' : ''}`}
//         onClick = {() => setSelectedDataType('news-analysis')}
//       >News Analysis</div>
//     </div>
//     {/*conditionally render components */}
//     {selectedDataType ==='news-analysis' && (
//       <div class='details-twin-components news-analysis'>
//         <NewsAnalysis/>
//         <NewsSentimentTrend/>
//       </div>
//     )}
//     {selectedDataType ==='social-sentiment' && (
//       <div class='details-twin-components social-sentiment'>
//         <OverallSentimentDistribution/>
//         <SentimentByPlatform/>
//       </div>
//     )}
//     {selectedDataType === 'stock-performance' && (
//       <div class='details-twin-components stock-performance'>
//         <StockPerformance/>
//       </div>
//     )}
//     </>
//   );
// }


import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NewsAnalysis from './analysis-components/NewsAnalysis.js';
import NewsSentimentTrend from './analysis-components/NewsSentimentTrend.js';
import OverallSentimentDistribution from './analysis-components/OverallSentimentDistribution.js';
import SentimentByPlatform from './analysis-components/SentimentByPlatform.js';
import StockPerformance from './analysis-components/StockPerformance.js';
import StockDetailsCard from './analysis-components/StockDetailsCard.js';

// icons
import { FaDollarSign, FaUsers } from "react-icons/fa";
import { MdTrendingUp } from "react-icons/md";
import { FaCalendar } from "react-icons/fa";

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const company = location.state?.company;

  const [selectedDataType, setSelectedDataType] = useState('stock-performance');

  // If no company data, show message and a back button
  if (!company) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>No company selected</h2>
        <p>Please go back and select a company to view its analysis.</p>
        <button className="btn" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <>
      <h1>{company.name}</h1>
      <h4>{company.industry} — Entity level sentiment analysis of financial data</h4>

      {/* Stock details cards */}
      <div className="details-about-stock">
        <StockDetailsCard
          title="Current Price"
          icon={<FaDollarSign size={16} color='black' />}
          bodyText={`$${company.currentPrice || "N/A"}`}
          bodyDetail="Realtime price" // optional
        />
        <StockDetailsCard
          title="Market Cap"
          icon={<MdTrendingUp size={16} color='black' />}
          bodyText={`$${(company.marketCap / 1000).toLocaleString()}B`}
          bodyDetail="Market capitalization"
        />
        <StockDetailsCard
          title="Social Sentiment"
          icon={<FaUsers size={16} color='black' />}
          bodyText={`${company.sentiment}`}
          bodyDetail={`Confidence: ${company.confidence}%`}
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
        <div
          className={`analysis-type ${selectedDataType === 'stock-performance' ? 'active' : ''}`}
          onClick={() => setSelectedDataType('stock-performance')}
        >
          Stock Performance
        </div>
        <div
          className={`analysis-type ${selectedDataType === 'social-sentiment' ? 'active' : ''}`}
          onClick={() => setSelectedDataType('social-sentiment')}
        >
          Social Sentiment
        </div>
        <div
          className={`analysis-type ${selectedDataType === 'news-analysis' ? 'active' : ''}`}
          onClick={() => setSelectedDataType('news-analysis')}
        >
          News Analysis
        </div>
      </div>

      {/* Conditionally render components */}
      {selectedDataType === 'news-analysis' && (
        <div className='details-twin-components news-analysis'>
          <NewsAnalysis company={company} />
          <NewsSentimentTrend company={company} />
        </div>
      )}
      {selectedDataType === 'social-sentiment' && (
        <div className='details-twin-components social-sentiment'>
          <OverallSentimentDistribution company={company} />
          <SentimentByPlatform company={company} />
        </div>
      )}
      {selectedDataType === 'stock-performance' && (
        <div className='details-twin-components stock-performance'>
          <StockPerformance company={company} />
        </div>
      )}
    </>
  );
}
