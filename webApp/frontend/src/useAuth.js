// src/hooks/useAuth.js
import { useEffect, useState } from "react";

/**
 * Simple hook to fetch /profile and expose { loading, user, error }.
 * Automatically includes credentials so server session cookie works.
 */
export default function useAuth() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null); // { username, email, role }
    const [error, setError] = useState(null);

    useEffect(() => {
        let canceled = false;
        async function fetchProfile() {
        setLoading(true);
        try {
            const res = await fetch("/profile", { credentials: "include" });
            if (!res.ok) {
            // If unauthorized, set user to null (no error)
            if (res.status === 401) {
                if (!canceled) setUser(null);
                return;
            }
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || "Failed to fetch profile");
            }
            const data = await res.json();
            if (!canceled) setUser(data);
        } catch (err) {
            if (!canceled) setError(err);
        } finally {
            if (!canceled) setLoading(false);
        }
        }

        fetchProfile();
        return () => {
        canceled = true;
        };
    }, []);

    return { loading, user, error };
}
