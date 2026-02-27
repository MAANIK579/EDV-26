import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

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
    const { token, isAuthenticated } = useAuth();

    const [theme, setTheme] = useState(() => store.get('theme', 'dark'));
    const [toasts, setToasts] = useState([]);
    const [completedAssignments, setCompletedAssignments] = useState(() => store.get('completedAssignments', {}));
    const [todos, setTodos] = useState([]); // Removed local storage init, will fetch from DB
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

    const [rsvps, setRsvps] = useState({}); // We can still keep a local map for instant UI updates, or just rely on events data
    const [events, setEvents] = useState([]);

    // Fetch Events and RSVPs — with polling every 15s for live updates
    const fetchEvents = useCallback(() => {
        if (isAuthenticated && token) {
            fetch('http://localhost:5000/api/events', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setEvents(data);
                        const rsvpMap = {};
                        data.forEach(e => {
                            if (e.isRsvpd) rsvpMap[e.id] = true;
                        });
                        setRsvps(rsvpMap);
                    }
                })
                .catch(err => console.error('Failed to load events:', err));
        } else {
            setEvents([]);
            setRsvps({});
        }
    }, [isAuthenticated, token]);

    useEffect(() => {
        fetchEvents();
        const interval = setInterval(fetchEvents, 15000); // Poll every 15s
        return () => clearInterval(interval);
    }, [fetchEvents]);

    // RSVP
    const toggleRsvp = useCallback(async (eventId, eventName) => {
        const isCurrentlyRsvpd = !!rsvps[eventId];

        // Optimistic UI update
        setRsvps(prev => {
            const next = { ...prev };
            if (isCurrentlyRsvpd) {
                delete next[eventId];
            } else {
                next[eventId] = true;
            }
            return next;
        });

        // Update events array optimistically
        setEvents(prev => prev.map(e => e.id === eventId ? { ...e, isRsvpd: !isCurrentlyRsvpd } : e));

        try {
            const res = await fetch(`http://localhost:5000/api/events/${eventId}/rsvp`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.status === 'added') {
                showToast(`🎉 RSVP confirmed for "${eventName}"`, 'success', 3000);
            } else if (data.status === 'removed') {
                showToast(`❌ RSVP cancelled for "${eventName}"`, 'warning', 2500);
            }
        } catch (err) {
            console.error('RSVP failed', err);
            showToast('Failed to sync RSVP with server', 'error');
            // Revert optimistic update
            setRsvps(prev => {
                const next = { ...prev };
                if (isCurrentlyRsvpd) next[eventId] = true; else delete next[eventId];
                return next;
            });
            setEvents(prev => prev.map(e => e.id === eventId ? { ...e, isRsvpd: isCurrentlyRsvpd } : e));
        }
    }, [rsvps, token, showToast]);

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
    useEffect(() => {
        if (isAuthenticated && token) {
            fetch('http://localhost:5000/api/todos', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => setTodos(data))
                .catch(err => console.error('Failed to load todos:', err));
        } else {
            setTodos([]);
        }
    }, [isAuthenticated, token]);

    const addTodo = useCallback(async (text) => {
        try {
            const res = await fetch('http://localhost:5000/api/todos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text })
            });
            if (res.ok) {
                const newTodo = await res.json();
                setTodos(prev => [...prev, newTodo]);
                showToast(`📝 Task added!`, 'success', 1500);
            }
        } catch (err) {
            console.error('Failed to add todo', err);
        }
    }, [token, showToast]);

    const toggleTodo = useCallback(async (id) => {
        const todo = todos.find(t => t.id === id);
        if (!todo) return;

        // Optimistic update
        setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

        try {
            await fetch(`http://localhost:5000/api/todos/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ done: !todo.done })
            });
        } catch (err) {
            console.error('Failed to update todo', err);
            // Revert optimistic update
            setTodos(prev => prev.map(t => t.id === id ? { ...t, done: todo.done } : t));
        }
    }, [todos, token]);

    const deleteTodo = useCallback(async (id) => {
        // Optimistic update
        const previousTodos = [...todos];
        setTodos(prev => prev.filter(t => t.id !== id));

        try {
            await fetch(`http://localhost:5000/api/todos/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (err) {
            console.error('Failed to delete todo', err);
            // Revert optimistic update
            setTodos(previousTodos);
        }
    }, [todos, token]);

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
        events, rsvps, toggleRsvp,
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
