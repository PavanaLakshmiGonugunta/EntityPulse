import React, { useState } from "react";
import { MdOutlineFileUpload, MdOutlineKeyboardVoice, MdTitle } from "react-icons/md";
import Header from "./Header.jsx";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [inputType, setInputType] = useState("text");
  const [voiceText, setVoiceText] = useState(""); // store recognized speech
  const [isRecording, setIsRecording] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Speech recognition setup
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
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

  // Handle text-based analysis
  const handleAnalyzeText = async (sourceText) => {
    if (!sourceText.trim()) {
      alert("Please enter text before analyzing!");
      return;
    }
    setIsLoading(true);
    setAnalysisResults(null);
    try {
      const response = await fetch(
        "http://localhost:5000/get-text-data-analysis-results",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: sourceText }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Analysis failed on server");
      }

      const data = await response.json();
      console.log("Analysis result:", data);
      setAnalysisResults(data);
      navigate("/analysis", { state: { analysisData: data } });
    } catch (err) {
      console.error("Backend API error:", err);
      alert("Failed to analyze text. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="header">
        <header>
          <Header />
        </header>
        <hr className="line" />
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
            <i>
              <MdTitle size={25} />
            </i>{" "}
            Text
          </div>

          <div
            className={inputType === "image" ? "option active" : "option"}
            onClick={() => setInputType("image")}
          >
            <i>
              <MdOutlineFileUpload size={25} />
            </i>{" "}
            Image
          </div>

          <div
            className={inputType === "voice" ? "option active" : "option"}
            onClick={() => setInputType("voice")}
          >
            <i>
              <MdOutlineKeyboardVoice size={25} />
            </i>{" "}
            Voice
          </div>
        </div>

        {/* Text Input Section */}
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
              onClick={() => handleAnalyzeText(textInput)}
              disabled={isLoading}
            >
              {isLoading ? "Analyzing..." : "Analyze Text"}
            </button>
          </div>
        )}

        {/* Image Upload Section */}
        {inputType === "image" && (
          <div className="input-entity">
            <input type="file" accept="image/*" />
            <button type="submit">Analyze Image</button>
          </div>
        )}

        {/* Voice Recording Section */}
        {inputType === "voice" && (
          <div className="input-entity">
            <button type="button" onClick={startRecording}>
              {isRecording ? "Recording..." : "Start Recording"}
            </button>
            {voiceText && (
              <div>
                <h4>Recognized Text:</h4>
                <p>{voiceText}</p>
                <button onClick={() => handleAnalyzeText(voiceText)}>
                  Analyze Voice Text
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Optional: Analysis Preview */}
      {isLoading && <p>Processing analysis... please wait.</p>}

      {analysisResults && (
        <div className="analysis-results">
          <h2>Analysis Complete!</h2>
          <p>Overall Sentiment: {analysisResults.overallSentiment}</p>

          <div className="detected-entities">
            {analysisResults.entities?.map((entity, index) => (
              <div key={index} className="entity-card">
                <h4>{entity.entityName}</h4>
                <p>{entity.mentions} mentions</p>
                <p>
                  Sentiment: {entity.sentiment} (
                  {Math.round(entity.confidence * 100)}%)
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
