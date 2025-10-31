
import "./analysis.css";
import { Link } from "react-router-dom";
function Analysis() {
  return (
    <div className="app">
      {/* Back + Title */}
      <div className="header">
        <span className="back">← Back</span>
        <h2>Analysis Results</h2>
      </div>

      {/* Overall Sentiment */}
      <div className="overall positive">
        <p>
          <strong>Overall Sentiment:</strong> Positive <br />
          Confidence: 79%
        </p>
        <div className="progress">
          <div className="progress-bar" style={{ width: "79%" }}></div>
        </div>
        <p className="analyzed">Analyzed Text: "Apple"</p>
      </div>

      {/* Entities */}
      <h3>Detected Entities</h3>
      <div className="entities">
        {/* Apple */}
        <div className="card">
          <h4>Apple</h4>
          <p>3 mentions</p>
          <p>
            Sentiment: <span className="tag positive">positive</span>
          </p>
          <p>Confidence: 85%</p>
          <div className="progress">
            <div className="progress-bar" style={{ width: "85%" }}></div>
          </div>
          <Link to="/NewsAnalysis">
            <button>View Details</button>
          </Link>
        </div>

        {/* Microsoft */}
        <div className="card">
          <h4>Microsoft</h4>
          <p>1 mention</p>
          <p>
            Sentiment: <span className="tag neutral">neutral</span>
          </p>
          <p>Confidence: 68%</p>
          <div className="progress">
            <div className="progress-bar" style={{ width: "68%" }}></div>
          </div>
          <Link to="/NewsAnalysis">
            <button>View Details</button>
          </Link>
        </div>

        {/* Amazon */}
        <div className="card">
          <h4>Amazon</h4>
          <p>4 mentions</p>
          <p>
            Sentiment: <span className="tag positive">positive</span>
          </p>
          <p>Confidence: 91%</p>
          <div className="progress">
            <div className="progress-bar" style={{ width: "91%" }}></div>
          </div>
          <Link to="/NewsAnalysis">
            <button>View Details</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Analysis;
