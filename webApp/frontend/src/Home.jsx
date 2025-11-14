import React, { useState } from "react";
import { MdOutlineFileUpload, MdOutlineKeyboardVoice, MdTitle } from "react-icons/md";
import Header from "./Header.jsx";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();
    const [inputType, setInputType] = useState("text");

    // Text/voice states
    const [voiceText, setVoiceText] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [textInput, setTextInput] = useState("");

    // Results/loading
    const [analysisResults, setAnalysisResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Image OCR states
    const [selectedImage, setSelectedImage] = useState(null);
    const [extractedText, setExtractedText] = useState("");

    // Keep track of which method was used for the current analysis
    const [usedInputMethod, setUsedInputMethod] = useState(null);

    // Speech API
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

    // method: "text" | "image" | "voice" - used to mark how the analysis was provided
    const handleAnalyzeText = async (sourceText, method = inputType) => {
        if (!sourceText || !sourceText.trim()) {
        alert("Please enter text before analyzing!");
        return;
        }

        setIsLoading(true);
        setAnalysisResults(null);
        setUsedInputMethod(method || "text");

        try {
        const response = await fetch("http://localhost:5000/get-text-data-analysis-results", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: sourceText }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Analysis failed on Server");
        }

        const data = await response.json();
        console.log("Analysis result:", data);

        setAnalysisResults(data);
        navigate("/analysis", { state: { analysisData: data } });

        // --- Save history to backend using session (no localStorage userId) ---
        try {
            const sentimentResult = {
            label: data.overallSentiment || "Neutral",
            score: data.overallConfidence || 0.8,
            };

            const saveBody = {
            sentence: sourceText,
            sentimentResult,
            entities: data.entities || [],
            inputMethod: method || inputType || "text",
            };

            const saveResp = await fetch("http://localhost:5000/history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include", // send session cookie so server can use req.session.userId
            body: JSON.stringify(saveBody),
            });

            if (!saveResp.ok) {
            let errJson = null;
            try {
                errJson = await saveResp.json();
            } catch (e) {}
            console.error("History save failed:", errJson || saveResp.statusText);
            } else {
            const saved = await saveResp.json();
            console.log("📦 History saved:", saved);
            }
        } catch (saveErr) {
            console.error("Error while saving history:", saveErr);
        }
        } catch (err) {
        console.error("Backend API error: ", err);
        alert("Analysis failed. Please check console for details.");
        } finally {
        setIsLoading(false);
        }
    };

    const handleAnalyzeImage = async () => {
        if (!selectedImage) {
        alert("Please upload an image");
        return;
        }
        setIsLoading(true);
        setExtractedText("");
        try {
        // Convert image file to binary bytes
        const imageBytes = await selectedImage.arrayBuffer();

        const response = await fetch("http://127.0.0.1:5000/extract-text", {
            method: "POST",
            headers: {
            "Content-Type": "application/octet-stream",
            },
            body: imageBytes,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to extract text");
        }
        const data = await response.json();
        console.log("OCR Result:", data);
        const extracted = data.extracted_text || "";
        setExtractedText(extracted);
        if (!extracted) {
            alert("No text detected in the image.");
        }

        // Pass explicit method 'image' so the history records the correct input type
        await handleAnalyzeText(extracted, "image");
        } catch (err) {
        console.error("OCR error:", err);
        alert("Failed to process image. Check backend or console for details.");
        } finally {
        setIsLoading(false);
        }
    };

    return (
        <>
        <div className={isLoading ? "blurred" : ""}>
            <div className="header">
            <header>
                <Header />
            </header>
            <hr className="line"></hr>
            </div>
            <div className="top">
            <h1>Entity Sentiment Analysis</h1>
            <p>Analyze sentiment for entities in text, images, or voice recordings</p>
            </div>

            <div className="search-container">
            <h5>Choose Input Method</h5>
            <p>Select how you'd like to provide content for analysis</p>
            <div className="options">
                <div className={inputType === "text" ? "option active" : "option"} onClick={() => setInputType("text")}>
                <i>
                    <MdTitle size={25} />
                </i>
                Text
                </div>
                <div className={inputType === "image" ? "option active" : "option"} onClick={() => setInputType("image")}>
                <i>
                    <MdOutlineFileUpload size={25} />
                </i>
                Image
                </div>
                <div className={inputType === "voice" ? "option active" : "option"} onClick={() => setInputType("voice")}>
                <i>
                    <MdOutlineKeyboardVoice size={25} />
                </i>
                Voice
                </div>
            </div>

            {/* Conditional rendering */}
            {inputType === "text" && (
                <div className="input-entity">
                <input type="text" placeholder="Enter text to analyze..." value={textInput} onChange={(e) => setTextInput(e.target.value)} />
                <button
                    type="submit"
                    onClick={() => {
                    handleAnalyzeText(textInput, "text");
                    }}
                    disabled={isLoading}
                >
                    Analyze Text
                </button>
                </div>
            )}

            {inputType === "image" && (
                <div className="input-entity">
                <input type="file" accept="image/*" onChange={(e) => setSelectedImage(e.target.files[0])} />
                <button type="submit" onClick={handleAnalyzeImage} disabled={isLoading}>
                    Analyze Image
                </button>

                {extractedText && (
                    <div className="ocr-result">
                    <h4>Extracted Text:</h4>
                    <p>{extractedText}</p>
                    </div>
                )}
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
                    <button
                        type="submit"
                        onClick={() => {
                        handleAnalyzeText(voiceText, "voice");
                        }}
                        disabled={isLoading}
                    >
                        Analyze Text
                    </button>
                    </div>
                )}
                </div>
            )}
            </div>

            {/* Display Loading/Error/Results */}
            {isLoading && (
            <div className="loading-overlay">
                <button className="loading-btn" disabled>
                <span className="spinner"></span>
                Processing analysis...
                </button>
            </div>
            )}

            {/* 4. Placeholder for displaying results */}
            {analysisResults && (
            <div className="analysis-results">
                <h2>Analysis Complete!</h2>
                <p>Overall Sentiment: {analysisResults.overallSentiment}</p>
                <p>
                <strong>Input Method Used:</strong> {usedInputMethod || inputType}
                </p>

                {/* Render entity cards using the analysisResult.entities array */}
                <div className="detected-entities">
                {analysisResults.entities?.map((entity, index) => (
                    <div key={index} className="entity-card">
                    <h4>{entity.entityName}</h4>
                    <p>{entity.mentions} mentions</p>
                    <p>
                        Sentiment: {entity.sentiment} ({Math.round(entity.confidence * 100)}%)
                    </p>
                    {/* Add 'View Details' button/logic here */}
                    </div>
                ))}
                </div>
            </div>
            )}
        </div>
        </>
    );
};

export default Home;
