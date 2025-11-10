import React from "react";
import Header from "./Header.jsx";
import { TbCircleNumber1Filled } from "react-icons/tb";
import { TbCircleNumber2Filled } from "react-icons/tb";
import { TbCircleNumber3Filled } from "react-icons/tb";
import { TbCircleNumber4Filled } from "react-icons/tb";
import { RxText } from "react-icons/rx";
import { MdOutlineFileUpload } from "react-icons/md";
import { MdOutlineKeyboardVoice } from "react-icons/md";
import { HiOutlineLightningBolt } from "react-icons/hi";
import { MdOutlineShield } from "react-icons/md";
import { CiMobile2 } from "react-icons/ci";
const About = ()=>{
    return (
        <>
        <div className="header">
            <header><Header/></header>
            <hr className="line"></hr>
        </div>
        
        <div className="scope">
            <h1>Entity Pulse</h1>
            <pre>Advanced entity-level sentiment analysis platform that 
                combines AI-powered text processing with real-time market data and 
                social media monitoring to provide comprehensive insights into public sentiment 
                towards companies, brands, and other entities.
            </pre>
        </div>
        <h2 className="key-features">Key Features</h2>
        <div className="features">
            
            <div className="card">
                <h5>AI-Powered Entity Recognition</h5>
                <p>Advanced natural language processing to identify and extract entities from any text with high accuracy.</p>
            </div>

            <div className="card">
                <h5>Sentiment Analysis</h5>
                <p>Comprehensive sentiment analysis for each detected entity, providing confidence scores and detailed insights..</p>
            </div>

            <div className="card">
                <h5>Market Data Integration</h5>
                <p>Real-time stock market data, historical trends, and financial metrics for publicly traded companies.</p>
            </div>

            <div className="card">
                <h5>Social Media Monitoring</h5>
                <p>Track sentiment across multiple platforms including Twitter, Reddit, news outlets, and blogs..</p>
            </div>

            <div className="card">
                <h5>Multi-Input Support</h5>
                <p>Analyze text from direct input, image uploads with OCR, or voice recordings with speech-to-text.</p>
            </div>

            <div className="card">
                <h5>Entity Search & History</h5>
                <p>Search for any entity and view comprehensive historical data, trends, and sentiment patterns..</p>
            </div>
        </div>

        <div className="working">
            <h3>How It Works</h3>
            <p>SentimentScope uses a multi-step process to deliver accurate entity sentiment analysis</p>
            <div className="step-container">
                <div className="steps">
                    <a className="numbers"><TbCircleNumber1Filled /></a>
                    <h4>Input Content</h4>
                    <p>Submit text, upload images, or record voice messages</p>
            </div>
            <div className="steps">
                <a className="numbers"><TbCircleNumber2Filled /></a>
                <h4>Entity Extraction</h4>
                <p>AI identifies companies, brands, and other entities</p>
            </div>
            
            <div className="steps">
                <a className="numbers"><TbCircleNumber3Filled /></a>
                <h4>Sentiment Analysis</h4>
                <p>Analyze sentiment for each entity with confidence scores</p>
            </div>

            <div className="steps">
                <a className="numbers"><TbCircleNumber4Filled /></a>
                <h4>Detailed Insights</h4>
                <p>View market data, social trends, and historical analysis</p>
            </div>
            </div>
            
        </div>


        <h3 className="input-head">Supported Input Methods</h3>
        <div className="input-methods">
            <div className="methods">
                <a className="icon"><RxText /></a> 
                <p><b>Text Input</b></p>
                <p>Direct text entry for immediate analysis</p>
            </div>

            <div className="methods">
                <a className="icon"><MdOutlineFileUpload /></a>
                <p><b>Image Upload</b></p>
                <p>OCR technology extracts text from images</p>
            </div>

            <div className="methods">
                <a className="icon"><MdOutlineKeyboardVoice /></a>
                <p><b>Voice Recording</b></p>
                <p>Speech-to-text conversion for audio analysis</p>
            </div>
        </div>


        <h4 className="choose-head">Why Choose Sentiment Scope?</h4>
        <div className="choose">
            <div className="choice">
                <a className="icon"><HiOutlineLightningBolt /></a>
                <p><strong>Real-Time Analysis</strong></p>
                <p>Get instant sentiment insights as soon as you submit content</p>
            </div>

             <div className="choice">
                <a className="icon"><MdOutlineShield /></a>
                <p><strong>Reliable Data</strong></p>
                <p>High-confidence sentiment scoring with transparent accuracy metrics</p>
            </div>

             <div className="choice">
                <a className="icon"><CiMobile2 /></a>
                <p><strong>Responsive Design</strong></p>
                <p>Works seamlessly across desktop, tablet, and mobile devices</p>
            </div>
        </div>

        
            <div className="tech-sources">
            <h2>Technology & Data Sources</h2>
            <p>Built with cutting-edge technology and reliable data sources</p>

            <div className="sources-container">
                <div className="sources-block">
                    <h4>AI &amp; Machine Learning</h4>
                    <div className="tags">
                        <span className="tag">Natural Language Processing</span>
                        <span className="tag">Named Entity Recognition</span>
                        <span className="tag">Sentiment Classification</span>
                        <span className="tag">OCR Technology</span>
                        <span className="tag">Speech-to-Text</span>
                    </div>
                </div>

                
                <div className="sources-block">
                    <h4>Data Sources</h4>
                    <div className="tags">
                        <span className="tag">Real-time Stock APIs</span>
                        <span className="tag">Social Media Platforms</span>
                        <span className="tag">News Aggregators</span>
                        <span className="tag">Financial Data Providers</span>
                        <span className="tag">Market Analytics</span>
                    </div>
                </div>
            </div>
        </div>

    </>
    )
}
export default About;






