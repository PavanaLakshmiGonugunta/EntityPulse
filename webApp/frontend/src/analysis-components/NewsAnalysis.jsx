import React from "react";
import NewsElement from "./NewsElement.jsx";

function NewsAnalysis({ headlines = [], symbol, isLoading, error }) {
    if (isLoading) {
        return (
        <div className="component-div">
            <h5 id="component-title">Recent News Headlines</h5>
            <p style={{ color: "grey" }}>
            Analyzing the latest news for {symbol || "the selected entity"}…
            </p>
            <div className="spinner" aria-label="Loading news" />
            {/* skeleton rows */}
            <div className="skeleton-row" />
            <div className="skeleton-row" />
            <div className="skeleton-row" />
        </div>
        );
    }

    if (error) {
        return (
        <div className="component-div">
            <h5 id="component-title">Recent News Headlines</h5>
            <p style={{ color: "crimson" }}>{error}</p>
        </div>
        );
    }

    if (!headlines.length) {
        return (
        <div className="component-div">
            <h5 id="component-title">Recent News Headlines</h5>
            <p style={{ color: "grey" }}>No recent headlines available.</p>
        </div>
        );
    }

    return (
        <div className="component-div">
        <h5 id="component-title">Recent News Headlines</h5>
        <p style={{ color: "grey" }}>Latest news affecting {symbol}</p>
        {headlines.map((news, idx) => (
            <NewsElement
            key={news.url || news.id || idx}
            headline={news.headline}
            sentiment={news.sentiment}
            source={news.source}
            url={news.url}
            />
        ))}
        </div>
    );
}

export default NewsAnalysis;
