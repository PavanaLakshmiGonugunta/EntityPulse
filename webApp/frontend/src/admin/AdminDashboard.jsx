import React, { useEffect, useState } from "react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    LineChart,
    Line,
    Legend,
} from "recharts";
import '../App.css'
import './admin.css'

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6b7280"]; // green, amber, red, gray
const PIE_COLORS = ["#4f46e5", "#06b6d4", "#f97316"]; // indigo, cyan, orange (text,image,voice)

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [promoting, setPromoting] = useState(null);

    // new states for extra endpoints
    const [userActivity, setUserActivity] = useState([]);
    const [inputBreakdown, setInputBreakdown] = useState(null); // { text, image, voice }
    const [leaderboard, setLeaderboard] = useState([]); // top entities

    useEffect(() => {
        fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function fetchAll() {
        setLoading(true);
        await Promise.all([
        fetchStats(),
        fetchUsers(),
        fetchUserActivity(),
        fetchInputMethods(),
        fetchLeaderboard(),
        ]);
        setLoading(false);
    }

    async function fetchStats() {
        try {
        const res = await fetch("http://localhost:5000/admin/stats", {
            credentials: "include",
        });
        if (!res.ok) {
            const j = await res.json().catch(() => ({}));
            throw new Error(j.error || "Failed to fetch stats");
        }
        const j = await res.json();
        setStats(j);
        } catch (err) {
        console.error("Stats fetch failed:", err);
        setStats(null);
        }
    }

    async function fetchUsers() {
        try {
        const res = await fetch("http://localhost:5000/admin/users", {
            credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch users");
        const j = await res.json();
        setUsers(j.users || []);
        } catch (err) {
        console.error("Fetch users failed:", err);
        setUsers([]);
        }
    }

    async function fetchUserActivity() {
        try {
        const res = await fetch("http://localhost:5000/admin/user-activity", {
            credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch activity");
        const j = await res.json();
        setUserActivity(j.activity || []);
        } catch (err) {
        console.error("Fetch user activity failed:", err);
        setUserActivity([]);
        }
    }

    async function fetchInputMethods() {
        try {
        // last 14 days
        const res = await fetch("http://localhost:5000/admin/input-methods?days=14", {
            credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch input methods");
        const j = await res.json();
        setInputBreakdown(j.breakdown || { text: 0, image: 0, voice: 0 });
        } catch (err) {
        console.error("Fetch input methods failed:", err);
        setInputBreakdown({ text: 0, image: 0, voice: 0 });
        }
    }

    async function fetchLeaderboard() {
        try {
        const res = await fetch("http://localhost:5000/admin/leaderboard?days=14&limit=10", {
            credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        const j = await res.json();
        setLeaderboard(j.topEntities || []);
        } catch (err) {
        console.error("Fetch leaderboard failed:", err);
        setLeaderboard([]);
        }
    }

    async function deleteUser(userId) {
        if (!window.confirm("Delete this user? This action removes their account and histories.")) return;
        setDeleting(userId);
        try {
        const res = await fetch(`http://localhost:5000/admin/users/${userId}`, {
            method: "DELETE",
            credentials: "include",
        });
        if (!res.ok) {
            const txt = await res.text().catch(() => "Delete failed");
            throw new Error(txt || "Failed to delete");
        }
        setUsers((prev) => prev.filter((u) => u._id !== userId));
        // refresh activity and stats
        fetchUserActivity();
        fetchStats();
        } catch (err) {
        console.error("Delete failed:", err);
        alert("Delete failed. See console.");
        } finally {
        setDeleting(null);
        }
    }

    async function promoteUser(userId) {
        if (!window.confirm("Promote this user to admin?")) return;
        setPromoting(userId);
        try {
        const res = await fetch(`http://localhost:5000/admin/promote/${userId}`, {
            method: "POST",
            credentials: "include",
        });
        if (!res.ok) {
            const txt = await res.text().catch(() => "Promote failed");
            throw new Error(txt || "Failed to promote");
        }
        // refresh user list, activity and stats
        await Promise.all([fetchUsers(), fetchUserActivity(), fetchStats()]);
        alert("User promoted to admin.");
        } catch (err) {
        console.error("Promote failed:", err);
        alert("Promote failed. See console.");
        } finally {
        setPromoting(null);
        }
    }

    // prepare chart data
    const pieData = stats
        ? Object.entries(stats.sentiment || {}).map(([label, count]) => ({ name: label, value: count }))
        : [];

    const historyLineData = stats?.historyByDay?.map((d) => ({ date: d.date, count: d.count })) || [];

    const inputPieData = inputBreakdown
        ? [
            { name: "Text", value: inputBreakdown.text || 0 },
            { name: "Image", value: inputBreakdown.image || 0 },
            { name: "Voice", value: inputBreakdown.voice || 0 },
        ]
        : [];

    const leaderboardBarData = leaderboard.map((e) => ({ name: e.entityName, value: e.count }));

    return (
        <div className="admin-dashboard p-4">
        <h1>Admin Dashboard</h1>

        {loading && <p>Loading stats...</p>}
        {!stats && !loading && <p>No stats available or unauthorized.</p>}

        {stats && (
            <>
            <div className="summary-cards" style={{ display: "flex", gap: 16 }}>
                <div className="card" style={{ padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
                <h4>Total Users</h4>
                <div style={{ fontSize: 24 }}>{stats.totals?.users ?? 0}</div>
                </div>
                <div className="card" style={{ padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
                <h4>Total Analyses</h4>
                <div style={{ fontSize: 24 }}>{stats.totals?.history ?? 0}</div>
                </div>
            </div>

            <div style={{ display: "flex", gap: 24, marginTop: 24, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 300, minHeight: 260 }}>
                <h4>Sentiment distribution</h4>
                <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                    <Pie
                        data={pieData.length ? pieData : [{ name: "No data", value: 1 }]}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                    >
                        {(pieData.length ? pieData : [{ name: "No data", value: 1 }]).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    </PieChart>
                </ResponsiveContainer>
                </div>

                <div style={{ flex: 1.6, minWidth: 400 }}>
                <h4>Analyses in last 30 days</h4>
                <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={historyLineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={3} dot={{ r: 3 }} />
                    </LineChart>
                </ResponsiveContainer>
                </div>

                <div style={{ width: 320, minHeight: 260 }}>
                <h4>Input Methods (last 14 days)</h4>
                <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                    <Pie data={inputPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {inputPieData.map((entry, index) => (
                        <Cell key={`cell-input-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                    </Pie>
                    </PieChart>
                </ResponsiveContainer>
                </div>
            </div>

            <div style={{ marginTop: 24 }}>
                <h4>Top Entities (last 14 days)</h4>
                <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={leaderboardBarData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <defs>
                        <linearGradient id="grad1" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.75} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="url(#grad1)" />
                    </BarChart>
                </ResponsiveContainer>
                </div>

                <ol style={{ marginTop: 12 }}>
                {(stats.topEntities || []).map((t) => (
                    <li key={t.entityName}>
                    {t.entityName} — {t.count}
                    </li>
                ))}
                </ol>
            </div>
            </>
        )}

        <div style={{ marginTop: 36 }}>
            <h2>Users</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
                <tr>
                <th style={{ textAlign: "left", padding: 8 }}>Email</th>
                <th style={{ textAlign: "left", padding: 8 }}>Username</th>
                <th style={{ textAlign: "left", padding: 8 }}>Role</th>
                <th style={{ textAlign: "left", padding: 8 }}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {users.map((u) => (
                <tr key={u._id}>
                    <td style={{ padding: 8 }}>{u.email}</td>
                    <td style={{ padding: 8 }}>{u.username}</td>
                    <td style={{ padding: 8 }}>{u.role}</td>
                    <td style={{ padding: 8 }}>
                    {u.role !== "admin" && (
                        <button
                        onClick={() => promoteUser(u._id)}
                        disabled={promoting === u._id}
                        style={{ marginRight: 8 }}
                        >
                        {promoting === u._id ? "Promoting..." : "Promote"}
                        </button>
                    )}
                    <button onClick={() => deleteUser(u._id)} disabled={deleting === u._id}>
                        {deleting === u._id ? "Deleting..." : "Delete"}
                    </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>

        <div style={{ marginTop: 36 }}>
            <h2>User Activity</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
                <tr>
                <th style={{ textAlign: "left", padding: 8 }}>Email</th>
                <th style={{ textAlign: "left", padding: 8 }}>Username</th>
                <th style={{ textAlign: "left", padding: 8 }}>Role</th>
                <th style={{ textAlign: "left", padding: 8 }}>Analyses</th>
                <th style={{ textAlign: "left", padding: 8 }}>Last Active</th>
                </tr>
            </thead>
            <tbody>
                {userActivity.map((u) => (
                <tr key={u.userId}>
                    <td style={{ padding: 8 }}>{u.email}</td>
                    <td style={{ padding: 8 }}>{u.username}</td>
                    <td style={{ padding: 8 }}>{u.role}</td>
                    <td style={{ padding: 8 }}>{u.analysesCount}</td>
                    <td style={{ padding: 8 }}>{u.lastActive ? new Date(u.lastActive).toLocaleString() : "-"}</td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        </div>
    );
}
