import SentimentDisplay from "./SentimentDisplay.js"

function NewsSentimentTrend(){
    return(
        <div class = "component-div">
            <h5 id="component-title">News Sentiment trend</h5>
                <p style={{
                    color: "grey",
                }}>How news sentiment has changed overtime</p>
                <SentimentDisplay title="This Week" percentage="40"/>
                <SentimentDisplay title="Last Week" percentage="60"/>
                <SentimentDisplay title="Last Month" percentage="55"/>
        </div>
    )
}

export default NewsSentimentTrend;