import Progressbar from '../Progressbar.jsx'
import './styling/SentimentDisplay.css'
import {useState, useEffect} from 'react';

function SentimentDisplay(props){
    const percent = props.percentage;
    const [sentiment, setSentiment] = useState('Positive')
    useEffect(() => {
        if (percent >= 45 && percent <= 55) {
        setSentiment('Neutral');
        } else if (percent >= 0 && percent < 45) {
        setSentiment('Negative');
        } else if (percent > 55) {
        setSentiment('Positive');
        }
    }, [percent]);
    return (
        <div class='sentiment-display-percentage-display'>
            <p>{props.title}</p>
            <Progressbar percentage="40"/>
            <p class={`percentage-text-${sentiment.toLowerCase()}`}>{percent}% {sentiment}</p>
        </div>
    )
}

export default SentimentDisplay;