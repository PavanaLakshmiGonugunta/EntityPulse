import React from "react"
import NewsElement from './NewsElement.jsx'

function newsAnalysis({headlines, symbol}){

    return(
        <div class='component-div'>
            <h5 id="component-title">Recent News Headlines</h5>
            <p style={{
                color: "grey",
            }}>Latest news affecting {symbol}</p>
            {headlines.map((news) => {
                return (
                    <NewsElement 
                        headline = {news.headline}
                        sentiment= {news.sentiment}
                        source={news.source}
                        url={news.url}
                    />
                )
            })}
        </div>
    )
}

export default newsAnalysis;