import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const initialNotifs = [
    { id: 1, icon: 'fa-exclamation-circle', accent: 'var(--red)', title: 'Assignment Due!', text: 'Data Structures — Assignment 3: Trees is due in 2 days.', time: '30 min ago', unread: true },
    { id: 2, icon: 'fa-calendar-check', accent: 'var(--purple)', title: 'Hackathon Registered!', text: "You've successfully registered for Campus Hackathon 2026.", time: '5 hours ago', unread: true },
    { id: 3, icon: 'fa-check-circle', accent: 'var(--green)', title: 'Grade Updated', text: 'Machine Learning — Lab 4 graded: A+', time: '1 day ago', unread: true },
    { id: 4, icon: 'fa-bullhorn', accent: 'var(--amber)', title: 'Mid-Sem Exams', text: 'Schedule released — starts March 10.', time: '2 hours ago', unread: false },
];

export default function NotifPanel() {
    const { notifPanelOpen, setNotifPanelOpen, showToast } = useApp();
    const [notifs, setNotifs] = useState(initialNotifs);

    const markAllRead = () => {
        setNotifs(prev => prev.map(n => ({ ...n, unread: false })));
        showToast('✅ All notifications marked as read', 'success', 2000);
    };

    const markRead = (id) => {
        setNotifs(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    };

    return (
        <div className={`notif-panel ${notifPanelOpen ? 'open' : ''}`}>
            <div className="notif-header">
                <h3><i className="fas fa-bell"></i> Notifications</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-sm btn-secondary" onClick={markAllRead}>Mark all read</button>
                    <button className="icon-btn" onClick={() => setNotifPanelOpen(false)}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div className="notif-list">
                {notifs.map(n => (
                    <div key={n.id} className={`notif-item ${n.unread ? 'unread' : ''}`} onClick={() => markRead(n.id)}>
                        <div className="notif-icon" style={{ '--accent': n.accent, color: n.accent }}>
                            <i className={`fas ${n.icon}`}></i>
                        </div>
                        <div>
                            <strong>{n.title}</strong>
                            <p>{n.text}</p>
                            <span className="notif-time">{n.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
