// src/pages/admin/AdminStats.jsx
import React, { useContext, useMemo } from "react";
import { AdminContext } from "./AdminProvider";
import "../App.css";
import "./admin.css";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6b7280"];
const LINE_COLOR = "#4f46e5";

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const normalizeDate = (d) => {
  if (!d && d !== 0) return "";
  if (typeof d === "string" && d.length >= 10) return d.slice(0, 10);
  try {
    const dt = new Date(d);
    if (!isNaN(dt)) return dt.toISOString().slice(0, 10);
  } catch {}
  return String(d);
};

export default function AdminStats() {
  const { stats, loading, error } = useContext(AdminContext);

  // prepare pie data
  const sentimentPie = useMemo(() => {
    if (!stats?.sentiment) return [{ name: "No data", value: 1 }];
    if (Array.isArray(stats.sentiment)) {
      return stats.sentiment.map((it) => ({
        name: it._id ?? it.name ?? "unknown",
        value: toNumber(it.count ?? it.value ?? 0),
      }));
    }
    return Object.entries(stats.sentiment).map(([k, v]) => ({ name: k, value: toNumber(v) }));
  }, [stats]);

  // prepare line data
  const historyLine = useMemo(() => {
    const raw = Array.isArray(stats?.historyByDay) ? stats.historyByDay : Array.isArray(stats?.history) ? stats.history : [];
    const mapped = raw
      .map((d) => ({
        date: normalizeDate(d.date ?? d.day ?? d._id ?? ""),
        count: toNumber(d.count ?? d.value ?? 0),
      }))
      .filter((r) => r.date);

    if (!mapped.length) {
      // fallback 7-day empty dataset
      const t = new Date();
      return Array.from({ length: 7 }).map((_, i) => {
        const dt = new Date(t);
        dt.setDate(t.getDate() - (6 - i));
        return { date: dt.toISOString().slice(0, 10), count: 0 };
      });
    }
    return mapped;
  }, [stats]);

  const xTickFormatter = (d) => {
    if (typeof d === "string" && d.length >= 10) return d.slice(5, 10);
    return d;
  };

  return (
    <div className="admin-page-content admin-stats-page">
      <h1 className="card-title">Statistics</h1>

      {loading && (
        <div className="card">
          <p className="muted">Loading admin stats...</p>
        </div>
      )}
      {error && (
        <div className="card">
          <p style={{ color: "var(--danger)" }}>{error}</p>
        </div>
      )}
      {!loading && !stats && (
        <div className="card">
          <p className="muted">No stats available.</p>
        </div>
      )}

      {stats && (
        <>
          <div className="stats-grid">
            {/* Sentiment pie */}
            <div className="card chart-card card--60vw">
              <h3>Sentiment distribution</h3>

              {/* fixed-height container so ResponsiveContainer can measure */}
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer width="100%" height="100%" key={JSON.stringify(sentimentPie)}>
                  <PieChart>
                    <Pie
                      data={sentimentPie}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label
                      isAnimationActive={false}
                    >
                      {sentimentPie.map((entry, i) => (
                        <Cell key={`s-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => [val, "Count"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* History line */}
            <div className="card chart-card card--60vw">
              <h3>Analyses in last 30 days</h3>

              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer width="100%" height="100%" key={JSON.stringify(historyLine)}>
                  <LineChart data={historyLine}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={xTickFormatter} />
                    <YAxis />
                    <Tooltip formatter={(val) => [val, "Count"]} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke={LINE_COLOR}
                      strokeWidth={3}
                      dot={{ r: 3 }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top entities table */}
            <div className="card card--60vw">
              <h3>Top entities (last 14 days)</h3>
              {Array.isArray(stats.topEntities) && stats.topEntities.length ? (
                <div className="entities-table-wrap">
                  <table className="admin-table entities-table">
                    <thead>
                      <tr>
                        <th style={{ width: 60 }}>#</th>
                        <th>Entity</th>
                        <th style={{ width: 120 }}>Mentions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.topEntities.map((t, idx) => (
                        <tr key={t.entityName ?? idx}>
                          <td>{idx + 1}</td>
                          <td>
                            <span className="entity-name">{t.entityName}</span>
                            {t.extra && <div className="small muted">{t.extra}</div>}
                          </td>
                          <td>{toNumber(t.count)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="muted">No entities found.</p>
              )}
            </div>
          </div>

          {/* totals */}
          <div className="card totals-table-card card--60vw">
            <h3>Totals</h3>
            <table className="admin-table totals-table">
              <tbody>
                <tr>
                  <td>
                    <strong>Total users</strong>
                  </td>
                  <td>{toNumber(stats.totals?.users)}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Total analyses</strong>
                  </td>
                  <td>{toNumber(stats.totals?.history)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
