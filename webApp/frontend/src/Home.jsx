
import React, { useState } from "react";
import { MdOutlineFileUpload, MdOutlineKeyboardVoice, MdTitle } from "react-icons/md";
import Header from "./Header.jsx";
import {useNavigate} from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate()
    const [inputType, setInputType] = useState("text");
    const [voiceText, setVoiceText] = useState(""); // to store recognized speech
    const [isRecording, setIsRecording] = useState(false);
    const [textInput, setTextInput] = useState("");
    const [analysisResults, setAnalysisResults] = useState("")
    const [isLoading, setIsLoading] = useState(false);
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;

    const startRecording = () => {
        if (!recognition) {
            alert("Your browser does not support speech recognition.");
            return;
        }
        setIsRecording(true);
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.start();

        recognition.onresult = (event) => {
            const speechResult = event.results[0][0].transcript;
            setVoiceText(speechResult);
            setIsRecording(false);
        };

        recognition.onerror = (event) => {
            console.error(event.error);
            setIsRecording(false);
        };

        recognition.onend = () => {
            setIsRecording(false);
        };
    };

    const handleAnalyzeText = async (sourceText) => {
        if(!sourceText.trim()){
            alert("Please enter text before analyzing!");
            return ;
        }
        setIsLoading(true);
        setAnalysisResults(null)
        try{
            const response = await fetch('http://localhost:5000/get-text-data-analysis-results' , {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json',
                },
                body: JSON.stringify({text: sourceText})
            });
            if(!response.ok){
                const errorData = await response.json();
                throw new Error(errorData.message || 'Analysis failed on Server')
            }
            const data = await response.json();
            console.log(data)
            setAnalysisResults(data);
            navigate("/analysis", {state: {analysisData: data}});
        }
        catch(err){
            console.error("Backend API error: ", err)
        }
        finally{
            setIsLoading(false);
        }
    };

    return (
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
                    <div
                        className={inputType === "text" ? "option active" : "option"}
                        onClick={() => setInputType("text")}
                    >
                        <i><MdTitle size={25} /></i> Text
                    </div>
                    <div
                        className={inputType === "image" ? "option active" : "option"}
                        onClick={() => setInputType("image")}
                    >
                        <i><MdOutlineFileUpload /></i> Image
                    </div>
                    <div
                        className={inputType === "voice" ? "option active" : "option"}
                        onClick={() => setInputType("voice")}
                    >
                        <i><MdOutlineKeyboardVoice /></i> Voice
                    </div>
                </div>

                {/* Conditional rendering */}
                {inputType === "text" && (
                    <div className="input-entity">
                        <input 
                            type="text" 
                            placeholder="Enter text to analyze..." 
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                        />
                        <button 
                        type="submit" 
                        onClick = {() =>{ handleAnalyzeText(textInput) }}
                        disabled={isLoading}
                        >Analyze Text</button>
                    </div>
                )}

                {inputType === "image" && (
                    <div className="input-entity">
                        <input type="file" accept="image/*" />
                        <button type="submit">Analyze Image</button>
                    </div>
                )}

                {inputType === "voice" && (
                    <div className="input-entity">
                        <button type="button" onClick={startRecording}>
                            {isRecording ? "Recording..." : "Start Recording"}
                        </button>
                        {voiceText && (
                            <div>
                                <h4>Recognized Text:</h4>
                                <p>{voiceText}</p>
                                <button type="submit">Analyze Voice Text</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* Display Loading/Error/Results */}
            {isLoading && <p>Processing analysis... please wait.</p>}
            
            {/* 4. Placeholder for displaying results */}
            {analysisResults && (
                <div className="analysis-results">
                    <h2>Analysis Complete!</h2>
                    {/* Render the overall sentiment bar */}
                    <p>Overall Sentiment: {analysisResults.overallSentiment}</p>

                    {/* Render entity cards using the analysisResult.entities array */}
                    <div className="detected-entities">
                        {analysisResults.entities.map((entity, index) => (
                            <div key={index} className="entity-card">
                                <h4>{entity.entityName}</h4>
                                <p>{entity.mentions} mentions</p>
                                <p>Sentiment: {entity.sentiment} ({Math.round(entity.confidence * 100)}%)</p>
                                {/* Add 'View Details' button/logic here */}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

export default Home;

