import React from "react"
import NewsElement from './NewsElement.js'

function newsAnalysis(){
    const financialEntity = 'Apple'
    const newsResponse = [
        {
            "headline": "Apple unveils new iPhone 17 with major upgrades",
            "source": "Reuters",
            "url": "https://www.reuters.com/article/apple-news",
            "sentiment" : "Positive"
        },
        {
            "headline": "Apple reports record quarterly profits, beating analyst estimates",
            "source": "Bloomberg",
            "url": "https://www.bloomberg.com/article/apple-q2",
            "sentiment": "Neutral"
        },
        {
            "headline": "Apple stock drops after announcement of AI-powered services",
            "source": "CNBC",
            "url": "https://www.cnbc.com/article/apple-stock-news",
            "sentiment": "Negative"
        }
    ]

    return(
        <div class='component-div'>
            <h5 id="component-title">Recent News Headlines</h5>
            <p style={{
                color: "grey",
            }}>Latest news affecting {financialEntity}</p>
            {newsResponse.map((news) => {
                return (
                    <NewsElement 
                        headline = {news.headline}
                        sentiment={news.sentiment}
                        source={news.source}
                        url={news.url}
                    />
                )
            })}
        </div>
    )
}

export default newsAnalysis;