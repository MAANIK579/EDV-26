import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const services = [
    { name: 'Campus Bus', desc: 'Track bus schedules and live countdowns', icon: 'fa-bus', status: '3 buses running', color: '#00d4ff' },
    { name: 'Library', desc: 'Search books, view availability, reserve', icon: 'fa-book', status: 'Open until 11 PM', color: '#7c3aed' },
    { name: 'Health Center', desc: '24/7 emergency services and counseling', icon: 'fa-heartbeat', status: '24/7 Available', color: '#ef4444' },
    { name: 'Cafeteria', desc: 'View today\'s menu and meal timings', icon: 'fa-utensils', status: 'Open until 10 PM', color: '#f97316' },
    { name: 'Sports Complex', desc: 'Book courts, check gym schedule', icon: 'fa-dumbbell', status: 'Open until 9 PM', color: '#fbbf24' },
    { name: 'IT Helpdesk', desc: 'Wi-Fi issues, software licenses, email', icon: 'fa-headset', status: 'Open 9 AM - 5 PM', color: '#34d399' },
    { name: 'Placement Cell', desc: 'Upcoming drives, resume builder, interviews', icon: 'fa-briefcase', status: '2 drives this week', color: '#f472b6' },
    { name: 'Student Club', desc: 'Join clubs, view activities, register', icon: 'fa-users', status: '12 active clubs', color: '#8b5cf6' },
];

const busSchedule = [
    { destination: 'City Center', time: '14:30', id: 1 },
    { destination: 'Railway Station', time: '15:15', id: 2 },
    { destination: 'City Center', time: '16:00', id: 3 },
    { destination: 'Mall Road', time: '17:30', id: 4 },
    { destination: 'Airport', time: '18:00', id: 5 },
];

const libraryBooks = [
    { title: 'Introduction to Algorithms (CLRS)', available: 3, total: 10 },
    { title: 'Design Patterns — Gang of Four', available: 1, total: 5 },
    { title: 'Deep Learning — Ian Goodfellow', available: 0, total: 4 },
    { title: 'Computer Networks — Tanenbaum', available: 5, total: 8 },
    { title: 'Operating System Concepts — Silberschatz', available: 2, total: 6 },
];

function BusCountdown({ time }) {
    const [countdown, setCountdown] = useState('');

    useEffect(() => {
        const calc = () => {
            const now = new Date();
            const [h, m] = time.split(':').map(Number);
            const target = new Date(now);
            target.setHours(h, m, 0, 0);

            const diff = target - now;
            if (diff <= 0) { setCountdown('Departed'); return; }

            const hrs = Math.floor(diff / 3600000);
            const mins = Math.floor((diff % 3600000) / 60000);
            const secs = Math.floor((diff % 60000) / 1000);

            if (hrs > 0) setCountdown(`${hrs}h ${mins}m`);
            else setCountdown(`${mins}m ${secs}s`);
        };

        calc();
        const id = setInterval(calc, 1000);
        return () => clearInterval(id);
    }, [time]);

    return <span className="bus-timer">{countdown}</span>;
}

export default function Services() {
    const { showToast } = useApp();
    const [bookSearch, setBookSearch] = useState('');

    const filteredBooks = libraryBooks.filter(b =>
        b.title.toLowerCase().includes(bookSearch.toLowerCase())
    );

    return (
        <div className="page-transition">
            <div className="page-header">
                <h1><i className="fas fa-concierge-bell"></i> Campus Services</h1>
                <p className="subtitle">Quick access to all campus facilities</p>
            </div>

            {/* Service Tiles */}
            <div className="grid-4" style={{ marginBottom: 32 }}>
                {services.map((s, i) => (
                    <div
                        key={s.name}
                        className="service-tile"
                        style={{ '--accent': s.color, animationDelay: `${i * 0.05}s` }}
                        onClick={() => showToast(`🏫 ${s.name}: ${s.status}`, 'info', 2500)}
                    >
                        <div className="service-icon" style={{ color: s.color }}><i className={`fas ${s.icon}`}></i></div>
                        <h3>{s.name}</h3>
                        <p>{s.desc}</p>
                        <div className="service-status"><i className="fas fa-circle" style={{ fontSize: 6 }}></i> {s.status}</div>
                    </div>
                ))}
            </div>

            <div className="grid-2">
                {/* Bus Countdown */}
                <div className="glass-card">
                    <h3><i className="fas fa-bus" style={{ color: 'var(--cyan)', marginRight: 8 }}></i>Bus Schedule — Live Countdown</h3>
                    <div className="bus-countdown">
                        {busSchedule.map(bus => {
                            const h = parseInt(bus.time.split(':')[0]);
                            const displayTime = `${h > 12 ? h - 12 : h}:${bus.time.split(':')[1]} ${h >= 12 ? 'PM' : 'AM'}`;
                            return (
                                <div key={bus.id} className="bus-row">
                                    <span className="bus-destination"><i className="fas fa-map-marker-alt" style={{ color: 'var(--cyan)', marginRight: 8 }}></i>{bus.destination}</span>
                                    <span className="bus-time">{displayTime}</span>
                                    <BusCountdown time={bus.time} />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Library Book Search */}
                <div className="glass-card">
                    <h3><i className="fas fa-book" style={{ color: 'var(--purple)', marginRight: 8 }}></i>Library — Book Search</h3>
                    <input
                        type="text"
                        placeholder="Search books..."
                        value={bookSearch}
                        onChange={e => setBookSearch(e.target.value)}
                        style={{ width: '100%', padding: '10px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', marginBottom: 16 }}
                    />
                    {filteredBooks.map(book => (
                        <div key={book.title} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                            <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{book.title}</span>
                            <span style={{ color: book.available > 0 ? 'var(--green)' : 'var(--red)', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', marginLeft: 12 }}>
                                {book.available > 0 ? `${book.available}/${book.total} available` : 'Unavailable'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
