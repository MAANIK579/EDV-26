import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext();

const API_URL = 'http://localhost:5000/api';

const store = {
    get(key, fallback) {
        try { const v = localStorage.getItem('campusiq_auth_' + key); return v !== null ? JSON.parse(v) : fallback; }
        catch { return fallback; }
    },
    set(key, val) {
        try { localStorage.setItem('campusiq_auth_' + key, JSON.stringify(val)); } catch { }
    },
    remove(key) {
        try { localStorage.removeItem('campusiq_auth_' + key); } catch { }
    }
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => store.get('user', null));
    const [token, setToken] = useState(() => store.get('token', null));
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!store.get('token', null));

    const login = useCallback(async (email, password, role) => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (!res.ok) {
                return { success: false, error: data.error || 'Login failed' };
            }

            // Successfully logged in
            setUser(data.user);
            setToken(data.token);
            setIsAuthenticated(true);
            store.set('user', data.user);
            store.set('token', data.token);

            return { success: true, user: data.user };
        } catch (err) {
            console.error('Login error:', err);
            return { success: false, error: 'Network error. Is the server running?' };
        }
    }, []);

    const register = useCallback(async (email, password, name, role) => {
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name, role })
            });
            const data = await res.json();

            if (!res.ok) {
                return { success: false, error: data.error || 'Registration failed' };
            }

            setUser(data.user);
            setToken(data.token);
            setIsAuthenticated(true);
            store.set('user', data.user);
            store.set('token', data.token);

            return { success: true, user: data.user };
        } catch (err) {
            console.error('Registration error:', err);
            return { success: false, error: 'Network error. Is the server running?' };
        }
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        store.remove('user');
        store.remove('token');
    }, []);

    const updateUser = useCallback((updatedUser) => {
        setUser(updatedUser);
        store.set('user', updatedUser);
    }, []);

    const value = {
        user,
        token,
        isAuthenticated,
        login,
        register,
        logout,
        setUser: updateUser,
        isAdmin: user?.role === 'admin',
        isStudent: user?.role === 'student',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
