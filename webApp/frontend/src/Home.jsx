import React, { useState } from "react";
import { MdOutlineFileUpload, MdOutlineKeyboardVoice, MdTitle } from "react-icons/md";
import Header from "./Header.jsx";

const Home = () => {
    const [inputType, setInputType] = useState("text");
    const [voiceText, setVoiceText] = useState(""); 
    const [isRecording, setIsRecording] = useState(false);

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

                {inputType === "text" && (
                    <div className="input-entity">
                        <input type="text" placeholder="Enter text to analyze..." />
                        <button type="submit">Analyze Text</button>
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
        </>
    );
};

export default Home;