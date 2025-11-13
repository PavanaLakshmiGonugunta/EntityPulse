import React, { useState } from "react";
import {
  MdOutlineFileUpload,
  MdOutlineKeyboardVoice,
  MdTitle,
} from "react-icons/md";
import Header from "./Header.jsx";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [inputType, setInputType] = useState("text");

  // --- States ---
  const [voiceText, setVoiceText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [extractedText, setExtractedText] = useState("");

  // 🎙️ Speech Recognition Setup
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

  // 🧠 Handle Text Analysis + Save History
  const handleAnalyzeText = async (sourceText) => {
    if (!sourceText.trim()) {
      alert("Please enter text before analyzing!");
      return;
    }

    setIsLoading(true);
    setAnalysisResults(null);

    try {
      // 1️⃣ Send text to backend for analysis
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
      console.log("✅ Analysis Result:", data);

      // Navigate to results page
      setAnalysisResults(data);
      navigate("/analysis", { state: { analysisData: data } });

      // 2️⃣ Save History (Only if logged in)
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.warn("⚠️ No userId found — skipping history save.");
        return;
      }

      const sentimentResult = {
        label: data.overallSentiment || "Neutral",
        score: data.overallConfidence || 0.8,
      };

      // Send analysis record to MongoDB via backend
      const saveResponse = await fetch("http://localhost:5000/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          sentence: sourceText,
          sentimentResult,
          entities: data.entities || [], // ✅ Include detected entities
        }),
      });

      if (!saveResponse.ok) {
        const errData = await saveResponse.json();
        console.error("❌ History Save Failed:", errData);
      } else {
        const result = await saveResponse.json();
        console.log("📦 History Saved Successfully:", result);
      }
    } catch (err) {
      console.error("❌ Backend API error:", err);
      alert("Analysis failed. Please check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  // 🖼️ Handle Image Upload → OCR → Text Analysis
  const handleAnalyzeImage = async () => {
    if (!selectedImage) {
      alert("Please upload an image");
      return;
    }
    setIsLoading(true);
    setExtractedText("");

    try {
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
      console.log("📷 OCR Result:", data);

      const extracted = data.extracted_text || "";
      setExtractedText(extracted);
      if (!extracted) {
        alert("No text detected in the image.");
      }

      await handleAnalyzeText(extracted);
    } catch (err) {
      console.error("OCR error:", err);
      alert("Failed to process image. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={isLoading ? "blurred" : ""}>
        {/* --- HEADER --- */}
        <div className="header">
          <header>
            <Header />
          </header>
          <hr className="line" />
        </div>

        {/* --- TITLE SECTION --- */}
        <div className="top">
          <h1>Entity Sentiment Analysis</h1>
          <p>Analyze sentiment for entities in text, images, or voice recordings</p>
        </div>

        {/* --- INPUT METHOD CHOOSER --- */}
        <div className="search-container">
          <h5>Choose Input Method</h5>
          <p>Select how you'd like to provide content for analysis</p>

          <div className="options">
            <div
              className={inputType === "text" ? "option active" : "option"}
              onClick={() => setInputType("text")}
            >
              <i>
                <MdTitle size={25} />
              </i>
              Text
            </div>

            <div
              className={inputType === "image" ? "option active" : "option"}
              onClick={() => setInputType("image")}
            >
              <i>
                <MdOutlineFileUpload size={25} />
              </i>
              Image
            </div>

            <div
              className={inputType === "voice" ? "option active" : "option"}
              onClick={() => setInputType("voice")}
            >
              <i>
                <MdOutlineKeyboardVoice size={25} />
              </i>
              Voice
            </div>
          </div>

          {/* --- TEXT INPUT --- */}
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
                Analyze Text
              </button>
            </div>
          )}

          {/* --- IMAGE INPUT --- */}
          {inputType === "image" && (
            <div className="input-entity">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files[0])}
              />
              <button
                type="submit"
                onClick={handleAnalyzeImage}
                disabled={isLoading}
              >
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

          {/* --- VOICE INPUT --- */}
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
                    onClick={() => handleAnalyzeText(voiceText)}
                    disabled={isLoading}
                  >
                    Analyze Text
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- LOADING SCREEN --- */}
        {isLoading && (
          <div className="loading-overlay">
            <button className="loading-btn" disabled>
              <span className="spinner"></span>
              Processing analysis...
            </button>
          </div>
        )}

        {/* --- ANALYSIS PREVIEW --- */}
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
      </div>
    </>
  );
};

export default Home;
