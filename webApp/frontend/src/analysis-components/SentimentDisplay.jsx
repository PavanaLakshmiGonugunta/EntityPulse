import Progressbar from '../Progressbar.jsx'
import './styling/SentimentDisplay.css'
import {useState, useEffect} from 'react';

function SentimentDisplay(props){
    const percent = props.percentage;
    const sentiment = props.sentiment;
    return (
        <div class='sentiment-display-percentage-display'>
            <p>{props.title}</p>
            <Progressbar percentage= {(percent===0)? 50: percent}/>
            <p class={`percentage-text-${sentiment.toLowerCase()}`}>{(percent===0)? 50: percent}% {sentiment}</p>
        </div>
    )
}

export default SentimentDisplay;