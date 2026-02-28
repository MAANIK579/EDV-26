import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

/* ============================================
   FULL-SCREEN ADMIN DASHBOARD
   Connected to SQLite database via API
   ============================================ */

const API = 'http://localhost:5000/api';

const deptData = [
    { name: 'CSE', students: 420, color: '#10b981' },
    { name: 'ECE', students: 380, color: '#8b5cf6' },
    { name: 'ME', students: 340, color: '#f59e0b' },
    { name: 'CE', students: 290, color: '#0ea5e9' },
    { name: 'IT', students: 310, color: '#ec4899' },
    { name: 'EE', students: 260, color: '#f97316' },
];

const attendanceTrend = [
    { week: 'W1', avg: 92 }, { week: 'W2', avg: 89 }, { week: 'W3', avg: 87 },
    { week: 'W4', avg: 91 }, { week: 'W5', avg: 85 }, { week: 'W6', avg: 88 },
    { week: 'W7', avg: 90 }, { week: 'W8', avg: 87 },
];

const pieData = [
    { name: 'Above 90%', value: 45, color: '#34d399' },
    { name: '75-90%', value: 35, color: '#fbbf24' },
    { name: 'Below 75%', value: 20, color: '#ef4444' },
];

const adminNavItems = [
    { id: 'overview', icon: 'fa-th-large', label: 'Overview' },
    { id: 'announcements', icon: 'fa-bullhorn', label: 'Announcements' },
    { id: 'events', icon: 'fa-calendar-plus', label: 'Events' },
    { id: 'hub', icon: 'fa-layer-group', label: 'Campus Hub' },
    { id: 'rooms', icon: 'fa-door-open', label: 'Room Management' },
    { id: 'students', icon: 'fa-user-graduate', label: 'Students' },
    { id: 'faculty', icon: 'fa-chalkboard-teacher', label: 'Faculty' },
    { id: 'analytics', icon: 'fa-chart-bar', label: 'Analytics' },
    { id: 'settings', icon: 'fa-cog', label: 'Settings' },
];

