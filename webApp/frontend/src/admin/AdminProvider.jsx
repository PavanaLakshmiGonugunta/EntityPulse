// src/context/AdminProvider.jsx
import React, { createContext, useEffect, useState, useCallback } from "react";
export const AdminContext = createContext();

// Backend base URL. Use Vite env var VITE_API_URL if present, otherwise default to localhost:5000
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * safeFetch - always uses absolute backend URL, includes credentials and disables cache to avoid 304 responses.
 * Throws a helpful Error with .status and .body when the response is not ok.
 */
async function safeFetch(path, opts = {}) {
  const url = `${API_BASE}${path}`;
  try {
    const res = await fetch(url, {
      credentials: "include",
      cache: "no-store", // prevents 304 Not Modified responses in dev
      ...opts,
    });

    if (!res.ok) {
      // try to get a useful body (json preferred)
      let body;
      try {
        body = await res.json();
      } catch (e) {
        body = await res.text().catch(() => "");
      }
      const err = new Error(`Request failed ${res.status} ${res.statusText}: ${JSON.stringify(body)}`);
      err.status = res.status;
      err.body = body;
      throw err;
    }

    // If no content (204) return null, otherwise parse json
    if (res.status === 204) return null;
    return await res.json();
  } catch (err) {
    console.error("[safeFetch] Error", url, err);
    throw err;
  }
}

export default function AdminProvider({ children }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [inputMethods, setInputMethods] = useState({ text: 0, image: 0, voice: 0 });
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(() => safeFetch("/admin/stats"), []);
  const fetchUsers = useCallback(() => safeFetch("/admin/users"), []);
  const fetchActivity = useCallback(() => safeFetch("/admin/user-activity"), []);
  const fetchInputMethods = useCallback((days = 14) => safeFetch(`/admin/input-methods?days=${days}`), []);
  const fetchLeaderboard = useCallback((days = 14, limit = 10) => safeFetch(`/admin/leaderboard?days=${days}&limit=${limit}`), []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [s, u, a, im, lb] = await Promise.allSettled([
        fetchStats(),
        fetchUsers(),
        fetchActivity(),
        fetchInputMethods(),
        fetchLeaderboard(),
      ]);

      console.log("[AdminProvider] fetch results:", { s, u, a, im, lb });

      if (s.status === "fulfilled") setStats(s.value);
      console.log(s.value)
      if (u.status === "fulfilled") setUsers(u.value.users || []);
      if (a.status === "fulfilled") setActivity(a.value.activity || []);
      if (im.status === "fulfilled") setInputMethods(im.value.breakdown || { text: 0, image: 0, voice: 0 });
      if (lb.status === "fulfilled") setLeaderboard(lb.value.topEntities || []);

      const anyRejected = [s, u, a, im, lb].some((r) => r.status === "rejected");
      if (anyRejected) {
        setError("Some admin data failed to load (check console).");
      }
    } catch (err) {
      console.error("refreshAll error:", err);
      setError("Failed to refresh admin data");
    } finally {
      setLoading(false);
    }
  }, [fetchActivity, fetchInputMethods, fetchLeaderboard, fetchStats, fetchUsers]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // promote user -> POST /admin/promote/:userId
  const promoteUser = async (userId) => {
    try {
      await safeFetch(`/admin/promote/${userId}`, { method: "POST" });
      // optimistic update
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: "admin" } : u)));
      // refresh dependent data in background
      refreshAll();
      return { ok: true };
    } catch (err) {
      console.error("promoteUser error:", err);
      return { ok: false, error: err.message || String(err) };
    }
  };

  // delete user -> DELETE /admin/users/:id
  const deleteUser = async (userId) => {
    try {
      await safeFetch(`/admin/users/${userId}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      refreshAll();
      return { ok: true };
    } catch (err) {
      console.error("deleteUser error:", err);
      return { ok: false, error: err.message || String(err) };
    }
  };

  return (
    <AdminContext.Provider
      value={{
        stats,
        users,
        activity,
        inputMethods,
        leaderboard,
        loading,
        error,
        refreshAll,
        promoteUser,
        deleteUser,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}
