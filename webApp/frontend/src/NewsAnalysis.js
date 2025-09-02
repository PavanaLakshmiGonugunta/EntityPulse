import React from "react"
import newsElement from './NewsElement.js'
import './NewsAnalysis.css'

function newsAnalysis(){
    const financialEntity = "Apple" // dummy for now
    return(
        <div class='recent-news-headlines-div'>
            <h5>Recent News Headlines</h5>
            <p style={{
                color: "grey",
            }}>Latest news affecting {financialEntity}</p>
            <newsElement/>
        </div>
    )
}

export default newsAnalysis;