export default function AdminDashboard() {
    const { user, token, logout } = useAuth();
    const { theme, toggleTheme, showToast } = useApp();
    const [activeSection, setActiveSection] = useState('overview');

    // ── Data from database ──
    const [announcements, setAnnouncements] = useState([]);
    const [events, setEvents] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [students, setStudents] = useState([]);
    const [clubs, setClubs] = useState([]);
    const [placements, setPlacements] = useState([]);
    const [selectedClub, setSelectedClub] = useState(null);
    const [clubMembersList, setClubMembersList] = useState([]);

    // ── Form state ──
    const [newAnn, setNewAnn] = useState({ title: '', text: '', priority: 'normal', targetAudience: 'all' });
    const [newEvt, setNewEvt] = useState({ name: '', date: '', venue: '', category: 'academic', description: '' });
    const [newClub, setNewClub] = useState({ name: '', description: '', category: 'technical' });
    const [newPlacement, setNewPlacement] = useState({ companyName: '', role: '', description: '', salary: '', deadline: '', eligibleBatch: '', type: 'Full-time' });
    const [studentSearch, setStudentSearch] = useState('');

    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

    // ── Fetch data from backend ──
    const fetchAnnouncements = useCallback(() => {
        fetch(`${API}/announcements`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(r => r.json()).then(d => { if (Array.isArray(d)) setAnnouncements(d); })
            .catch(err => console.error('Failed to load announcements:', err));
    }, [token]);

    const fetchEvents = useCallback(() => {
        fetch(`${API}/events`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(r => r.json()).then(d => { if (Array.isArray(d)) setEvents(d); })
            .catch(err => console.error('Failed to load events:', err));
    }, [token]);

    const fetchRooms = useCallback(() => {
        fetch(`${API}/rooms`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(r => r.json()).then(d => { if (Array.isArray(d)) setRooms(d); })
            .catch(err => console.error('Failed to load rooms:', err));
    }, [token]);

    const fetchStudents = useCallback(() => {
        fetch(`${API}/admin/students`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(r => r.json()).then(d => { if (Array.isArray(d)) setStudents(d); })
            .catch(err => console.error('Failed to load students:', err));
    }, [token]);

    const fetchClubs = useCallback(() => {
        fetch(`${API}/clubs`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(r => r.json()).then(d => { if (Array.isArray(d)) setClubs(d); })
            .catch(err => console.error('Failed to load clubs:', err));
    }, [token]);

    const fetchPlacements = useCallback(() => {
        fetch(`${API}/placements`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(r => r.json()).then(d => { if (Array.isArray(d)) setPlacements(d); })
            .catch(err => console.error('Failed to load placements:', err));
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchAnnouncements();
            fetchEvents();
            fetchRooms();
            fetchStudents();
            fetchClubs();
            fetchPlacements();
        }
    }, [token, fetchAnnouncements, fetchEvents, fetchRooms, fetchStudents, fetchClubs, fetchPlacements]);

    // Auto-refresh every 15s
    useEffect(() => {
        const interval = setInterval(() => {
            fetchAnnouncements();
            fetchEvents();
            fetchRooms();
        }, 15000);
        return () => clearInterval(interval);
    }, [fetchAnnouncements, fetchEvents, fetchRooms]);

    // Clock
    const [clock, setClock] = React.useState('');
    React.useEffect(() => {
        const tick = () => {
            const now = new Date();
            const h = now.getHours() % 12 || 12;
            const m = now.getMinutes().toString().padStart(2, '0');
            const s = now.getSeconds().toString().padStart(2, '0');
            setClock(`${h}:${m}:${s} ${now.getHours() >= 12 ? 'PM' : 'AM'}`);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    // ── CRUD Handlers ──

    // Add Announcement → POST to backend
    const addAnnouncement = async (e) => {
        e.preventDefault();
        if (!newAnn.title.trim()) return;
        try {
            const res = await fetch(`${API}/announcements`, {
                method: 'POST', headers, body: JSON.stringify(newAnn)
            });
            if (res.ok) {
                setNewAnn({ title: '', text: '', priority: 'normal', targetAudience: 'all' });
                showToast('📢 Announcement published!', 'success');
                fetchAnnouncements();
            } else {
                showToast('Failed to publish announcement', 'error');
            }
        } catch (err) { showToast('Network error', 'error'); }
    };

    // Delete Announcement
    const removeAnnouncement = async (id) => {
        try {
            await fetch(`${API}/announcements/${id}`, { method: 'DELETE', headers });
            showToast('🗑️ Announcement removed', 'warning');
            fetchAnnouncements();
        } catch (err) { showToast('Failed to delete', 'error'); }
    };

    // Add Event → POST to backend
    const addEvent = async (e) => {
        e.preventDefault();
        if (!newEvt.name.trim()) return;
        try {
            const res = await fetch(`${API}/events`, {
                method: 'POST', headers,
                body: JSON.stringify({
                    title: newEvt.name,
                    description: newEvt.description || '',
                    date: newEvt.date || new Date().toISOString(),
                    venue: newEvt.venue,
                    category: newEvt.category
                })
            });
            if (res.ok) {
                setNewEvt({ name: '', date: '', venue: '', category: 'academic', description: '' });
                showToast('🎉 Event created!', 'success');
                fetchEvents();
            } else {
                showToast('Failed to create event', 'error');
            }
        } catch (err) { showToast('Network error', 'error'); }
    };

    // Delete Event
    const removeEvent = async (id) => {
        try {
            await fetch(`${API}/events/${id}`, { method: 'DELETE', headers });
            showToast('🗑️ Event removed', 'warning');
            fetchEvents();
        } catch (err) { showToast('Failed to delete', 'error'); }
    };

    // Add Club
    const addClub = async (e) => {
        e.preventDefault();
        if (!newClub.name.trim()) return;
        try {
            const res = await fetch(`${API}/clubs`, {
                method: 'POST', headers, body: JSON.stringify(newClub)
            });
            if (res.ok) {
                setNewClub({ name: '', description: '', category: 'technical' });
                showToast('🧩 Club created!', 'success');
                fetchClubs();
            } else { showToast('Failed to create club', 'error'); }
        } catch (err) { showToast('Network error', 'error'); }
    };

    // Delete Club
    const removeClub = async (id) => {
        if (!confirm('Delete this club? All memberships will be removed.')) return;
        try {
            await fetch(`${API}/clubs/${id}`, { method: 'DELETE', headers });
            showToast('🗑️ Club removed', 'warning');
            fetchClubs();
            if (selectedClub?.id === id) setSelectedClub(null);
        } catch (err) { showToast('Failed to delete', 'error'); }
    };

    // Manage Club Members
    const handleManageMembers = async (club) => {
        setSelectedClub(club);
        try {
            const res = await fetch(`${API}/clubs/${club.id}/members`, { headers });
            const data = await res.json();
            if (res.ok) setClubMembersList(data);
            else showToast('Failed to fetch members', 'error');
        } catch (err) { showToast('Network error', 'error'); }
    };

    const handleUpdateRole = async (clubId, studentId, role) => {
        try {
            const res = await fetch(`${API}/clubs/${clubId}/members/${studentId}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ role })
            });
            if (res.ok) {
                showToast('Role updated successfully', 'success');
                // Optimistically update the list
                setClubMembersList(prev => prev.map(m => m.studentId === studentId ? { ...m, role } : m));
            } else {
                showToast('Failed to update role', 'error');
            }
        } catch (err) { showToast('Network error', 'error'); }
    };

    // Add Placement
    const addPlacement = async (e) => {
        e.preventDefault();
        if (!newPlacement.companyName.trim() || !newPlacement.role.trim() || !newPlacement.salary.trim() || !newPlacement.deadline) return;
        try {
            const res = await fetch(`${API}/placements`, {
                method: 'POST', headers, body: JSON.stringify(newPlacement)
            });
            if (res.ok) {
                setNewPlacement({ companyName: '', role: '', description: '', salary: '', deadline: '', eligibleBatch: '', type: 'Full-time' });
                showToast('🏢 Placement Drive created!', 'success');
                fetchPlacements();
            } else { showToast('Failed to create placement', 'error'); }
        } catch (err) { showToast('Network error', 'error'); }
    };

    // Delete Placement
    const removePlacement = async (id) => {
        if (!confirm('Delete this placement drive? All applications will be lost.')) return;
        try {
            await fetch(`${API}/placements/${id}`, { method: 'DELETE', headers });
            showToast('🗑️ Placement removed', 'warning');
            fetchPlacements();
        } catch (err) { showToast('Failed to delete', 'error'); }
    };


    // Room status override → PATCH to backend
    const toggleRoom = async (id, status) => {
        try {
            await fetch(`${API}/rooms/${id}`, {
                method: 'PATCH', headers,
                body: JSON.stringify({ statusOverride: status })
            });
            const room = rooms.find(r => r.id === id);
            showToast(`🚪 Room ${room?.number || id} → ${status || 'Auto'}`, 'info', 2000);
            fetchRooms();
        } catch (err) { showToast('Failed to update room', 'error'); }
    };

    const filteredStudents = students.filter(s =>
        (s.name || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
        (s.email || '').toLowerCase().includes(studentSearch.toLowerCase())
    );

    const inputStyle = { padding: '10px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', border: '1px solid transparent', color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: 'inherit', width: '100%' };

    return (
        <div className="app-layout">
            {/* Admin Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <div className="logo-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                        <i className="fas fa-user-shield"></i>
                    </div>
                    <span className="logo-text">Campus<span className="accent">IQ</span></span>
                </div>

                <div style={{ padding: '8px 16px', margin: '0 12px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.15)', textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Admin Portal
                </div>

                <nav className="sidebar-nav" style={{ marginTop: 8 }}>
                    {adminNavItems.map(item => (
                        <button
                            key={item.id}
                            className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                            onClick={() => setActiveSection(item.id)}
                            style={{ width: '100%', textAlign: 'left', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit' }}
                        >
                            <i className={`fas ${item.icon}`}></i>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-pill">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} alt="avatar" className="user-avatar" />
                        <div style={{ flex: 1 }}>
                            <span className="user-name">{user?.name}</span>
                            <span className="user-role">Administrator</span>
                        </div>
                        <button onClick={logout} title="Sign out" style={{ color: 'var(--text-dim)', fontSize: 16, padding: 8, borderRadius: '50%', cursor: 'pointer', background: 'none', border: 'none', transition: 'all 0.2s' }}
                            onMouseOver={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                            onMouseOut={e => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.background = 'none'; }}>
                            <i className="fas fa-sign-out-alt"></i>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Admin Main Content */}
            <div className="main-content">
                {/* Admin Topbar */}
                <header className="topbar">
                    <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 16, fontWeight: 700 }}>
                            <i className={`fas ${adminNavItems.find(n => n.id === activeSection)?.icon}`} style={{ marginRight: 8, color: 'var(--emerald)' }}></i>
                            {adminNavItems.find(n => n.id === activeSection)?.label}
                        </span>
                    </div>
                    <div className="live-clock">{clock}</div>
                    <div className="topbar-actions">
                        <button className="icon-btn" onClick={toggleTheme}>
                            <i className={`fas ${theme === 'dark' ? 'fa-moon' : 'fa-sun'}`}></i>
                        </button>
                    </div>
                </header>

                <div className="page-content">
                    <div className="page-transition">

                        {/* ——— OVERVIEW ——— */}
                        {activeSection === 'overview' && (
                            <div>
                                <div className="page-header">
                                    <h1>Welcome, <span className="accent">{user?.name?.split(' ')[0]}</span></h1>
                                    <p className="subtitle">Campus administration dashboard — {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>

                                <div className="stats-grid">
                                    {[
                                        { icon: 'fa-user-graduate', label: 'Registered Students', value: students.length || '0', color: '#10b981' },
                                        { icon: 'fa-bullhorn', label: 'Announcements', value: announcements.length || '0', color: '#8b5cf6' },
                                        { icon: 'fa-door-open', label: 'Rooms', value: rooms.length || '0', color: '#0ea5e9' },
                                        { icon: 'fa-calendar-check', label: 'Events', value: events.length || '0', color: '#ec4899' },
                                        { icon: 'fa-book', label: 'Library Books', value: '50K+', color: '#f59e0b' },
                                        { icon: 'fa-chart-line', label: 'Avg Attendance', value: '87%', color: '#f97316' },
                                    ].map((s, i) => (
                                        <div key={i} className="stat-card" style={{ '--accent': s.color, animationDelay: `${i * 0.06}s` }}>
                                            <div className="stat-icon" style={{ color: s.color }}><i className={`fas ${s.icon}`}></i></div>
                                            <div><div className="stat-value" style={{ fontSize: 26 }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
                                        </div>
                                    ))}
                                </div>

                                <div className="dashboard-grid">
                                    <div className="glass-card">
                                        <h3><i className="fas fa-chart-bar" style={{ color: '#00d4ff', marginRight: 8 }}></i>Students by Department</h3>
                                        <ResponsiveContainer width="100%" height={220}>
                                            <BarChart data={deptData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
                                                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
                                                <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9' }} />
                                                <Bar dataKey="students" radius={[4, 4, 0, 0]}>
                                                    {deptData.map((d, i) => <Cell key={i} fill={d.color} />)}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="glass-card">
                                        <h3><i className="fas fa-chart-line" style={{ color: '#10b981', marginRight: 8 }}></i>Attendance Trend</h3>
                                        <ResponsiveContainer width="100%" height={220}>
                                            <LineChart data={attendanceTrend}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                                <XAxis dataKey="week" tick={{ fill: '#52525b', fontSize: 12 }} axisLine={false} />
                                                <YAxis domain={[75, 100]} tick={{ fill: '#52525b', fontSize: 12 }} axisLine={false} />
                                                <Tooltip contentStyle={{ background: '#141416', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, color: '#fafafa' }} />
                                                <Line type="monotone" dataKey="avg" stroke="#10b981" strokeWidth={3} dot={{ r: 5, fill: '#10b981' }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Recent Announcements */}
                                <div className="glass-card">
                                    <h3><i className="fas fa-bullhorn" style={{ color: '#fbbf24', marginRight: 8 }}></i>Recent Announcements</h3>
                                    {announcements.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 12 }}>No announcements yet. Create one from the Announcements section.</p>}
                                    {announcements.slice(0, 4).map((a) => (
                                        <div key={a.id} className={`announce-item ${a.priority === 'urgent' ? 'urgent' : ''}`}>
                                            <div className="announce-dot"></div>
                                            <div style={{ flex: 1 }}>
                                                <strong style={{ fontSize: 13 }}>{a.title}</strong>
                                                <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '2px 0' }}>{a.text}</p>
                                                <span className="announce-time">{a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ——— ANNOUNCEMENTS ——— */}
                        {activeSection === 'announcements' && (
                            <div>
                                <div className="page-header"><h1><i className="fas fa-bullhorn"></i> Manage Announcements</h1><p className="subtitle">Create announcements — choose audience: Students, Faculty, or Everyone</p></div>
                                <div className="glass-card" style={{ marginBottom: 24 }}>
                                    <h3><i className="fas fa-plus-circle" style={{ color: 'var(--cyan)', marginRight: 8 }}></i>New Announcement</h3>
                                    <form onSubmit={addAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                                        <input placeholder="Announcement title" value={newAnn.title} onChange={e => setNewAnn(p => ({ ...p, title: e.target.value }))} required style={inputStyle} />
                                        <textarea placeholder="Announcement details..." value={newAnn.text} onChange={e => setNewAnn(p => ({ ...p, text: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                                            <select className="setting-select" value={newAnn.priority} onChange={e => setNewAnn(p => ({ ...p, priority: e.target.value }))}>
                                                <option value="normal">Normal Priority</option>
                                                <option value="urgent">🔴 Urgent</option>
                                            </select>
                                            <select className="setting-select" value={newAnn.targetAudience} onChange={e => setNewAnn(p => ({ ...p, targetAudience: e.target.value }))} style={{ minWidth: 160 }}>
                                                <option value="all">🌐 Show to Everyone</option>
                                                <option value="students">🎓 Students Only</option>
                                                <option value="faculty">💼 Faculty Only</option>
                                            </select>
                                            <button type="submit" className="btn btn-primary"><i className="fas fa-paper-plane"></i> Publish</button>
                                        </div>
                                    </form>
                                </div>
                                <div className="glass-card">
                                    <h3><i className="fas fa-list" style={{ color: 'var(--amber)', marginRight: 8 }}></i>Active Announcements ({announcements.length})</h3>
                                    {announcements.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 12 }}>No announcements yet.</p>}
                                    {announcements.map(a => (
                                        <div key={a.id} className={`announce-item ${a.priority === 'urgent' ? 'urgent' : ''}`}>
                                            <div className="announce-dot"></div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                                    <strong>{a.title}</strong>
                                                    <span style={{
                                                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: 0.5,
                                                        background: a.targetAudience === 'faculty' ? 'rgba(249,115,22,0.15)' : a.targetAudience === 'students' ? 'rgba(16,185,129,0.15)' : 'rgba(0,212,255,0.15)',
                                                        color: a.targetAudience === 'faculty' ? '#f97316' : a.targetAudience === 'students' ? '#10b981' : '#00d4ff'
                                                    }}>{a.targetAudience === 'faculty' ? '💼 Faculty' : a.targetAudience === 'students' ? '🎓 Students' : '🌐 Everyone'}</span>
                                                </div>
                                                <p>{a.text}</p>
                                                <span className="announce-time">{a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}</span>
                                            </div>
                                            <button className="btn btn-sm btn-danger" onClick={() => removeAnnouncement(a.id)}>
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ——— EVENTS ——— */}
                        {activeSection === 'events' && (
                            <div>
                                <div className="page-header"><h1><i className="fas fa-calendar-plus"></i> Manage Events</h1><p className="subtitle">Create events — students see them in real-time</p></div>
                                <div className="glass-card" style={{ marginBottom: 24 }}>
                                    <h3><i className="fas fa-plus-circle" style={{ color: 'var(--purple)', marginRight: 8 }}></i>Create Event</h3>
                                    <form onSubmit={addEvent} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                                        <input placeholder="Event Name" value={newEvt.name} onChange={e => setNewEvt(p => ({ ...p, name: e.target.value }))} required style={inputStyle} />
                                        <input type="date" value={newEvt.date} onChange={e => setNewEvt(p => ({ ...p, date: e.target.value }))} required style={inputStyle} />
                                        <input placeholder="Venue" value={newEvt.venue} onChange={e => setNewEvt(p => ({ ...p, venue: e.target.value }))} style={inputStyle} />
                                        <select className="setting-select" value={newEvt.category} onChange={e => setNewEvt(p => ({ ...p, category: e.target.value }))}>
                                            <option value="academic">Academic</option><option value="cultural">Cultural</option><option value="sports">Sports</option><option value="workshop">Workshop</option>
                                        </select>
                                        <textarea placeholder="Event description..." value={newEvt.description} onChange={e => setNewEvt(p => ({ ...p, description: e.target.value }))} rows={2} style={{ ...inputStyle, gridColumn: '1 / -1', resize: 'vertical' }} />
                                        <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1' }}><i className="fas fa-plus"></i> Create Event</button>
                                    </form>
                                </div>
                                <div className="glass-card">
                                    <h3><i className="fas fa-calendar" style={{ color: 'var(--pink)', marginRight: 8 }}></i>Events ({events.length})</h3>
                                    {events.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 12 }}>No events yet.</p>}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                                        {events.map(ev => (
                                            <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                                                <div>
                                                    <strong style={{ fontSize: 14 }}>{ev.title}</strong>
                                                    <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
                                                        {ev.date ? new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''} · {ev.venue} · {ev.category}
                                                    </div>
                                                </div>
                                                <button className="btn btn-sm btn-danger" onClick={() => removeEvent(ev.id)}><i className="fas fa-trash"></i></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ——— CAMPUS HUB (Clubs & Placements) ——— */}
                        {activeSection === 'hub' && (
                            <div>
                                <div className="page-header"><h1><i className="fas fa-layer-group"></i> Campus Hub Management</h1><p className="subtitle">Create and oversee student clubs and placement opportunities</p></div>

                                <h2 style={{ fontSize: 20, marginBottom: 16, marginTop: 24, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}><i className="fas fa-users-cog" style={{ color: 'var(--cyan)' }}></i> Manage Clubs</h2>

                                <div className="glass-card" style={{ marginBottom: 24 }}>
                                    <h3><i className="fas fa-plus-circle" style={{ color: 'var(--purple)', marginRight: 8 }}></i>Create New Club</h3>
                                    <form onSubmit={addClub} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                                        <input placeholder="Club Name" value={newClub.name} onChange={e => setNewClub(p => ({ ...p, name: e.target.value }))} required style={{ ...inputStyle, gridColumn: '1 / -1' }} />
                                        <select className="setting-select" value={newClub.category} onChange={e => setNewClub(p => ({ ...p, category: e.target.value }))}>
                                            <option value="technical">Technical</option>
                                            <option value="cultural">Cultural</option>
                                            <option value="sports">Sports</option>
                                            <option value="arts">Arts</option>
                                            <option value="general">General</option>
                                        </select>
                                        <textarea placeholder="Club description..." value={newClub.description} onChange={e => setNewClub(p => ({ ...p, description: e.target.value }))} rows={2} style={{ ...inputStyle, gridColumn: '1 / -1', resize: 'vertical' }} />
                                        <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1' }}><i className="fas fa-paper-plane"></i> Create Club</button>
                                    </form>
                                </div>
                                <div className="glass-card">
                                    <h3><i className="fas fa-users" style={{ color: 'var(--cyan)', marginRight: 8 }}></i>Existing Clubs ({clubs.length})</h3>
                                    {clubs.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 12 }}>No clubs created yet.</p>}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                                        {clubs.map(club => (
                                            <div key={club.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                        <strong style={{ fontSize: 16, color: 'var(--text-primary)' }}>{club.name}</strong>
                                                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>{club.category}</span>
                                                    </div>
                                                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{club.description}</div>
                                                </div>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <button className="btn btn-sm btn-outline" onClick={() => handleManageMembers(club)}>
                                                        <i className="fas fa-users-cog"></i> Manage
                                                    </button>
                                                    <button className="btn btn-sm btn-danger" onClick={() => removeClub(club.id)}>
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {selectedClub && (
                                    <div className="glass-card" style={{ marginTop: 24, borderColor: 'var(--cyan)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                            <h3><i className="fas fa-id-badge" style={{ color: 'var(--yellow)', marginRight: 8 }}></i>Members: {selectedClub.name}</h3>
                                            <button className="btn btn-sm btn-outline" onClick={() => setSelectedClub(null)}><i className="fas fa-times"></i> Close</button>
                                        </div>

                                        {clubMembersList.length === 0 ? (
                                            <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>No members in this club yet.</p>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                {clubMembersList.map(member => (
                                                    <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                                                        <div>
                                                            <strong style={{ fontSize: 14, color: 'var(--cyan)' }}>{member.name}</strong>
                                                            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{member.email} • Joined: {new Date(member.joinedAt).toLocaleDateString()}</div>
                                                        </div>
                                                        <select
                                                            className="setting-select"
                                                            style={{ width: 'auto', padding: '6px 12px', fontSize: 13 }}
                                                            value={member.role}
                                                            onChange={(e) => handleUpdateRole(selectedClub.id, member.studentId, e.target.value)}
                                                        >
                                                            <option value="Member">Member</option>
                                                            <option value="President">President</option>
                                                            <option value="Vice President">Vice President</option>
                                                            <option value="Treasurer">Treasurer</option>
                                                            <option value="Secretary">Secretary</option>
                                                            <option value="Core Member">Core Member</option>
                                                        </select>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}


                                <h2 style={{ fontSize: 20, marginBottom: 16, marginTop: 40, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}><i className="fas fa-briefcase" style={{ color: 'var(--pink)' }}></i> Manage Placements</h2>

                                <div className="glass-card" style={{ marginBottom: 24 }}>
                                    <h3><i className="fas fa-plus-circle" style={{ color: 'var(--pink)', marginRight: 8 }}></i>Add Placement Opportunity</h3>
                                    <form onSubmit={addPlacement} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                                        <input placeholder="Company Name" value={newPlacement.companyName} onChange={e => setNewPlacement(p => ({ ...p, companyName: e.target.value }))} required style={{ ...inputStyle }} />
                                        <input placeholder="Role / Title" value={newPlacement.role} onChange={e => setNewPlacement(p => ({ ...p, role: e.target.value }))} required style={{ ...inputStyle }} />
                                        <input placeholder="CTC / Stipend (e.g., ₹15 LPA)" value={newPlacement.salary} onChange={e => setNewPlacement(p => ({ ...p, salary: e.target.value }))} required style={inputStyle} />
                                        <input type="date" value={newPlacement.deadline} onChange={e => setNewPlacement(p => ({ ...p, deadline: e.target.value }))} required style={{ ...inputStyle, colorScheme: theme === 'dark' ? 'dark' : 'light' }} />
                                        <input placeholder="Eligible Batch (e.g., 2025, All)" value={newPlacement.eligibleBatch} onChange={e => setNewPlacement(p => ({ ...p, eligibleBatch: e.target.value }))} style={inputStyle} />
                                        <select className="setting-select" value={newPlacement.type} onChange={e => setNewPlacement(p => ({ ...p, type: e.target.value }))}>
                                            <option value="Full-time">Full-time</option>
                                            <option value="Internship">Internship</option>
                                            <option value="Part-time">Part-time</option>
                                        </select>
                                        <textarea placeholder="Job description, requirements, etc..." value={newPlacement.description} onChange={e => setNewPlacement(p => ({ ...p, description: e.target.value }))} rows={3} style={{ ...inputStyle, gridColumn: '1 / -1', resize: 'vertical' }} />
                                        <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1' }}><i className="fas fa-paper-plane"></i> Create Placement Drive</button>
                                    </form>
                                </div>

                                <div className="glass-card">
                                    <h3><i className="fas fa-building" style={{ color: 'var(--cyan)', marginRight: 8 }}></i>Ongoing Drives ({placements.length})</h3>
                                    {placements.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 12 }}>No placements posted yet.</p>}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                                        {placements.map(p => (
                                            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                        <strong style={{ fontSize: 16, color: 'var(--text-primary)' }}>{p.companyName}</strong>
                                                        <span style={{ fontSize: 13, color: 'var(--cyan)', fontWeight: 600 }}>{p.role}</span>
                                                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: p.type === 'Internship' ? 'var(--pink)' : 'var(--purple)' }}>{p.type}</span>
                                                    </div>
                                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 16 }}>
                                                        <span><i className="fas fa-money-bill-wave"></i> {p.salary}</span>
                                                        <span style={{ color: p.deadline && new Date(p.deadline) < new Date() ? 'var(--red)' : 'inherit' }}><i className="fas fa-calendar-times"></i> {p.deadline ? new Date(p.deadline).toLocaleDateString() : 'N/A'}</span>
                                                    </div>
                                                </div>
                                                <button className="btn btn-sm btn-danger" onClick={() => removePlacement(p.id)}><i className="fas fa-trash"></i></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        )}

                        {/* ——— ROOMS ——— */}
                        {activeSection === 'rooms' && (
                            <div>
                                <div className="page-header"><h1><i className="fas fa-door-open"></i> Room Management</h1><p className="subtitle">Override room availability — changes are saved to database</p></div>
                                <div className="rooms-grid">
                                    {rooms.map(room => {
                                        const override = room.statusOverride;
                                        return (
                                            <div key={room.id} className={`room-card ${override === 'available' ? 'available' : override === 'occupied' ? 'occupied' : ''}`}>
                                                <div className="room-number">{room.number}</div>
                                                <div className="room-type">{room.type} · {room.building}</div>
                                                <div className="room-detail"><i className="fas fa-users"></i> {room.capacity} seats</div>
                                                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 12 }}>
                                                    <button className={`btn btn-sm ${override === 'available' ? 'btn-success' : 'btn-secondary'}`} onClick={() => toggleRoom(room.id, 'available')}>
                                                        <i className="fas fa-check"></i>
                                                    </button>
                                                    <button className={`btn btn-sm ${override === 'occupied' ? 'btn-danger' : 'btn-secondary'}`} onClick={() => toggleRoom(room.id, 'occupied')}>
                                                        <i className="fas fa-lock"></i>
                                                    </button>
                                                    <button className={`btn btn-sm btn-secondary`} onClick={() => toggleRoom(room.id, null)} title="Auto">
                                                        <i className="fas fa-magic"></i>
                                                    </button>
                                                </div>
                                                {override && <div style={{ marginTop: 8, fontSize: 11, color: override === 'available' ? 'var(--green)' : 'var(--red)', fontWeight: 600, textTransform: 'uppercase' }}>Manual: {override}</div>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ——— STUDENTS ——— */}
                        {activeSection === 'students' && (
                            <div>
                                <div className="page-header"><h1><i className="fas fa-user-graduate"></i> Registered Students</h1><p className="subtitle">Students who registered on the platform (from database)</p></div>
                                <div className="glass-card" style={{ marginBottom: 20 }}>
                                    <input placeholder="Search by name or email..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)} style={{ ...inputStyle, maxWidth: 400 }} />
                                </div>
                                <div className="glass-card">
                                    {filteredStudents.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>No students registered yet.</p>}
                                    <table className="schedule-table" style={{ width: '100%' }}>
                                        <thead>
                                            <tr><th>Student</th><th>Email</th><th>Role</th><th>Joined</th></tr>
                                        </thead>
                                        <tbody>
                                            {filteredStudents.map(s => (
                                                <tr key={s.id}>
                                                    <td style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px' }}>
                                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name}`} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                                                        <strong style={{ fontSize: 13 }}>{s.name || 'Unnamed'}</strong>
                                                    </td>
                                                    <td style={{ fontSize: 13, color: 'var(--text-dim)' }}>{s.email}</td>
                                                    <td><span style={{ fontSize: 12, fontWeight: 600, color: 'var(--cyan)', padding: '2px 8px', borderRadius: 4, background: 'rgba(0,212,255,0.1)' }}>{s.role}</span></td>
                                                    <td style={{ fontSize: 13 }}>{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ——— FACULTY ——— */}
                        {activeSection === 'faculty' && (
                            <div>
                                <div className="page-header"><h1><i className="fas fa-chalkboard-teacher"></i> Faculty Directory</h1><p className="subtitle">View faculty assignments and schedules</p></div>
                                <div className="grid-3">
                                    {[
                                        { name: 'Prof. Mehra', dept: 'CSE', subject: 'Data Structures', courses: 3, icon: 'fa-code', color: '#10b981' },
                                        { name: 'Dr. Kapoor', dept: 'CSE', subject: 'Machine Learning', courses: 2, icon: 'fa-brain', color: '#8b5cf6' },
                                        { name: 'Prof. Singh', dept: 'CSE', subject: 'Operating Systems', courses: 2, icon: 'fa-server', color: '#ec4899' },
                                        { name: 'Dr. Das', dept: 'ECE', subject: 'Computer Networks', courses: 3, icon: 'fa-network-wired', color: '#0ea5e9' },
                                        { name: 'Prof. Roy', dept: 'Math', subject: 'Probability & Stats', courses: 4, icon: 'fa-calculator', color: '#f59e0b' },
                                        { name: 'Dr. Jain', dept: 'Humanities', subject: 'Professional Ethics', courses: 2, icon: 'fa-balance-scale', color: '#f97316' },
                                    ].map((f, i) => (
                                        <div key={i} className="glass-card" style={{ animationDelay: `${i * 0.06}s`, animation: 'slideUp 0.5s var(--ease) both' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                                                <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: `${f.color}15`, display: 'grid', placeItems: 'center', color: f.color, fontSize: 20 }}>
                                                    <i className={`fas ${f.icon}`}></i>
                                                </div>
                                                <div><strong style={{ fontSize: 15 }}>{f.name}</strong><div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{f.dept}</div></div>
                                            </div>
                                            <div className="info-row"><i className="fas fa-book" style={{ color: 'var(--text-dim)' }}></i> {f.subject}</div>
                                            <div className="info-row"><i className="fas fa-layer-group" style={{ color: 'var(--text-dim)' }}></i> {f.courses} courses this semester</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ——— ANALYTICS ——— */}
                        {activeSection === 'analytics' && (
                            <div>
                                <div className="page-header"><h1><i className="fas fa-chart-bar"></i> Campus Analytics</h1><p className="subtitle">Data-driven insights across the campus</p></div>
                                <div className="dashboard-grid">
                                    <div className="glass-card">
                                        <h3><i className="fas fa-chart-pie" style={{ color: '#f472b6', marginRight: 8 }}></i>Attendance Distribution</h3>
                                        <ResponsiveContainer width="100%" height={220}>
                                            <PieChart>
                                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                                                    {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                                                </Pie>
                                                <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="glass-card">
                                        <h3><i className="fas fa-chart-bar" style={{ color: '#00d4ff', marginRight: 8 }}></i>Department Enrollment</h3>
                                        <ResponsiveContainer width="100%" height={220}>
                                            <BarChart data={deptData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
                                                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
                                                <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9' }} />
                                                <Bar dataKey="students" radius={[4, 4, 0, 0]}>
                                                    {deptData.map((d, i) => <Cell key={i} fill={d.color} />)}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ——— SETTINGS ——— */}
                        {activeSection === 'settings' && (
                            <div>
                                <div className="page-header"><h1><i className="fas fa-cog"></i> Admin Settings</h1><p className="subtitle">Configure campus system preferences</p></div>
                                <div className="glass-card">
                                    <div className="setting-item">
                                        <div className="setting-label"><strong>Dark Mode</strong><span>Toggle admin panel theme</span></div>
                                        <label className="toggle-switch"><input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} /><span className="toggle-slider"></span></label>
                                    </div>
                                    <div className="setting-item">
                                        <div className="setting-label"><strong>Auto Room Detection</strong><span>Use schedule-based room occupancy</span></div>
                                        <label className="toggle-switch"><input type="checkbox" defaultChecked /><span className="toggle-slider"></span></label>
                                    </div>
                                    <div className="setting-item">
                                        <div className="setting-label"><strong>Student Notifications</strong><span>Push announcements to students</span></div>
                                        <label className="toggle-switch"><input type="checkbox" defaultChecked /><span className="toggle-slider"></span></label>
                                    </div>
                                    <div className="setting-item">
                                        <div className="setting-label"><strong>Maintenance Mode</strong><span>Disable student portal temporarily</span></div>
                                        <label className="toggle-switch"><input type="checkbox" /><span className="toggle-slider"></span></label>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
