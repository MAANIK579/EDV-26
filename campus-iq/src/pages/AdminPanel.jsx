import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const initialAnnouncements = [
    { id: 1, title: 'Mid-Semester Exams', text: 'Schedule released — starts March 10.', priority: 'urgent', date: '2026-02-27' },
    { id: 2, title: 'Hackathon Registrations Open', text: '36-hour campus hackathon on March 15-16.', priority: 'normal', date: '2026-02-27' },
];

const initialEvents = [
    { id: 1, name: 'Campus Hackathon', date: 'Mar 15-16', venue: 'Auditorium', category: 'workshop' },
    { id: 2, name: 'SPANDAN Fest', date: 'Mar 8', venue: 'Main Ground', category: 'cultural' },
];

const initialRooms = [
    { id: 'R101', number: '101', status: 'auto', override: null },
    { id: 'R314', number: '314', status: 'auto', override: null },
    { id: 'R402', number: '402', status: 'auto', override: null },
];

export default function AdminPanel() {
    const { user } = useAuth();
    const { showToast } = useApp();
    const [activeTab, setActiveTab] = useState('announcements');

    // Announcement management
    const [announcements, setAnnouncements] = useState(initialAnnouncements);
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', text: '', priority: 'normal' });

    const addAnnouncement = (e) => {
        e.preventDefault();
        if (!newAnnouncement.title.trim()) return;
        setAnnouncements(prev => [{ ...newAnnouncement, id: Date.now(), date: new Date().toISOString().split('T')[0] }, ...prev]);
        setNewAnnouncement({ title: '', text: '', priority: 'normal' });
        showToast('📢 Announcement published!', 'success', 2500);
    };

    // Event management
    const [events, setEvents] = useState(initialEvents);
    const [newEvent, setNewEvent] = useState({ name: '', date: '', venue: '', category: 'academic' });

    const addEvent = (e) => {
        e.preventDefault();
        if (!newEvent.name.trim()) return;
        setEvents(prev => [{ ...newEvent, id: Date.now() }, ...prev]);
        setNewEvent({ name: '', date: '', venue: '', category: 'academic' });
        showToast('🎉 Event created!', 'success', 2500);
    };

    // Room override
    const [rooms, setRooms] = useState(initialRooms);

    const toggleRoomOverride = (id, newStatus) => {
        setRooms(prev => prev.map(r => r.id === id ? { ...r, override: newStatus } : r));
        showToast(`🚪 Room ${id.replace('R', '')} set to ${newStatus}`, 'info', 2000);
    };

    const tabs = [
        { id: 'announcements', icon: 'fa-bullhorn', label: 'Announcements' },
        { id: 'events', icon: 'fa-calendar-plus', label: 'Events' },
        { id: 'rooms', icon: 'fa-door-open', label: 'Room Override' },
        { id: 'students', icon: 'fa-users', label: 'Students' },
        { id: 'analytics', icon: 'fa-chart-bar', label: 'Analytics' },
    ];

    return (
        <div className="page-transition">
            <div className="page-header">
                <h1><i className="fas fa-user-shield"></i> Admin Panel</h1>
                <p className="subtitle">Manage campus data, events, and announcements — logged in as <strong>{user?.name}</strong></p>
            </div>

            {/* Tab Bar */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`filter-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <i className={`fas ${tab.icon}`} style={{ marginRight: 6 }}></i>{tab.label}
                    </button>
                ))}
            </div>

            {/* Announcements Tab */}
            {activeTab === 'announcements' && (
                <div>
                    <div className="glass-card" style={{ marginBottom: 24 }}>
                        <h3><i className="fas fa-plus-circle" style={{ color: 'var(--cyan)', marginRight: 8 }}></i>New Announcement</h3>
                        <form onSubmit={addAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                            <input placeholder="Title" value={newAnnouncement.title} onChange={e => setNewAnnouncement(p => ({ ...p, title: e.target.value }))} required
                                style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
                            <textarea placeholder="Announcement text..." value={newAnnouncement.text} onChange={e => setNewAnnouncement(p => ({ ...p, text: e.target.value }))} rows={3}
                                style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', resize: 'vertical' }} />
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <select className="setting-select" value={newAnnouncement.priority} onChange={e => setNewAnnouncement(p => ({ ...p, priority: e.target.value }))}>
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
                                <div style={{ flex: 1 }}>
                                    <strong>{a.title}</strong>
                                    <p>{a.text}</p>
                                    <span className="announce-time">{a.date}</span>
                                </div>
                                <button className="btn btn-sm btn-danger" onClick={() => { setAnnouncements(prev => prev.filter(x => x.id !== a.id)); showToast('🗑️ Announcement removed', 'warning', 2000); }}>
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
                <div>
                    <div className="glass-card" style={{ marginBottom: 24 }}>
                        <h3><i className="fas fa-plus-circle" style={{ color: 'var(--purple)', marginRight: 8 }}></i>Create Event</h3>
                        <form onSubmit={addEvent} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                            <input placeholder="Event Name" value={newEvent.name} onChange={e => setNewEvent(p => ({ ...p, name: e.target.value }))} required
                                style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
                            <input placeholder="Date (e.g. Mar 15)" value={newEvent.date} onChange={e => setNewEvent(p => ({ ...p, date: e.target.value }))} required
                                style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
                            <input placeholder="Venue" value={newEvent.venue} onChange={e => setNewEvent(p => ({ ...p, venue: e.target.value }))}
                                style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
                            <select className="setting-select" value={newEvent.category} onChange={e => setNewEvent(p => ({ ...p, category: e.target.value }))}>
                                <option value="academic">Academic</option>
                                <option value="cultural">Cultural</option>
                                <option value="sports">Sports</option>
                                <option value="workshop">Workshop</option>
                            </select>
                            <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1' }}><i className="fas fa-plus"></i> Create Event</button>
                        </form>
                    </div>

                    <div className="glass-card">
                        <h3><i className="fas fa-calendar" style={{ color: 'var(--pink)', marginRight: 8 }}></i>Managed Events ({events.length})</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                            {events.map(ev => (
                                <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                                    <div>
                                        <strong style={{ fontSize: 14 }}>{ev.name}</strong>
                                        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{ev.date} · {ev.venue} · {ev.category}</div>
                                    </div>
                                    <button className="btn btn-sm btn-danger" onClick={() => { setEvents(prev => prev.filter(x => x.id !== ev.id)); showToast('🗑️ Event removed', 'warning', 2000); }}>
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Rooms Override Tab */}
            {activeTab === 'rooms' && (
                <div className="glass-card">
                    <h3><i className="fas fa-door-open" style={{ color: 'var(--green)', marginRight: 8 }}></i>Room Status Override</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Override room availability manually. Set to "Auto" to use schedule-based detection.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {rooms.map(room => (
                            <div key={room.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                                <div>
                                    <strong style={{ fontSize: 16 }}>Room {room.number}</strong>
                                    <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
                                        Current: {room.override ? <span style={{ color: room.override === 'available' ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>{room.override}</span> : <span style={{ color: 'var(--cyan)' }}>Auto (schedule)</span>}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button className={`btn btn-sm ${room.override === 'available' ? 'btn-success' : 'btn-secondary'}`} onClick={() => toggleRoomOverride(room.id, 'available')}>
                                        <i className="fas fa-check"></i> Available
                                    </button>
                                    <button className={`btn btn-sm ${room.override === 'occupied' ? 'btn-danger' : 'btn-secondary'}`} onClick={() => toggleRoomOverride(room.id, 'occupied')}>
                                        <i className="fas fa-lock"></i> Occupied
                                    </button>
                                    <button className={`btn btn-sm btn-secondary`} onClick={() => toggleRoomOverride(room.id, null)}>
                                        Auto
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Students Tab */}
            {activeTab === 'students' && (
                <div className="glass-card">
                    <h3><i className="fas fa-users" style={{ color: 'var(--purple)', marginRight: 8 }}></i>Student Directory</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                        {[
                            { name: 'Rahul Sharma', roll: '2022CSE1234', dept: 'CSE', sem: 6, gpa: 8.9, attendance: '87%' },
                            { name: 'Priya Patel', roll: '2023ECE5678', dept: 'ECE', sem: 4, gpa: 9.1, attendance: '91%' },
                            { name: 'Amit Kumar', roll: '2022CSE2345', dept: 'CSE', sem: 6, gpa: 8.5, attendance: '82%' },
                            { name: 'Sneha Gupta', roll: '2023IT3456', dept: 'IT', sem: 4, gpa: 9.3, attendance: '94%' },
                            { name: 'Vikram Singh', roll: '2022ME4567', dept: 'ME', sem: 6, gpa: 7.8, attendance: '78%' },
                        ].map(s => (
                            <div key={s.roll} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name}`} alt="" style={{ width: 36, height: 36, borderRadius: '50%' }} />
                                    <div>
                                        <strong style={{ fontSize: 14 }}>{s.name}</strong>
                                        <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{s.roll} · {s.dept} · Sem {s.sem}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
                                    <span style={{ color: 'var(--cyan)' }}>GPA: <strong>{s.gpa}</strong></span>
                                    <span style={{ color: parseInt(s.attendance) > 85 ? 'var(--green)' : 'var(--amber)' }}>Att: <strong>{s.attendance}</strong></span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
                <div className="stats-grid">
                    {[
                        { icon: 'fa-user-graduate', label: 'Total Students', value: '2,450', color: 'var(--cyan)' },
                        { icon: 'fa-chalkboard-teacher', label: 'Faculty', value: '185', color: 'var(--purple)' },
                        { icon: 'fa-door-open', label: 'Active Rooms', value: '18', color: 'var(--green)' },
                        { icon: 'fa-calendar-check', label: 'Events This Month', value: '12', color: 'var(--pink)' },
                        { icon: 'fa-book', label: 'Library Books', value: '50K+', color: 'var(--amber)' },
                        { icon: 'fa-chart-line', label: 'Avg Attendance', value: '87%', color: 'var(--orange)' },
                    ].map((stat, i) => (
                        <div key={i} className="stat-card" style={{ '--accent': stat.color, animationDelay: `${i * 0.08}s` }}>
                            <div className="stat-icon" style={{ color: stat.color }}><i className={`fas ${stat.icon}`}></i></div>
                            <div>
                                <div className="stat-value" style={{ fontSize: 28 }}>{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
