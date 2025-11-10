import React from 'react';
import "./analysis.css";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Analysis() {
  const navigate = useNavigate();
  const location = useLocation();
  const {analysisData} = location.state || {};
  console.log(analysisData)
  if(!analysisData) return (
    <h3> Sorry! We could not find any Analysis Data.</h3>
  )
  return (
    <div className="app">
      {/* Back + Title */}
      <div className="header">
        <span className="back" onClick={() => navigate(-1)} role="button">← Back</span>
        <h2>Analysis Results</h2>
      </div>

      {/* Overall Sentiment */}
      <div className={`overall ${analysisData.overallSentiment.toLowerCase()}`}>
        <p>
          <strong>Overall Sentiment:</strong>{" "}
          <span className={`tag ${analysisData.overallSentiment.toLowerCase()}`}>
            {analysisData.overallSentiment}
          </span>
          <br />
          Confidence: {parseInt(analysisData.overallConfidence * 100)}%
        </p>

        <div className="progress">
          <div
            className={`progress-bar ${analysisData.overallSentiment.toLowerCase()}`}
            style={{
              width: `${parseInt(analysisData.overallConfidence * 100)}%`,
            }}
          ></div>
        </div>

        <p className="analyzed">
          Analyzed Text: {analysisData.analyzedText}
        </p>
      </div>


      {/* Entities */}
      <h3>Detected Entities</h3>
      <div className="entities">
        {analysisData.entities.map((entity) => {
          console.log("entity: ", entity)
          // Decide tag color based on sentiment
          const sentimentClass =
            entity.sentiment.toLowerCase() === "positive"
              ? "positive"
              : entity.sentiment.toLowerCase() === "negative"
              ? "negative"
              : "neutral";

          return (
            <div className="card" key={entity.entityName}>
              <h4>{entity.entityName}</h4>
              <p>
                Sentiment:{" "}
                <span className={`tag ${sentimentClass}`}>{entity.sentiment}</span>
              </p>
              <p style={{marginTop: "7px"}}>Confidence: {parseInt(entity.confidence * 100)}%</p>
              <div className="progress">
                <div
                  className="progress-bar"
                  style={{ width: `${entity.confidence * 100}%` }}
                ></div>
              </div>
              <button className="btn" onClick={() => {
                console.log("sending entity to result, ",entity);
                navigate('/result', { state: { entity: entity} })}
              }>View Details</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Analysis;
