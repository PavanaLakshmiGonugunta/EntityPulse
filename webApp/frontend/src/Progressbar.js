import React from 'react'
import './analysis-components/styling/Progressbar.css'

function Progressbar(props){
    return (
        <div className="progress-bar-container">
            <div className ='progress-bar-fill'
            style={{width: `${props.percentage}%`}}></div>
            {/* <p className="progress-sentiment">{props.percentage}% Positive</p> */}
            <p>Percentage</p>
        </div>
    )
}

export default Progressbar;