import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const API = 'http://localhost:5000/api';

export default function AdminPanel() {
    const { user, token } = useAuth();
    const { showToast } = useApp();
    const [activeTab, setActiveTab] = useState('announcements');

    // ─── Announcements ───
    const [announcements, setAnnouncements] = useState([]);
    const [newAnn, setNewAnn] = useState({ title: '', text: '', priority: 'normal' });

    useEffect(() => {
        if (token) {
            fetch(`${API}/announcements`, { headers: { Authorization: `Bearer ${token}` } })
                .then(r => r.json()).then(setAnnouncements).catch(console.error);
        }
    }, [token]);

    const addAnnouncement = async (e) => {
        e.preventDefault();
        if (!newAnn.title.trim()) return;
        try {
            const res = await fetch(`${API}/announcements`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(newAnn)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed');
            setAnnouncements(prev => [data, ...prev]);
            setNewAnn({ title: '', text: '', priority: 'normal' });
            showToast('📢 Announcement published & students notified!', 'success', 2500);
        } catch (err) {
            console.error('Announcement error:', err);
            showToast(`Failed: ${err.message}`, 'error');
        }
    };

    const deleteAnnouncement = async (id) => {
        try {
            await fetch(`${API}/announcements/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnnouncements(prev => prev.filter(a => a.id !== id));
            showToast('🗑️ Announcement removed', 'warning', 2000);
        } catch (err) {
            console.error(err);
        }
    };

    // ─── Events ───
    const [events, setEvents] = useState([]);
    const [newEvent, setNewEvent] = useState({ title: '', date: '', venue: '', category: 'academic', description: '' });

    useEffect(() => {
        if (token) {
            fetch(`${API}/events`, { headers: { Authorization: `Bearer ${token}` } })
                .then(r => r.json()).then(setEvents).catch(console.error);
        }
    }, [token]);

    const addEvent = async (e) => {
        e.preventDefault();
        if (!newEvent.title.trim()) return;
        try {
            const res = await fetch(`${API}/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(newEvent)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed');
            setEvents(prev => [data, ...prev]);
            setNewEvent({ title: '', date: '', venue: '', category: 'academic', description: '' });
            showToast('🎉 Event created & students notified!', 'success', 2500);
        } catch (err) {
            console.error('Event error:', err);
            showToast(`Failed: ${err.message}`, 'error');
        }
    };

    const deleteEvent = async (id) => {
        try {
            await fetch(`${API}/events/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvents(prev => prev.filter(ev => ev.id !== id));
            showToast('🗑️ Event removed', 'warning', 2000);
        } catch (err) {
            console.error(err);
        }
    };

    // ─── Rooms ───
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        if (token) {
            fetch(`${API}/rooms`, { headers: { Authorization: `Bearer ${token}` } })
                .then(r => r.json()).then(setRooms).catch(console.error);
        }
    }, [token]);

    const toggleRoomOverride = async (roomId, newStatus) => {
        try {
            await fetch(`${API}/rooms/${roomId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ statusOverride: newStatus })
            });
            setRooms(prev => prev.map(r => r.id === roomId ? { ...r, statusOverride: newStatus } : r));
            showToast(`🚪 Room ${roomId} → ${newStatus || 'Auto'}`, 'info', 2000);
        } catch (err) {
            console.error(err);
        }
    };

    // ─── Students ───
    const [students, setStudents] = useState([]);

    useEffect(() => {
        if (token) {
            fetch(`${API}/admin/students`, { headers: { Authorization: `Bearer ${token}` } })
                .then(r => r.json()).then(setStudents).catch(console.error);
        }
    }, [token]);

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

            {/* ═══ Announcements Tab ═══ */}
            {activeTab === 'announcements' && (
                <div>
                    <div className="glass-card" style={{ marginBottom: 24 }}>
                        <h3><i className="fas fa-plus-circle" style={{ color: 'var(--cyan)', marginRight: 8 }}></i>New Announcement</h3>
                        <form onSubmit={addAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                            <input placeholder="Title" value={newAnn.title} onChange={e => setNewAnn(p => ({ ...p, title: e.target.value }))} required
                                style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
                            <textarea placeholder="Announcement text..." value={newAnn.text} onChange={e => setNewAnn(p => ({ ...p, text: e.target.value }))} rows={3}
                                style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', resize: 'vertical' }} />
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
                        {announcements.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 12 }}>No announcements yet. Create one above!</p>}
                        {announcements.map(a => (
                            <div key={a.id} className={`announce-item ${a.priority === 'urgent' ? 'urgent' : ''}`}>
                                <div className="announce-dot"></div>
                                <div style={{ flex: 1 }}>
                                    <strong>{a.title}</strong>
                                    <p>{a.text}</p>
                                    <span className="announce-time">{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''}</span>
                                </div>
                                <button className="btn btn-sm btn-danger" onClick={() => deleteAnnouncement(a.id)}>
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ═══ Events Tab ═══ */}
            {activeTab === 'events' && (
                <div>
                    <div className="glass-card" style={{ marginBottom: 24 }}>
                        <h3><i className="fas fa-plus-circle" style={{ color: 'var(--purple)', marginRight: 8 }}></i>Create Event</h3>
                        <form onSubmit={addEvent} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                            <input placeholder="Event Title" value={newEvent.title} onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))} required
                                style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
                            <input type="date" value={newEvent.date} onChange={e => setNewEvent(p => ({ ...p, date: e.target.value }))} required
                                style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
                            <input placeholder="Venue" value={newEvent.venue} onChange={e => setNewEvent(p => ({ ...p, venue: e.target.value }))}
                                style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
                            <select className="setting-select" value={newEvent.category} onChange={e => setNewEvent(p => ({ ...p, category: e.target.value }))}>
                                <option value="academic">Academic</option>
                                <option value="cultural">Cultural</option>
                                <option value="sports">Sports</option>
                                <option value="workshop">Workshop</option>
                            </select>
                            <textarea placeholder="Description (optional)" value={newEvent.description} onChange={e => setNewEvent(p => ({ ...p, description: e.target.value }))} rows={2}
                                style={{ gridColumn: '1 / -1', padding: '10px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', resize: 'vertical' }} />
                            <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1' }}><i className="fas fa-plus"></i> Create Event</button>
                        </form>
                    </div>

                    <div className="glass-card">
                        <h3><i className="fas fa-calendar" style={{ color: 'var(--pink)', marginRight: 8 }}></i>Managed Events ({events.length})</h3>
                        {events.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 12 }}>No events yet.</p>}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                            {events.map(ev => (
                                <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                                    <div>
                                        <strong style={{ fontSize: 14 }}>{ev.title}</strong>
                                        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
                                            {ev.date ? new Date(ev.date).toLocaleDateString() : ''} · {ev.venue} · {ev.category}
                                        </div>
                                    </div>
                                    <button className="btn btn-sm btn-danger" onClick={() => deleteEvent(ev.id)}>
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Rooms Override Tab ═══ */}
            {activeTab === 'rooms' && (
                <div className="glass-card">
                    <h3><i className="fas fa-door-open" style={{ color: 'var(--green)', marginRight: 8 }}></i>Room Status Override</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Override room availability manually. Set to "Auto" to use schedule-based detection.</p>
                    {rooms.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>No rooms in database.</p>}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {rooms.map(room => (
                            <div key={room.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                                <div>
                                    <strong style={{ fontSize: 16 }}>Room {room.number}</strong>
                                    <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
                                        {room.building} · {room.type} · Capacity: {room.capacity} ·
                                        Current: {room.statusOverride ? <span style={{ color: room.statusOverride === 'available' ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>{room.statusOverride}</span> : <span style={{ color: 'var(--cyan)' }}>Auto</span>}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button className={`btn btn-sm ${room.statusOverride === 'available' ? 'btn-success' : 'btn-secondary'}`} onClick={() => toggleRoomOverride(room.id, 'available')}>
                                        <i className="fas fa-check"></i> Available
                                    </button>
                                    <button className={`btn btn-sm ${room.statusOverride === 'occupied' ? 'btn-danger' : 'btn-secondary'}`} onClick={() => toggleRoomOverride(room.id, 'occupied')}>
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

            {/* ═══ Students Tab — from database ═══ */}
            {activeTab === 'students' && (
                <div className="glass-card">
                    <h3><i className="fas fa-users" style={{ color: 'var(--purple)', marginRight: 8 }}></i>Registered Students ({students.length})</h3>
                    {students.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 12 }}>No students registered yet.</p>}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                        {students.map(s => (
                            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name || s.email}`} alt="" style={{ width: 36, height: 36, borderRadius: '50%' }} />
                                    <div>
                                        <strong style={{ fontSize: 14 }}>{s.name || 'Unnamed'}</strong>
                                        <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{s.email} · Joined {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A'}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ═══ Analytics Tab ═══ */}
            {activeTab === 'analytics' && (
                <div className="stats-grid">
                    {[
                        { icon: 'fa-user-graduate', label: 'Registered Students', value: students.length, color: 'var(--cyan)' },
                        { icon: 'fa-bullhorn', label: 'Announcements', value: announcements.length, color: 'var(--amber)' },
                        { icon: 'fa-calendar-check', label: 'Events', value: events.length, color: 'var(--pink)' },
                        { icon: 'fa-door-open', label: 'Total Rooms', value: rooms.length, color: 'var(--green)' },
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
