import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

/* ============================================
   FULL-SCREEN ADMIN DASHBOARD
   Completely separate from the student panel
   ============================================ */

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

const initialAnnouncements = [
    { id: 1, title: 'Mid-Semester Exams', text: 'Schedule released — starts March 10.', priority: 'urgent', date: '2026-02-27' },
    { id: 2, title: 'Hackathon Registrations Open', text: '36-hour campus hackathon on March 15-16.', priority: 'normal', date: '2026-02-27' },
    { id: 3, title: 'Library Hours Extended', text: 'Open until 11 PM during exam preparation.', priority: 'normal', date: '2026-02-26' },
];

const initialEvents = [
    { id: 1, name: 'Campus Hackathon 2026', date: 'Mar 15-16', venue: 'Auditorium', category: 'workshop' },
    { id: 2, name: 'SPANDAN Cultural Fest', date: 'Mar 8', venue: 'Main Ground', category: 'cultural' },
    { id: 3, name: 'AI/ML Guest Lecture', date: 'Mar 3', venue: 'Room 301', category: 'academic' },
    { id: 4, name: 'Annual Sports Day', date: 'Feb 28', venue: 'Sports Complex', category: 'sports' },
];

const allRooms = [
    { id: 'R101', number: '101', type: 'Classroom', building: 'Main Block', capacity: 60 },
    { id: 'R102', number: '102', type: 'Classroom', building: 'Main Block', capacity: 60 },
    { id: 'R105', number: '105', type: 'Classroom', building: 'Main Block', capacity: 40 },
    { id: 'R201', number: '201', type: 'Seminar Hall', building: 'Main Block', capacity: 100 },
    { id: 'R301', number: '301', type: 'Smart Classroom', building: 'Main Block', capacity: 50 },
    { id: 'R314', number: '314', type: 'Classroom', building: 'Main Block', capacity: 45 },
    { id: 'R402', number: '402', type: 'Conference Room', building: 'Main Block', capacity: 30 },
    { id: 'L204', number: 'Lab 204', type: 'AI/ML Lab', building: 'CS Block', capacity: 35 },
    { id: 'L301', number: 'Lab 301', type: 'Programming Lab', building: 'CS Block', capacity: 40 },
    { id: 'L303', number: 'Lab 303', type: 'IoT Lab', building: 'CS Block', capacity: 25 },
];

const students = [
    { name: 'Rahul Sharma', roll: '2022CSE1234', dept: 'CSE', sem: 6, gpa: 8.9, attendance: 87 },
    { name: 'Priya Patel', roll: '2023ECE5678', dept: 'ECE', sem: 4, gpa: 9.1, attendance: 91 },
    { name: 'Amit Kumar', roll: '2022CSE2345', dept: 'CSE', sem: 6, gpa: 8.5, attendance: 82 },
    { name: 'Sneha Gupta', roll: '2023IT3456', dept: 'IT', sem: 4, gpa: 9.3, attendance: 94 },
    { name: 'Vikram Singh', roll: '2022ME4567', dept: 'ME', sem: 6, gpa: 7.8, attendance: 78 },
    { name: 'Ananya Reddy', roll: '2023CSE6789', dept: 'CSE', sem: 4, gpa: 9.0, attendance: 92 },
    { name: 'Rohan Joshi', roll: '2022ECE7890', dept: 'ECE', sem: 6, gpa: 8.2, attendance: 85 },
    { name: 'Kavya Nair', roll: '2023CE8901', dept: 'CE', sem: 4, gpa: 8.7, attendance: 89 },
];

