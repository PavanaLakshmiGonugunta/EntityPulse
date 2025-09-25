import React from "react";
import Header from "./Header.jsx";
import { TbCircleDottedLetterT } from "react-icons/tb";
import { MdOutlineFileUpload } from "react-icons/md";
import { MdOutlineKeyboardVoice } from "react-icons/md";
import { MdTitle } from "react-icons/md";
const Home = ()=>{
    return(
        <>
        <div className="header">
            <header><Header/></header>
            <hr className="line"></hr>
        </div>
        <div className="top">
            <h1>Entity Sentiment Analysis</h1>
            <p>Analyze sentiment for entities in text, images, or voice recordings</p>
        </div>
        <div className="container">
            <h5>Choose Input Method</h5>
            <p>Select how you'd like to provide content for analysis</p>
            <div className="options">
                <div>
                    <i><MdTitle size={25}/></i>Text</div>
                <div>
                    <i><MdOutlineFileUpload /></i>Image</div>
                <div>
                    <i><MdOutlineKeyboardVoice /></i>Voice</div>
            </div>
            <div className="input-entity">
                <input type="text"
                    placeholder="Enter text to analyze for entity sentiment...(e.g., 'Apple's new product launch exceeded expectations while Tesla's stock declined after the earning call.')"
                   
                />
                <button type="submit"> Analyze Text</button>
            </div>
        </div>
        </>
    )
}
export default Home;

