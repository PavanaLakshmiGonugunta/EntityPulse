import React from "react"
import './NewsElement.css'

function newsElement(){
    return (
        <div class='news-element-div'>
            <h4>Q3 Earnings Beat Expectations</h4>
            <p>2 hours ago.Financial Times</p>
            <div class='news-element-sentiment-div'>
                Positive
            </div>
        </div>
    )
}

export default newsElement;