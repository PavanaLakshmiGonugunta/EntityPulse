import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./history.css";

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/history/${userId}`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setHistory(data);
        } else if (data?.history && Array.isArray(data.history)) {
          setHistory(data.history);
        } else {
          console.warn("Unexpected history format:", data);
          setHistory([]);
        }
      } catch (err) {
        console.error("Error fetching history:", err);
        setError("Failed to fetch history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId, navigate]);

  if (loading) return <p>Loading history...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="history-page">
      <h2>Your Analysis History</h2>

      {history.length === 0 ? (
        <p>No history yet. Try analyzing a sentence!</p>
      ) : (
        <ul className="history-list">
          {history.map((item) => {
            const sentiment = item.sentimentResult?.label || "Unknown";
            const sentimentClass = sentiment.toLowerCase();

            return (
              <li
                key={item._id}
                className="history-item"
                onClick={() =>
                  navigate("/analysis", {
                    state: {
                      analysisData: {
                        overallSentiment: sentiment,
                        confidence: item.sentimentResult?.score
                          ? Math.round(item.sentimentResult.score * 100)
                          : 0,
                        analyzedText: item.sentence,
                        date: new Date(item.createdAt).toLocaleString(),
                        entities: item.entities || [],
                      },
                    },
                  })
                }
              >
                <div className="sentence">{item.sentence}</div>

                <div className="details">
                  {/* ✅ Add class for colored sentiment */}
                  <span className={`sentiment ${sentimentClass}`}>
                    {sentiment}
                  </span>
                  <span className="timestamp">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default History;