const adminNavItems = [
    { id: 'overview', icon: 'fa-th-large', label: 'Overview' },
    { id: 'announcements', icon: 'fa-bullhorn', label: 'Announcements' },
    { id: 'events', icon: 'fa-calendar-plus', label: 'Events' },
    { id: 'rooms', icon: 'fa-door-open', label: 'Room Management' },
    { id: 'students', icon: 'fa-user-graduate', label: 'Students' },
    { id: 'faculty', icon: 'fa-chalkboard-teacher', label: 'Faculty' },
    { id: 'analytics', icon: 'fa-chart-bar', label: 'Analytics' },
    { id: 'settings', icon: 'fa-cog', label: 'Settings' },
];

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme, showToast } = useApp();
    const [activeSection, setActiveSection] = useState('overview');

    // State for CRUD operations
    const [announcements, setAnnouncements] = useState(initialAnnouncements);
    const [newAnn, setNewAnn] = useState({ title: '', text: '', priority: 'normal' });
    const [events, setEvents] = useState(initialEvents);
    const [newEvt, setNewEvt] = useState({ name: '', date: '', venue: '', category: 'academic' });
    const [roomOverrides, setRoomOverrides] = useState({});
    const [studentSearch, setStudentSearch] = useState('');

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

    // Handlers
    const addAnnouncement = (e) => {
        e.preventDefault();
        if (!newAnn.title.trim()) return;
        setAnnouncements(prev => [{ ...newAnn, id: Date.now(), date: new Date().toISOString().split('T')[0] }, ...prev]);
        setNewAnn({ title: '', text: '', priority: 'normal' });
        showToast('📢 Announcement published!', 'success');
    };

    const addEvent = (e) => {
        e.preventDefault();
        if (!newEvt.name.trim()) return;
        setEvents(prev => [{ ...newEvt, id: Date.now() }, ...prev]);
        setNewEvt({ name: '', date: '', venue: '', category: 'academic' });
        showToast('🎉 Event created!', 'success');
    };

    const toggleRoom = (id, status) => {
        setRoomOverrides(prev => ({ ...prev, [id]: prev[id] === status ? null : status }));
        showToast(`🚪 Room ${id.replace('R', '').replace('L', 'Lab ')} → ${status || 'Auto'}`, 'info', 2000);
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.roll.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.dept.toLowerCase().includes(studentSearch.toLowerCase())
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
                            <span className="user-role">{user?.designation}</span>
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
                                        { icon: 'fa-user-graduate', label: 'Total Students', value: '2,450', color: '#10b981' },
                                        { icon: 'fa-chalkboard-teacher', label: 'Faculty', value: '185', color: '#8b5cf6' },
                                        { icon: 'fa-door-open', label: 'Active Rooms', value: '18', color: '#0ea5e9' },
                                        { icon: 'fa-calendar-check', label: 'Events This Month', value: '12', color: '#ec4899' },
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

                                {/* Recent activity */}
                                <div className="glass-card">
                                    <h3><i className="fas fa-history" style={{ color: '#fbbf24', marginRight: 8 }}></i>Recent Activity</h3>
                                    {[
                                        { icon: 'fa-user-plus', text: 'New student registration: Ananya Reddy (CSE)', time: '10 min ago', color: '#34d399' },
                                        { icon: 'fa-bullhorn', text: 'Announcement published: Mid-Semester Exams', time: '2 hours ago', color: '#ef4444' },
                                        { icon: 'fa-calendar-check', text: 'Event created: Campus Hackathon 2026', time: '5 hours ago', color: '#7c3aed' },
                                        { icon: 'fa-door-open', text: 'Room 402 marked as maintenance', time: '1 day ago', color: '#fbbf24' },
                                    ].map((a, i) => (
                                        <div key={i} className="announce-item">
                                            <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: `${a.color}15`, display: 'grid', placeItems: 'center', color: a.color, fontSize: 14, flexShrink: 0 }}>
                                                <i className={`fas ${a.icon}`}></i>
                                            </div>
                                            <div style={{ flex: 1 }}><strong style={{ fontSize: 13 }}>{a.text}</strong><span className="announce-time">{a.time}</span></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ——— ANNOUNCEMENTS ——— */}
                        {activeSection === 'announcements' && (
                            <div>
                                <div className="page-header"><h1><i className="fas fa-bullhorn"></i> Manage Announcements</h1><p className="subtitle">Create, edit, and publish campus-wide announcements</p></div>
                                <div className="glass-card" style={{ marginBottom: 24 }}>
                                    <h3><i className="fas fa-plus-circle" style={{ color: 'var(--cyan)', marginRight: 8 }}></i>New Announcement</h3>
                                    <form onSubmit={addAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                                        <input placeholder="Announcement title" value={newAnn.title} onChange={e => setNewAnn(p => ({ ...p, title: e.target.value }))} required style={inputStyle} />
                                        <textarea placeholder="Announcement details..." value={newAnn.text} onChange={e => setNewAnn(p => ({ ...p, text: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                            <select className="setting-select" value={newAnn.priority} onChange={e => setNewAnn(p => ({ ...p, priority: e.target.value }))}>
                                                <option value="normal">Normal Priority</option>
                                                <option value="urgent">🔴 Urgent</option>
                                            </select>
                                            <button type="submit" className="btn btn-primary"><i className="fas fa-paper-plane"></i> Publish</button>
                                        </div>
                                    </form>
                                </div>
                                <div className="glass-card">
                                    <h3><i className="fas fa-list" style={{ color: 'var(--amber)', marginRight: 8 }}></i>Active Announcements ({announcements.length})</h3>
                                    {announcements.map(a => (
                                        <div key={a.id} className={`announce-item ${a.priority === 'urgent' ? 'urgent' : ''}`}>
                                            <div className="announce-dot"></div>
                                            <div style={{ flex: 1 }}><strong>{a.title}</strong><p>{a.text}</p><span className="announce-time">{a.date}</span></div>
                                            <button className="btn btn-sm btn-danger" onClick={() => { setAnnouncements(prev => prev.filter(x => x.id !== a.id)); showToast('🗑️ Removed', 'warning'); }}>
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
                                <div className="page-header"><h1><i className="fas fa-calendar-plus"></i> Manage Events</h1><p className="subtitle">Create and organize campus events</p></div>
                                <div className="glass-card" style={{ marginBottom: 24 }}>
                                    <h3><i className="fas fa-plus-circle" style={{ color: 'var(--purple)', marginRight: 8 }}></i>Create Event</h3>
                                    <form onSubmit={addEvent} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                                        <input placeholder="Event Name" value={newEvt.name} onChange={e => setNewEvt(p => ({ ...p, name: e.target.value }))} required style={inputStyle} />
                                        <input placeholder="Date (e.g. Mar 15)" value={newEvt.date} onChange={e => setNewEvt(p => ({ ...p, date: e.target.value }))} required style={inputStyle} />
                                        <input placeholder="Venue" value={newEvt.venue} onChange={e => setNewEvt(p => ({ ...p, venue: e.target.value }))} style={inputStyle} />
                                        <select className="setting-select" value={newEvt.category} onChange={e => setNewEvt(p => ({ ...p, category: e.target.value }))}>
                                            <option value="academic">Academic</option><option value="cultural">Cultural</option><option value="sports">Sports</option><option value="workshop">Workshop</option>
                                        </select>
                                        <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1' }}><i className="fas fa-plus"></i> Create Event</button>
                                    </form>
                                </div>
                                <div className="glass-card">
                                    <h3><i className="fas fa-calendar" style={{ color: 'var(--pink)', marginRight: 8 }}></i>Events ({events.length})</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                                        {events.map(ev => (
                                            <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                                                <div><strong style={{ fontSize: 14 }}>{ev.name}</strong><div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{ev.date} · {ev.venue} · {ev.category}</div></div>
                                                <button className="btn btn-sm btn-danger" onClick={() => { setEvents(prev => prev.filter(x => x.id !== ev.id)); showToast('🗑️ Removed', 'warning'); }}><i className="fas fa-trash"></i></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ——— ROOMS ——— */}
                        {activeSection === 'rooms' && (
                            <div>
                                <div className="page-header"><h1><i className="fas fa-door-open"></i> Room Management</h1><p className="subtitle">Override room availability or set maintenance mode</p></div>
                                <div className="rooms-grid">
                                    {allRooms.map(room => {
                                        const override = roomOverrides[room.id];
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
                                <div className="page-header"><h1><i className="fas fa-user-graduate"></i> Student Directory</h1><p className="subtitle">View and manage student records</p></div>
                                <div className="glass-card" style={{ marginBottom: 20 }}>
                                    <input placeholder="Search by name, roll number, or department..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)} style={{ ...inputStyle, maxWidth: 400 }} />
                                </div>
                                <div className="glass-card">
                                    <table className="schedule-table" style={{ width: '100%' }}>
                                        <thead>
                                            <tr><th>Student</th><th>Roll No</th><th>Dept</th><th>Sem</th><th>GPA</th><th>Attendance</th><th>Status</th></tr>
                                        </thead>
                                        <tbody>
                                            {filteredStudents.map(s => (
                                                <tr key={s.roll}>
                                                    <td style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px' }}>
                                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name}`} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                                                        <strong style={{ fontSize: 13 }}>{s.name}</strong>
                                                    </td>
                                                    <td style={{ fontSize: 13, color: 'var(--text-dim)' }}>{s.roll}</td>
                                                    <td><span style={{ fontSize: 12, fontWeight: 600, color: 'var(--cyan)', padding: '2px 8px', borderRadius: 4, background: 'rgba(0,212,255,0.1)' }}>{s.dept}</span></td>
                                                    <td style={{ fontSize: 13 }}>{s.sem}</td>
                                                    <td style={{ fontSize: 13, fontWeight: 700 }}>{s.gpa}</td>
                                                    <td style={{ fontSize: 13, fontWeight: 600, color: s.attendance >= 85 ? 'var(--green)' : s.attendance >= 75 ? 'var(--amber)' : 'var(--red)' }}>{s.attendance}%</td>
                                                    <td><span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 'var(--radius-xl)', background: s.attendance >= 75 ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)', color: s.attendance >= 75 ? 'var(--green)' : 'var(--red)' }}>{s.attendance >= 75 ? 'Active' : 'Low Att.'}</span></td>
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
