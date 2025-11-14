// src/pages/admin/AdminUsers.jsx
import React, { useContext, useState } from "react";
import { AdminContext } from "./AdminProvider";
import "../App.css";
import "./admin.css";

export default function AdminUsers() {
  const { users = [], promoteUser, deleteUser } = useContext(AdminContext);
  const [promotingId, setPromotingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handlePromote = async (id) => {
    if (!window.confirm("Promote this user to admin?")) return;
    setPromotingId(id);
    const res = await promoteUser(id);
    if (!res.ok) alert("Promote failed: " + (res.error || "unknown"));
    setPromotingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user? This removes their account and histories.")) return;
    setDeletingId(id);
    const res = await deleteUser(id);
    if (!res.ok) alert("Delete failed: " + (res.error || "unknown"));
    setDeletingId(null);
  };

  return (
    <div className="admin-page-content">
      <h1 className="card-title">Users</h1>

      <div className="card admin-users-card card--60vw">
        {users.length === 0 ? (
          <p className="muted">No users found.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Username</th>
                <th>Role</th>
                <th style={{ width: 180 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.email}</td>
                  <td>{u.username}</td>
                  <td>{u.role}</td>
                  <td>
                    {u.role !== "admin" && (
                      <button
                        className="btn"
                        onClick={() => handlePromote(u._id)}
                        disabled={promotingId === u._id}
                        style={{ marginRight: 8 }}
                      >
                        {promotingId === u._id ? "Promoting..." : "Promote"}
                      </button>
                    )}
                    <button
                      className="btn secondary"
                      onClick={() => handleDelete(u._id)}
                      disabled={deletingId === u._id}
                    >
                      {deletingId === u._id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
