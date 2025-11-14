// src/pages/admin/AdminInputMethods.jsx
import React, { useContext } from "react";
import { AdminContext } from "./AdminProvider";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import "../App.css";
import "./admin.css";

const PIE_COLORS = ["#4f46e5", "#06b6d4", "#f97316"];

export default function AdminInputMethods() {
  const { inputMethods = { text: 0, image: 0, voice: 0 } } = useContext(AdminContext);

  const total =
    (inputMethods.text || 0) +
    (inputMethods.image || 0) +
    (inputMethods.voice || 0);

  const data = [
    { name: "Text", value: inputMethods.text || 0 },
    { name: "Image", value: inputMethods.image || 0 },
    { name: "Voice", value: inputMethods.voice || 0 },
  ];

  return (
    <div className="admin-page-content">
      <h1 className="card-title">Input Methods (last 14 days)</h1>

      <div className="card admin-input-card card--60vw">
        {total === 0 ? (
          <p className="muted">No input activity recorded in the selected period.</p>
        ) : (
          <>
            {/* PIE CHART */}
            <div className="chart-card ">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {data.map((entry, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={PIE_COLORS[idx % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* INPUT METHODS TABLE */}
            <div className="input-methods-table-wrap">
              <table className="admin-table input-methods-table">
                <thead>
                  <tr>
                    <th>Method</th>
                    <th>Count</th>
                    <th style={{ width: 120 }}>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((d, i) => {
                    const pct =
                      total > 0 ? Math.round((d.value / total) * 100) : 0;

                    return (
                      <tr key={d.name}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span
                              style={{
                                display: "inline-block",
                                width: 12,
                                height: 12,
                                background: PIE_COLORS[i % PIE_COLORS.length],
                                borderRadius: 3,
                              }}
                            />
                            <strong>{d.name}</strong>
                          </div>
                        </td>

                        <td>{d.value}</td>
                        <td>{pct}%</td>
                      </tr>
                    );
                  })}

                  {/* TOTAL ROW */}
                  <tr className="total-row">
                    <td><strong>Total Inputs</strong></td>
                    <td><strong>{total}</strong></td>
                    <td>100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
