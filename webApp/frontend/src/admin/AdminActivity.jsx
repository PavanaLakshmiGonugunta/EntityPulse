// src/pages/admin/AdminActivity.jsx
import React, { useContext } from "react";
import { AdminContext } from "./AdminProvider";
import '../App.css';
import './admin.css';

export default function AdminActivity() {
  const { activity = [] } = useContext(AdminContext);

  return (
    <div className="admin-page-content">
      <h1 className="card-title">User Activity</h1>

      <div className="card admin-activity-card card--60vw">
        {activity.length === 0 ? (
          <p className="muted">No user activity available.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Username</th>
                <th>Role</th>
                <th>Analyses</th>
                <th>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {activity.map((u) => (
                <tr key={String(u.userId)}>
                  <td>{u.email}</td>
                  <td>{u.username}</td>
                  <td>{u.role}</td>
                  <td>{u.analysesCount}</td>
                  <td>{u.lastActive ? new Date(u.lastActive).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
