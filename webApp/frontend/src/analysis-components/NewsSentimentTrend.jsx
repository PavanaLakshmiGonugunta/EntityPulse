import SentimentDisplay from "./SentimentDisplay.jsx"

function NewsSentimentTrend({trendData}){
    return(
        <div class = "component-div">
            <h5 id="component-title">News Sentiment trend</h5>
                <p style={{
                    color: "grey",
                }}>How news sentiment has changed overtime</p>
                <SentimentDisplay title="This Week" percentage= {Math.floor(trendData[0].mainSentimentPercentage)} sentiment = {trendData[0].mainSentiment}/>
                <SentimentDisplay title="Last Week" percentage= {Math.floor(trendData[1].mainSentimentPercentage)} sentiment = {trendData[1].mainSentiment}/>
                <SentimentDisplay title="Last Month" percentage= {Math.floor(trendData[2].mainSentimentPercentage ?? 50)} sentiment = {trendData[2].mainSentiment}/>
        </div>
    )
}

export default NewsSentimentTrend;