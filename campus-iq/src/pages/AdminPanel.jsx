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

    // ─── Clubs ───
    const [clubs, setClubs] = useState([]);
    const [newClub, setNewClub] = useState({ name: '', description: '', category: 'technical' });
    const [selectedClub, setSelectedClub] = useState(null);
    const [clubMembersList, setClubMembersList] = useState([]);

    // ─── Placements ───
    const [placements, setPlacements] = useState([]);
    const [newPlacement, setNewPlacement] = useState({ companyName: '', role: '', salary: '', deadline: '', type: 'Full-time', description: '', eligibleBatch: '' });

    useEffect(() => {
        if (token) {
            fetch(`${API}/announcements`, { headers: { Authorization: `Bearer ${token}` } })
                .then(r => r.json()).then(setAnnouncements).catch(console.error);

            fetch(`${API}/placements`, { headers: { Authorization: `Bearer ${token}` } })
                .then(r => r.json()).then(setPlacements).catch(console.error);
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

            fetch(`${API}/clubs`, { headers: { Authorization: `Bearer ${token}` } })
                .then(r => r.json()).then(setClubs).catch(console.error);
        }
    }, [token]);

    const addClub = async (e) => {
        e.preventDefault();
        if (!newClub.name.trim()) return;
        try {
            const res = await fetch(`${API}/clubs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(newClub)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed');
            setClubs(prev => [data, ...prev]);
            setNewClub({ name: '', description: '', category: 'technical' });
            showToast('🧩 Club created & students notified!', 'success', 2500);
        } catch (err) {
            console.error('Club error:', err);
            showToast(`Failed: ${err.message}`, 'error');
        }
    };

    const handleManageMembers = async (club) => {
        setSelectedClub(club);
        try {
            const res = await fetch(`${API}/clubs/${club.id}/members`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (res.ok) setClubMembersList(data);
            else showToast('Failed to fetch members', 'error');
        } catch (err) { showToast('Network error', 'error'); }
    };

    const handleUpdateRole = async (clubId, studentId, role) => {
        try {
            const res = await fetch(`${API}/clubs/${clubId}/members/${studentId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ role })
            });
            if (res.ok) {
                showToast('Role updated successfully', 'success');
                setClubMembersList(prev => prev.map(m => m.studentId === studentId ? { ...m, role } : m));
            } else {
                showToast('Failed to update role', 'error');
            }
        } catch (err) { showToast('Network error', 'error'); }
    };



    const handleScheduleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('schedule', file);

        try {
            const res = await fetch(`${API}/rooms/schedule`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                showToast('Schedule PDF uploaded and parsed!', 'success');
                fetchData(); // Refresh rooms to pull new schedules
            } else {
                showToast(data.error || 'Failed to upload schedule.', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Network error while uploading PDF.', 'error');
        }
    };

    const tabs = [
        { id: 'announcements', icon: 'fa-bullhorn', label: 'Announcements' },
        { id: 'events', icon: 'fa-calendar-plus', label: 'Events' },
        { id: 'hub', icon: 'fa-layer-group', label: 'Campus Hub' },
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

            {/* ═══ Campus Hub Tab ═══ */}
            {activeTab === 'hub' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24, alignItems: 'flex-start' }}>

                    {/* ——— CLUBS SECTION ——— */}
                    <div className="glass-card">
                        <h3><i className="fas fa-plus-circle" style={{ color: 'var(--purple)', marginRight: 8 }}></i>Create New Club</h3>
                        <form onSubmit={addClub} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <input type="text" placeholder="Club Name" value={newClub.name} onChange={e => setNewClub({ ...newClub, name: e.target.value })} required style={{ padding: 10, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-glass)', color: 'var(--text-primary)', outline: 'none' }} />
                            <textarea placeholder="Description" value={newClub.description} onChange={e => setNewClub({ ...newClub, description: e.target.value })} rows={3} style={{ padding: 10, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-glass)', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }} />
                            <select value={newClub.category} onChange={e => setNewClub({ ...newClub, category: e.target.value })} style={{ padding: 10, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-glass)', color: 'var(--text-primary)', outline: 'none' }}>
                                <option value="technical">Technical</option>
                                <option value="cultural">Cultural</option>
                                <option value="sports">Sports</option>
                                <option value="arts">Arts</option>
                                <option value="general">General</option>
                            </select>
                            <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}><i className="fas fa-paper-plane" style={{ marginRight: 6 }}></i>Create Club</button>
                        </form>
                    </div>

                    <div className="glass-card">
                        <h3><i className="fas fa-users-cog" style={{ color: 'var(--cyan)', marginRight: 8 }}></i>Manage Clubs ({clubs.length})</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {clubs.length === 0 ? <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>No clubs created yet.</p> :
                                clubs.map(club => (
                                    <div key={club.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
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
                                            <button className="btn btn-sm btn-danger" onClick={async () => {
                                                if (!confirm('Delete this club? All memberships will be removed.')) return;
                                                try {
                                                    await fetch(`${API}/clubs/${club.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
                                                    setClubs(prev => prev.filter(c => c.id !== club.id));
                                                    showToast('Club deleted', 'info');
                                                    if (selectedClub?.id === club.id) setSelectedClub(null);
                                                } catch (err) { }
                                            }}>
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                    {selectedClub && (
                        <div className="glass-card" style={{ gridColumn: '1 / -1', borderColor: 'var(--cyan)' }}>
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



                    {/* ——— PLACEMENTS SECTION ——— */}
                    <div className="glass-card" style={{ gridColumn: '1 / -1' }}>
                        <h3><i className="fas fa-plus-circle" style={{ color: 'var(--pink)', marginRight: 8 }}></i>Add Placement Opportunity</h3>
                        <form onSubmit={addPlacement} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 12 }}>
                            <input placeholder="Company Name" value={newPlacement.companyName} onChange={e => setNewPlacement(p => ({ ...p, companyName: e.target.value }))} required style={{ padding: 10, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-glass)', color: 'var(--text-primary)', outline: 'none' }} />
                            <input placeholder="Role / Title" value={newPlacement.role} onChange={e => setNewPlacement(p => ({ ...p, role: e.target.value }))} required style={{ padding: 10, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-glass)', color: 'var(--text-primary)', outline: 'none' }} />
                            <input placeholder="CTC / Stipend" value={newPlacement.salary} onChange={e => setNewPlacement(p => ({ ...p, salary: e.target.value }))} required style={{ padding: 10, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-glass)', color: 'var(--text-primary)', outline: 'none' }} />
                            <input type="date" value={newPlacement.deadline} onChange={e => setNewPlacement(p => ({ ...p, deadline: e.target.value }))} required style={{ padding: 10, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-glass)', color: 'var(--text-primary)', outline: 'none' }} />
                            <input placeholder="Eligible Batch (e.g. 2025)" value={newPlacement.eligibleBatch} onChange={e => setNewPlacement(p => ({ ...p, eligibleBatch: e.target.value }))} style={{ padding: 10, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-glass)', color: 'var(--text-primary)', outline: 'none' }} />
                            <select value={newPlacement.type} onChange={e => setNewPlacement(p => ({ ...p, type: e.target.value }))} style={{ padding: 10, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-glass)', color: 'var(--text-primary)', outline: 'none' }}>
                                <option value="Full-time">Full-time</option>
                                <option value="Internship">Internship</option>
                                <option value="Part-time">Part-time</option>
                            </select>
                            <textarea placeholder="Job description..." value={newPlacement.description} onChange={e => setNewPlacement(p => ({ ...p, description: e.target.value }))} rows={2} style={{ padding: 10, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-glass)', color: 'var(--text-primary)', outline: 'none', gridColumn: '1 / -1', resize: 'vertical' }} />
                            <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1' }}><i className="fas fa-paper-plane" style={{ marginRight: 6 }}></i>Publish Opportunity</button>
                        </form>
                    </div>

                    <div className="glass-card" style={{ gridColumn: '1 / -1' }}>
                        <h3><i className="fas fa-building" style={{ color: 'var(--cyan)', marginRight: 8 }}></i>Ongoing Drives ({placements.length})</h3>
                        {placements.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 12 }}>No placements created yet.</p>}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12, marginTop: 12 }}>
                            {placements.map(p => (
                                <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                <strong style={{ fontSize: 16, color: 'var(--text-primary)' }}>{p.companyName}</strong>
                                                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: p.type === 'Internship' ? 'var(--pink)' : 'var(--purple)' }}>{p.type}</span>
                                            </div>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--cyan)' }}>{p.role}</div>
                                        </div>
                                        <button className="btn btn-sm btn-danger" onClick={async () => {
                                            if (!confirm('Remove this placement opportunity?')) return;
                                            try {
                                                await fetch(`${API}/placements/${p.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
                                                setPlacements(prev => prev.filter(item => item.id !== p.id));
                                                showToast('Opportunity removed.', 'info');
                                            } catch (err) { }
                                        }}><i className="fas fa-trash"></i></button>
                                    </div>
                                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        {p.salary && <span><i className="fas fa-money-bill-wave" style={{ width: 16, color: 'var(--text-dim)' }}></i> {p.salary}</span>}
                                        {p.eligibleBatch && <span><i className="fas fa-user-graduate" style={{ width: 16, color: 'var(--text-dim)' }}></i> Batch: {p.eligibleBatch}</span>}
                                        {p.deadline && <span style={{ color: new Date(p.deadline) < new Date() ? 'var(--red)' : 'inherit' }}><i className="fas fa-clock" style={{ width: 16, color: 'var(--text-dim)' }}></i> Deadline: {new Date(p.deadline).toLocaleDateString()}</span>}
                                    </div>
                                    {p.description && <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 4, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>{p.description}</div>}
                                </div>
                            ))}
                        </div>
                    </div>


                </div>
            )}

            {/* ═══ Rooms Override Tab ═══ */}
            {activeTab === 'rooms' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className="glass-card">
                        <h3><i className="fas fa-file-upload" style={{ color: 'var(--blue)', marginRight: 8 }}></i>Upload Automatic Schedules</h3>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Upload a PDF schedule to automatically determine room occupancy based on text extraction.</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleScheduleUpload}
                                style={{
                                    padding: '10px',
                                    background: 'var(--bg-glass)',
                                    border: '1px dashed var(--border)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    width: '100%',
                                    maxWidth: '400px'
                                }}
                            />
                        </div>
                        <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 8 }}>Example format: <code>[{'{"number": "R101", "schedule": {"9": "DSA", "10": "OS"}}'}]</code></p>
                    </div>

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

            {/* ═══ Placements Tab ═══ */}
            {activeTab === 'placements' && (
                <div>
                    <div className="glass-card" style={{ marginBottom: 24 }}>
                        <h3><i className="fas fa-plus-circle" style={{ color: 'var(--purple)', marginRight: 8 }}></i>Create Placement Drive</h3>
                        <form onSubmit={addPlacement} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                            <input placeholder="Company Name" value={newPlacement.companyName} onChange={e => setNewPlacement(p => ({ ...p, companyName: e.target.value }))} required style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 13 }} />
                            <input placeholder="Role" value={newPlacement.role} onChange={e => setNewPlacement(p => ({ ...p, role: e.target.value }))} required style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 13 }} />
                            <input placeholder="CTC / Stipend" value={newPlacement.salary} onChange={e => setNewPlacement(p => ({ ...p, salary: e.target.value }))} required style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 13 }} />
                            <input type="date" value={newPlacement.deadline} onChange={e => setNewPlacement(p => ({ ...p, deadline: e.target.value }))} required style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 13 }} />
                            <input placeholder="Eligible Batch (e.g., 2025, All)" value={newPlacement.eligibleBatch} onChange={e => setNewPlacement(p => ({ ...p, eligibleBatch: e.target.value }))} style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 13 }} />
                            <select className="setting-select" value={newPlacement.type} onChange={e => setNewPlacement(p => ({ ...p, type: e.target.value }))}>
                                <option value="Full-time">Full-time</option>
                                <option value="Internship">Internship</option>
                            </select>
                            <textarea placeholder="Job description..." value={newPlacement.description} onChange={e => setNewPlacement(p => ({ ...p, description: e.target.value }))} rows={2} style={{ gridColumn: '1 / -1', padding: '10px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 13, resize: 'vertical' }} />
                            <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1' }}><i className="fas fa-paper-plane"></i> Create Drive</button>
                        </form>
                    </div>

                    <div className="glass-card">
                        <h3><i className="fas fa-briefcase" style={{ color: 'var(--cyan)', marginRight: 8 }}></i>Ongoing Drives ({placements.length})</h3>
                        {placements.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 12 }}>No placement drives created.</p>}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                            {placements.map(p => (
                                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                            <strong style={{ fontSize: 16, color: 'var(--text-primary)' }}>{p.companyName}</strong>
                                            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>{p.type}</span>
                                        </div>
                                        <div style={{ fontSize: 13, color: 'var(--cyan)', fontWeight: 600 }}>{p.role}</div>
                                    </div>
                                    <button className="btn btn-sm btn-danger" onClick={() => deletePlacement(p.id)}><i className="fas fa-trash"></i></button>
                                </div>
                            ))}
                        </div>
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
                        { icon: 'fa-users', label: 'Total Clubs', value: clubs.length, color: 'var(--purple)' },
                        { icon: 'fa-briefcase', label: 'Placement Drives', value: placements.length, color: 'var(--blue)' },
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
