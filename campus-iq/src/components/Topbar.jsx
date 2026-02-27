import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const searchIndex = [
    { title: 'Dashboard', sub: 'Home overview', icon: 'fa-th-large', path: '/', category: 'Navigation' },
    { title: 'Schedule', sub: 'Weekly timetable', icon: 'fa-calendar-alt', path: '/schedule', category: 'Navigation' },
    { title: 'Room Tracker', sub: 'Room availability', icon: 'fa-door-open', path: '/rooms', category: 'Navigation' },
    { title: 'Campus Map', sub: 'Building navigation', icon: 'fa-map-marked-alt', path: '/map', category: 'Navigation' },
    { title: 'Events', sub: 'Campus events & RSVP', icon: 'fa-calendar-day', path: '/events', category: 'Navigation' },
    { title: 'Academics', sub: 'Courses & grades', icon: 'fa-book-open', path: '/academics', category: 'Navigation' },
    { title: 'Services', sub: 'Campus facilities', icon: 'fa-concierge-bell', path: '/services', category: 'Navigation' },
    { title: 'AI Chat', sub: 'Ask CampusIQ anything', icon: 'fa-robot', path: '/chat', category: 'Navigation' },
    { title: 'Profile', sub: 'Account & settings', icon: 'fa-user-circle', path: '/profile', category: 'Navigation' },
    { title: 'Data Structures & Algorithms', sub: 'CS301 · Prof. Mehra', icon: 'fa-code', path: '/academics', category: 'Courses' },
    { title: 'Machine Learning', sub: 'CS405 · Dr. Kapoor', icon: 'fa-brain', path: '/academics', category: 'Courses' },
    { title: 'Operating Systems', sub: 'CS310 · Prof. Singh', icon: 'fa-server', path: '/academics', category: 'Courses' },
    { title: 'Central Library', sub: 'Open until 11 PM', icon: 'fa-book', path: '/map', category: 'Buildings' },
    { title: 'Campus Hackathon 2026', sub: 'Mar 15-16 · ₹50K', icon: 'fa-trophy', path: '/events', category: 'Events' },
    { title: 'Cultural Fest SPANDAN', sub: 'Mar 8 · Main Ground', icon: 'fa-music', path: '/events', category: 'Events' },
];

export default function Topbar() {
    const { theme, toggleTheme, setNotifPanelOpen, setSidebarOpen } = useApp();
    const [clock, setClock] = useState('');
    const [query, setQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();
    const searchRef = useRef(null);

    // Live clock
    useEffect(() => {
        const tick = () => {
            const now = new Date();
            const h = now.getHours() % 12 || 12;
            const m = now.getMinutes().toString().padStart(2, '0');
            const s = now.getSeconds().toString().padStart(2, '0');
            const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
            setClock(`${h}:${m}:${s} ${ampm}`);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    // Keyboard shortcut
    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName))) {
                e.preventDefault();
                searchRef.current?.focus();
            }
            if (e.key === 'Escape') {
                setShowDropdown(false);
                setNotifPanelOpen(false);
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    const filteredResults = query.length > 0
        ? searchIndex.filter(item => item.title.toLowerCase().includes(query.toLowerCase()) || item.sub.toLowerCase().includes(query.toLowerCase()))
        : [];

    const grouped = {};
    filteredResults.forEach(r => {
        if (!grouped[r.category]) grouped[r.category] = [];
        grouped[r.category].push(r);
    });

    const handleSelect = (path) => {
        navigate(path);
        setQuery('');
        setShowDropdown(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && filteredResults.length > 0) {
            handleSelect(filteredResults[0].path);
        }
        if (e.key === 'Escape') {
            setShowDropdown(false);
        }
    };

    return (
        <header className="topbar">
            <button className="menu-toggle" onClick={() => setSidebarOpen(prev => !prev)}>
                <i className="fas fa-bars"></i>
            </button>

            <div className="search-box">
                <i className="fas fa-search"></i>
                <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search courses, events, rooms… (Ctrl+K)"
                    value={query}
                    onChange={e => { setQuery(e.target.value); setShowDropdown(true); }}
                    onFocus={() => query.length > 0 && setShowDropdown(true)}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                />
                {showDropdown && query.length > 0 && (
                    <div className="search-dropdown">
                        {filteredResults.length === 0 ? (
                            <div className="no-results" style={{ padding: 20, textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
                                <i className="fas fa-search"></i> No results found
                            </div>
                        ) : (
                            Object.entries(grouped).map(([cat, items]) => (
                                <div key={cat}>
                                    <div className="search-category">{cat}</div>
                                    {items.map(item => (
                                        <div key={item.title} className="search-result" onClick={() => handleSelect(item.path)}>
                                            <i className={`fas ${item.icon}`}></i>
                                            <div>
                                                <div className="sr-title">{item.title}</div>
                                                <div className="sr-sub">{item.sub}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <div className="live-clock">{clock}</div>

            <div className="topbar-actions">
                <button className="icon-btn" onClick={() => setNotifPanelOpen(prev => !prev)}>
                    <i className="fas fa-bell"></i>
                    <span className="badge">3</span>
                </button>
                <button className="icon-btn" onClick={toggleTheme}>
                    <i className={`fas ${theme === 'dark' ? 'fa-moon' : 'fa-sun'}`}></i>
                </button>
            </div>
        </header>
    );
}
