import { useState } from 'react'
import './App.css'
import Search from './Search.jsx';
import Header from './Header.jsx';
import Home from './Home.jsx';
import About from './About.jsx';
import ResultsPage from './ResultsPage.jsx';
import Analysis from './Analysis.jsx';
import LandingPage from './LandingPage.jsx';
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import Profile from './Profile.jsx';

import AdminDashboard from "./admin/AdminDashboard.jsx";
import AdminProtectedRoute from "./admin/AdminProtectedRoute.jsx";
import AdminStats from './admin/AdminStats.jsx';
import AdminUsers from './admin/AdminUsers.jsx';
import AdminActivity from './admin/AdminActivity.jsx';
import AdminInputMethods from './admin/AdminInputMethods.jsx';
import AdminLeaderboard from './admin/AdminLeaderBoard.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import AdminProvider from './admin/AdminProvider.jsx';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/signup" element={<Signup/>} />
        <Route path="/home" element={<Home/>} />
        <Route path="/search" element={<Search/>} />
        <Route path="/about" element={<About/>} />
        <Route path="/result" element={<ResultsPage/>} />
        <Route path="/analysis" element={<Analysis/>} />
        <Route path="/profile" element={<Profile />} />

        {/* ADMIN ONLY ROUTE */}
        <Route path="/admin" element={
          <AdminProtectedRoute>
            <AdminProvider>
              <AdminLayout/>
            </AdminProvider>
          </AdminProtectedRoute>
        }>
          
          {/* Default */}
          <Route index element={<AdminStats />} />

          {/* Sub-pages */}
          <Route path="stats" element={<AdminStats />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="activity" element={<AdminActivity />} />
          <Route path="input-methods" element={<AdminInputMethods />} />
          <Route path="leaderboard" element={<AdminLeaderboard />} />
        </Route>

      </Routes>
    </Router>
  )
}

export default App
