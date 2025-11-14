// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Props:
 * - children: component(s) to render if allowed
 * - required: (user) => boolean  OR boolean (defaults to () => true)
 * - redirectTo: path to redirect if not allowed (default: "/login")
 *
 * Important: this component does NOT redirect while it is "checking" auth.
 * That prevents the flicker where navigate() updates path and the guard immediately kicks you back.
 */
export default function ProtectedRoute({ children, required = () => true, redirectTo = "/login" }) {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    setChecking(true);

    (async () => {
      try {
        console.log("[ProtectedRoute] fetching profile for route:", location.pathname);
        const res = await fetch("http://localhost:5000/profile", {
          credentials: "include",
        });

        if (!mounted) return;

        if (!res.ok) {
          console.warn("[ProtectedRoute] profile fetch returned not-ok:", res.status);
          setUser(null);
        } else {
          const j = await res.json();
          console.log("[ProtectedRoute] profile:", j);
          setUser(j);
        }
      } catch (err) {
        console.error("[ProtectedRoute] fetch error:", err);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setChecking(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [/* run when component mounts or route changes */ location.pathname]);

  // while checking, render a loader or nothing to avoid redirect flicker
  if (checking) {
    return <div style={{ padding: 20 }}>Checking authentication...</div>;
  }

  // if no user, redirect to login
  if (!user) {
    console.log("[ProtectedRoute] no user -> redirecting to", redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  // if required is function, evaluate it; if boolean, use directly
  const allowed = typeof required === "function" ? required(user) : Boolean(required);

  if (!allowed) {
    console.log("[ProtectedRoute] user not authorized -> redirecting to", redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  // allowed
  return children;
}
