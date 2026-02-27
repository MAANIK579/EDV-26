import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AppContext = createContext();

const store = {
    get(key, fallback) {
        try { const v = localStorage.getItem('campusiq_' + key); return v !== null ? JSON.parse(v) : fallback; }
        catch { return fallback; }
    },
    set(key, val) {
        try { localStorage.setItem('campusiq_' + key, JSON.stringify(val)); } catch { }
    }
};

export function AppProvider({ children }) {
    const [theme, setTheme] = useState(() => store.get('theme', 'dark'));
    const [toasts, setToasts] = useState([]);
    const [rsvps, setRsvps] = useState(() => store.get('rsvps', {}));
    const [completedAssignments, setCompletedAssignments] = useState(() => store.get('completedAssignments', {}));
    const [todos, setTodos] = useState(() => store.get('todos', []));
    const [notifPanelOpen, setNotifPanelOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [settings, setSettings] = useState(() => store.get('settings', { pushNotifs: true, emailDigests: false, language: 'en' }));

    // Theme
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        document.body.classList.toggle('light', theme === 'light');
        store.set('theme', theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(prev => {
            const next = prev === 'dark' ? 'light' : 'dark';
            showToast(next === 'light' ? '☀️ Light mode activated' : '🌙 Dark mode activated', 'info', 2000);
            return next;
        });
    }, []);

    // Toast System
    const showToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type, duration }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // RSVP
    const toggleRsvp = useCallback((eventName) => {
        setRsvps(prev => {
            const next = { ...prev };
            if (next[eventName]) {
                delete next[eventName];
                showToast(`❌ RSVP cancelled for "${eventName}"`, 'warning', 2500);
            } else {
                next[eventName] = true;
                showToast(`🎉 RSVP confirmed for "${eventName}"`, 'success', 3000);
            }
            store.set('rsvps', next);
            return next;
        });
    }, [showToast]);

    // Assignments
    const toggleAssignment = useCallback((key) => {
        setCompletedAssignments(prev => {
            const next = { ...prev };
            if (next[key]) {
                delete next[key];
                showToast(`↩️ "${key}" unmarked`, 'info', 2000);
            } else {
                next[key] = true;
                showToast(`✅ "${key}" marked as done!`, 'success', 2500);
            }
            store.set('completedAssignments', next);
            return next;
        });
    }, [showToast]);

    // Todos
    const addTodo = useCallback((text) => {
        setTodos(prev => {
            const next = [{ id: Date.now(), text, done: false }, ...prev];
            store.set('todos', next);
            return next;
        });
        showToast(`📝 Task added!`, 'success', 1500);
    }, [showToast]);

    const toggleTodo = useCallback((id) => {
        setTodos(prev => {
            const next = prev.map(t => t.id === id ? { ...t, done: !t.done } : t);
            store.set('todos', next);
            return next;
        });
    }, []);

    const deleteTodo = useCallback((id) => {
        setTodos(prev => {
            const next = prev.filter(t => t.id !== id);
            store.set('todos', next);
            return next;
        });
    }, []);

    // Settings
    const updateSetting = useCallback((key, value) => {
        setSettings(prev => {
            const next = { ...prev, [key]: value };
            store.set('settings', next);
            return next;
        });
    }, []);

    const value = {
        theme, toggleTheme,
        toasts, showToast, removeToast,
        rsvps, toggleRsvp,
        completedAssignments, toggleAssignment,
        todos, addTodo, toggleTodo, deleteTodo,
        notifPanelOpen, setNotifPanelOpen,
        sidebarOpen, setSidebarOpen,
        settings, updateSetting,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
    return useContext(AppContext);
}
