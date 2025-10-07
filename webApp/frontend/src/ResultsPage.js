import React, {useState} from 'react';
import NewsAnalysis from './analysis-components/NewsAnalysis.js';
import NewsSentimentTrend from './analysis-components/NewsSentimentTrend.js';
import OverallSentimentDistribution from './analysis-components/OverallSentimentDistribution.js';
import SentimentByPlatform from './analysis-components/SentimentByPlatform.js';
import StockPerformance from './analysis-components/StockPerformance.js'
import StockDetailsCard from './analysis-components/StockDetailsCard.js';

// money / $ icons
import { FaDollarSign } from "react-icons/fa";     // FontAwesome

// increase / up arrow icons
import { MdTrendingUp } from "react-icons/md";

// people / users icons
import { FaUsers } from "react-icons/fa";

// calendar icons
import { FaCalendar } from "react-icons/fa";

export default function ResultsPage() {
  const [selectedDataType, setSelectedDataType]= useState('stock-performance'); // default
  return (
    <>
    <h1>Entity Pulse</h1>
    <h4>Entity level sentiment analysis of Financial Data</h4>
    <div class="details-about-stock">
      <StockDetailsCard
        title="Current Price"
        icon = {<FaDollarSign size={16} color='black'/>}
        bodyText = "$182.25"
        bodyDetail = "+2.04% from last month"
      />
      <StockDetailsCard
        title="Market Cap"
        icon = {<MdTrendingUp size={16} color='black'/>}
        bodyText = "$2.8T"
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
    <div class="select-analysis-type">
      <div 
        class={`analysis-type ${selectedDataType == 'stock-performance' ? 'active' : ''}`}
        onClick = {() => setSelectedDataType('stock-performance')}
      >Stock performance</div>
      <div class={`analysis-type ${selectedDataType == 'social-sentiment' ? 'active' : ''}`}
        onClick = {() => setSelectedDataType('social-sentiment')}
      >Social Sentiment</div>
      <div class={`analysis-type ${selectedDataType == 'news-analysis' ? 'active' : ''}`}
        onClick = {() => setSelectedDataType('news-analysis')}
      >News Analysis</div>
    </div>
    {/*conditionally render components */}
    {selectedDataType ==='news-analysis' && (
      <div class='details-twin-components news-analysis'>
        <NewsAnalysis/>
        <NewsSentimentTrend/>
      </div>
    )}
    {selectedDataType ==='social-sentiment' && (
      <div class='details-twin-components social-sentiment'>
        <OverallSentimentDistribution/>
        <SentimentByPlatform/>
      </div>
    )}
    {selectedDataType === 'stock-performance' && (
      <div class='details-twin-components stock-performance'>
        <StockPerformance/>
      </div>
    )}
    </>
  );
}
