import SentimentDisplay from "./SentimentDisplay.jsx";

function NewsSentimentTrend({ trendData }) {
  return (
    <div className="component-div">
      <h5 id="component-title">News Sentiment Trend</h5>
      <p style={{ color: "grey" }}>How news sentiment has changed over time</p>

      {trendData && trendData.length >= 3 ? (
        <>
          <SentimentDisplay
            title="This Week"
            percentage={Math.floor(trendData[0].mainSentimentPercentage)}
            sentiment={trendData[0].mainSentiment}
          />
          <SentimentDisplay
            title="Last Week"
            percentage={Math.floor(trendData[1].mainSentimentPercentage)}
            sentiment={trendData[1].mainSentiment}
          />
          <SentimentDisplay
            title="Last Month"
            percentage={Math.floor(
              trendData[2].mainSentimentPercentage ?? 50
            )}
            sentiment={trendData[2].mainSentiment}
          />
        </>
      ) : (
        <>
          <SentimentDisplay title="This Week" percentage="40" />
          <SentimentDisplay title="Last Week" percentage="60" />
          <SentimentDisplay title="Last Month" percentage="55" />
        </>
      )}
    </div>
  );
}

export default NewsSentimentTrend;
