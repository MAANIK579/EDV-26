import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { path: '/', icon: 'fa-th-large', label: 'Dashboard' },
    { path: '/schedule', icon: 'fa-calendar-alt', label: 'Schedule' },
    { path: '/rooms', icon: 'fa-door-open', label: 'Room Tracker' },
    { path: '/map', icon: 'fa-map-marked-alt', label: 'Campus Map' },
    { path: '/events', icon: 'fa-calendar-day', label: 'Events' },
    { path: '/academics', icon: 'fa-book-open', label: 'Academics' },
    { path: '/services', icon: 'fa-layer-group', label: 'Campus Hub' },
    { path: '/chat', icon: 'fa-robot', label: 'AI Chat' },
    { path: '/profile', icon: 'fa-user-circle', label: 'Profile' },
];

export default function Sidebar() {
    const { sidebarOpen, setSidebarOpen } = useApp();
    const { user, logout } = useAuth();

    return (
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-logo">
                <div className="logo-icon"><i className="fas fa-graduation-cap"></i></div>
                <span className="logo-text">Campus<span className="accent">IQ</span></span>
            </div>

            <nav className="sidebar-nav">
                {navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/'}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <i className={`fas ${item.icon}`}></i>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-pill">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} alt="avatar" className="user-avatar" />
                    <div style={{ flex: 1 }}>
                        <span className="user-name">{user?.name || 'User'}</span>
                        <span className="user-role">{user?.department} · {user?.semester}</span>
                    </div>
                    <button onClick={logout} title="Sign out"
                        style={{ color: 'var(--text-dim)', fontSize: 16, padding: 8, borderRadius: '50%', cursor: 'pointer', background: 'none', border: 'none', transition: 'all 0.2s' }}
                        onMouseOver={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                        onMouseOut={e => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.background = 'none'; }}>
                        <i className="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            </div>
        </aside>
    );
}
