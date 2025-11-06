import React from "react";
import NewsElement from "./NewsElement.jsx";

function NewsAnalysis({ headlines = [], symbol = "the company" }) {
  return (
    <div className="component-div">
      <h5 id="component-title">Recent News Headlines</h5>
      <p style={{ color: "grey" }}>
        Latest news affecting {symbol}
      </p>
      {headlines.length > 0 ? (
        headlines.map((news, index) => (
          <NewsElement
            key={index}
            headline={news.headline}
            sentiment={news.sentiment}
            source={news.source}
            url={news.url}
          />
        ))
      ) : (
        <p>No news data available right now.</p>
      )}
    </div>
  );
}

export default NewsAnalysis;
