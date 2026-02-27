import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const gpaData = [
    { sem: 'Sem 1', gpa: 8.2 }, { sem: 'Sem 2', gpa: 8.5 }, { sem: 'Sem 3', gpa: 8.7 },
    { sem: 'Sem 4', gpa: 9.1 }, { sem: 'Sem 5', gpa: 8.9 }, { sem: 'Sem 6', gpa: 9.0 },
];

const todayTimeline = [
    { time: '09:00', name: 'Data Structures', room: 'Room 301 · Prof. Mehra', status: 'past' },
    { time: '11:00', name: 'Machine Learning', room: 'Lab 204 · Dr. Kapoor', status: 'active' },
    { time: '14:00', name: 'Operating Systems', room: 'Room 105 · Prof. Singh', status: 'upcoming' },
    { time: '16:00', name: 'Web Dev Workshop', room: 'Lab 201 · Dr. Roy', status: 'upcoming' },
];

const API = 'http://localhost:5000/api';

function AnimatedNumber({ target, decimals = 0, duration = 1500 }) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        const start = performance.now();
        const animate = (ts) => {
            const elapsed = ts - start;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setValue(target * ease);
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [target, duration]);
    return <>{value.toFixed(decimals)}</>;
}

export default function Dashboard() {
    const { showToast, todos, events } = useApp();
    const { user, token } = useAuth();

    // Fetch announcements from backend
    const [announcements, setAnnouncements] = useState([]);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchData = () => {
            if (token) {
                fetch(`${API}/announcements`, { headers: { Authorization: `Bearer ${token}` } })
                    .then(r => r.json()).then(d => { if (Array.isArray(d)) setAnnouncements(d); }).catch(console.error);

                fetch(`${API}/notifications`, { headers: { Authorization: `Bearer ${token}` } })
                    .then(r => r.json()).then(d => { if (Array.isArray(d)) setNotifications(d); }).catch(console.error);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 15000); // Auto-refresh every 15s
        return () => clearInterval(interval);
    }, [token]);

    const unreadNotifs = notifications.filter(n => !n.read);

    const markAllRead = async () => {
        try {
            await fetch(`${API}/notifications/read-all`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            showToast('✅ All notifications marked as read', 'success', 1500);
        } catch (err) {
            console.error(err);
        }
    };

    const now = new Date();
    const hour = now.getHours();
    let greeting = 'Good Evening';
    if (hour < 12) greeting = 'Good Morning';
    else if (hour < 17) greeting = 'Good Afternoon';

    const firstName = user?.name
        ? user.name.split(' ')[0]
        : (user?.email ? user.email.split('@')[0] : 'Student');

    const rsvpCount = events.filter(e => e.isRsvpd).length;
    const todosDone = todos.filter(t => t.done).length;

    useEffect(() => {
        if (unreadNotifs.length > 0) {
            const t = setTimeout(() => showToast(`👋 Welcome back, ${firstName}! You have ${unreadNotifs.length} new notification${unreadNotifs.length > 1 ? 's' : ''}.`, 'info', 4000), 1500);
            return () => clearTimeout(t);
        }
    }, []);

    return (
        <div className="page-transition">
            <div className="page-header">
                <h1>{greeting}, <span className="accent">{firstName}</span> 👋</h1>
                <p className="subtitle">Here's your campus snapshot for today — {now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            {/* Weather */}
            <div className="weather-widget">
                <div className="weather-icon">🌤️</div>
                <div>
                    <div className="weather-temp">28°</div>
                    <div className="weather-desc">Partly Cloudy</div>
                    <div className="weather-details">Humidity 52% · Wind 12 km/h · UV Index 5</div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 24, color: 'var(--text-dim)', fontSize: 12, textAlign: 'center' }}>
                    <div><div style={{ fontSize: 20 }}>🌥️</div>Sat<br /><strong style={{ color: 'var(--text-primary)' }}>26°</strong></div>
                    <div><div style={{ fontSize: 20 }}>☀️</div>Sun<br /><strong style={{ color: 'var(--text-primary)' }}>31°</strong></div>
                    <div><div style={{ fontSize: 20 }}>⛈️</div>Mon<br /><strong style={{ color: 'var(--text-primary)' }}>24°</strong></div>
                </div>
            </div>

            {/* Stats — personalized */}
            <div className="stats-grid">
                {[
                    { icon: 'fa-list-check', label: 'Tasks Done', value: todosDone, unit: `/${todos.length}`, color: 'var(--cyan)' },
                    { icon: 'fa-star', label: 'CGPA', value: 8.9, decimals: 1, color: 'var(--purple)' },
                    { icon: 'fa-calendar-check', label: 'RSVPs', value: rsvpCount, color: 'var(--pink)' },
                    { icon: 'fa-bell', label: 'Notifications', value: unreadNotifs.length, color: 'var(--amber)' },
                ].map((stat, i) => (
                    <div key={i} className="stat-card" style={{ '--accent': stat.color, animationDelay: `${i * 0.08}s` }}>
                        <div className="stat-icon" style={{ color: stat.color }}><i className={`fas ${stat.icon}`}></i></div>
                        <div>
                            <div className="stat-value">
                                <AnimatedNumber target={stat.value} decimals={stat.decimals || 0} />
                                {stat.unit && <span className="stat-unit"> {stat.unit}</span>}
                            </div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts + Timeline */}
            <div className="dashboard-grid">
                <div className="glass-card">
                    <h3><i className="fas fa-chart-line" style={{ color: 'var(--cyan)', marginRight: 8 }}></i>GPA Trend</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={gpaData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis dataKey="sem" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
                            <YAxis domain={[7, 10]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
                            <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9' }} />
                            <Line type="monotone" dataKey="gpa" stroke="#00d4ff" strokeWidth={3} dot={{ r: 5, fill: '#00d4ff' }} activeDot={{ r: 7, fill: '#00d4ff', stroke: '#fff', strokeWidth: 2 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="glass-card">
                    <h3><i className="fas fa-stream" style={{ color: 'var(--purple)', marginRight: 8 }}></i>Today's Timeline</h3>
                    <div className="timeline">
                        {todayTimeline.map((item, i) => (
                            <div key={i} className={`timeline-item ${item.status}`}>
                                <span className="tl-time">{item.time}</span>
                                <div className={`tl-dot ${item.status === 'active' ? 'pulse' : ''}`}></div>
                                <div className="tl-content">
                                    <strong>{item.name}</strong>
                                    <span>{item.room}</span>
                                    {item.status === 'active' && <span className="live-badge">NOW</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Notifications — from database */}
            {unreadNotifs.length > 0 && (
                <div className="glass-card" style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3><i className="fas fa-bell" style={{ color: 'var(--pink)', marginRight: 8 }}></i>New Notifications ({unreadNotifs.length})</h3>
                        <button className="btn btn-sm btn-secondary" onClick={markAllRead}>Mark all read</button>
                    </div>
                    {unreadNotifs.slice(0, 5).map(n => (
                        <div key={n.id} className={`announce-item ${n.type === 'urgent' ? 'urgent' : ''}`}>
                            <div className="announce-dot"></div>
                            <div>
                                <p>{n.message}</p>
                                <span className="announce-time">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Announcements — from database */}
            <div className="glass-card">
                <h3><i className="fas fa-bullhorn" style={{ color: 'var(--amber)', marginRight: 8 }}></i>Announcements</h3>
                {announcements.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 12 }}>No announcements yet.</p>}
                {announcements.map(a => (
                    <div key={a.id} className={`announce-item ${a.priority === 'urgent' ? 'urgent' : ''}`}>
                        <div className="announce-dot"></div>
                        <div>
                            <strong>{a.title}</strong>
                            <p>{a.text}</p>
                            <span className="announce-time">{a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
