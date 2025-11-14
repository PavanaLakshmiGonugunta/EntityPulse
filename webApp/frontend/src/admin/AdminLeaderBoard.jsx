// src/pages/admin/AdminLeaderboard.jsx
import React, { useContext, useMemo } from "react";
import { AdminContext } from "./AdminProvider";
import "../App.css";
import "./admin.css";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const GRADIENT_ID = "grad-leader";

export default function AdminLeaderboard() {
  const { leaderboard = [], loading, error } = useContext(AdminContext);

  const data = useMemo(() => {
    return (leaderboard || []).map((e) => ({
      name: e.entityName,
      value: e.count,
    }));
  }, [leaderboard]);

  const total = data.reduce((s, d) => s + (d.value || 0), 0);

  return (
    <div className="admin-page-content">
      <h1 className="card-title">Top Entities</h1>

      <div className="card admin-leaderboard-card card--60vw">
        {loading && <p className="muted">Loading leaderboard...</p>}
        {error && <p style={{ color: "var(--danger)" }}>{error}</p>}

        {!loading && !error && data.length === 0 && (
          <p className="muted">No entities to show for the selected period.</p>
        )}

        {!loading && !error && data.length > 0 && (
          <>
            {/* CHART */}
            <div className="chart-card ">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{ top: 12, right: 20, left: 0, bottom: 40 }}
                >
                  <defs>
                    <linearGradient id={GRADIENT_ID} x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.75} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                    height={60}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill={`url(#${GRADIENT_ID})`} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* ENTITY TABLE */}
            <div className="leaderboard-table-wrap">
              <table className="admin-table leaderboard-table">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>#</th>
                    <th>Entity</th>
                    <th style={{ width: 150 }}>Mentions</th>
                  </tr>
                </thead>

                <tbody>
                  {data.map((d, idx) => (
                    <tr key={d.name}>
                      <td>{idx + 1}</td>
                      <td><strong>{d.name}</strong></td>
                      <td>{d.value}</td>
                    </tr>
                  ))}

                  {/* Total Row */}
                  <tr className="total-row">
                    <td colSpan={2}><strong>Total Mentions</strong></td>
                    <td><strong>{total}</strong></td>
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
