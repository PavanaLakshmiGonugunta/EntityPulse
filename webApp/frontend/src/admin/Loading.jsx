// src/components/Loading.jsx
import React from "react";
import "./loading.css";

export default function Loading({ message = "Checking permissions..." }) {
    return (
        <div className="loading-overlay">
            <button className="loading-btn" disabled>
            <span className="spinner"></span>
            Loading....
            </button>
        </div>
    );
}
