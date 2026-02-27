import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext();

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

// Demo accounts
const accounts = {
    student: [
        { id: 'STU001', email: 'rahul.sharma@university.edu', password: 'student123', name: 'Rahul Sharma', role: 'student', department: 'B.Tech CSE', semester: 'Sem 6', rollNo: '2022CSE1234' },
        { id: 'STU002', email: 'student@campus.edu', password: 'student123', name: 'Priya Patel', role: 'student', department: 'B.Tech ECE', semester: 'Sem 4', rollNo: '2023ECE5678' },
    ],
    admin: [
        { id: 'ADM001', email: 'admin@university.edu', password: 'admin123', name: 'Dr. Rajesh Kumar', role: 'admin', department: 'Administration', designation: 'Dean of Students' },
        { id: 'ADM002', email: 'prof.mehra@university.edu', password: 'admin123', name: 'Prof. Mehra', role: 'admin', department: 'Computer Science', designation: 'HOD - CSE' },
    ]
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => store.get('user', null));
    const [isAuthenticated, setIsAuthenticated] = useState(() => store.get('isAuth', false));

    const login = useCallback((email, password, role) => {
        const pool = accounts[role] || [];
        const found = pool.find(u => u.email === email && u.password === password);

        if (found) {
            setUser(found);
            setIsAuthenticated(true);
            store.set('user', found);
            store.set('isAuth', true);
            return { success: true, user: found };
        }

        return { success: false, error: 'Invalid email or password' };
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setIsAuthenticated(false);
        store.remove('user');
        store.remove('isAuth');
    }, []);

    const value = {
        user,
        isAuthenticated,
        login,
        logout,
        isAdmin: user?.role === 'admin',
        isStudent: user?.role === 'student',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
