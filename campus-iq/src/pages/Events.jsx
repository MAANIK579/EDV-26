import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const eventsData = [
    { id: 1, name: 'Campus Hackathon 2026', desc: '36-hour coding challenge. Build innovative solutions for real-world problems. ₹50K prize pool!', date: 'Mar 15-16', category: 'workshop', venue: 'Auditorium', interest: '120 registered', gradient: 'linear-gradient(135deg, #00d4ff, #7c3aed)' },
    { id: 2, name: 'Annual Cultural Fest — SPANDAN', desc: 'Music, dance, drama, and art — three days of creativity. Open for all departments.', date: 'Mar 8', category: 'cultural', venue: 'Main Ground', interest: '450 interested', gradient: 'linear-gradient(135deg, #7c3aed, #f472b6)' },
    { id: 3, name: 'AI/ML Guest Lecture Series', desc: 'Guest speaker from Google Research on "Transformers in Production".', date: 'Mar 3', category: 'academic', venue: 'Room 301', interest: '80 registered', gradient: 'linear-gradient(135deg, #34d399, #00d4ff)' },
    { id: 4, name: 'Annual Sports Day', desc: 'Track & field, basketball, cricket finals, and more!', date: 'Feb 28', category: 'sports', venue: 'Sports Complex', interest: '300 participants', gradient: 'linear-gradient(135deg, #fbbf24, #f97316)' },
    { id: 5, name: 'Cloud Computing Workshop', desc: 'Hands-on AWS workshop — deploy your first app. Certificates provided.', date: 'Mar 5', category: 'workshop', venue: 'Lab 204', interest: '60 registered', gradient: 'linear-gradient(135deg, #00d4ff, #34d399)' },
    { id: 6, name: 'Open Mic Night', desc: 'Poetry, stand-up comedy, and storytelling. Everyone is welcome!', date: 'Mar 20', category: 'cultural', venue: 'Amphitheatre', interest: '80 interested', gradient: 'linear-gradient(135deg, #f472b6, #ef4444)' },
];

const categories = ['all', 'academic', 'cultural', 'sports', 'workshop'];

export default function Events() {
    const { rsvps, toggleRsvp, showToast } = useApp();
    const [filter, setFilter] = useState('all');

    const filtered = filter === 'all' ? eventsData : eventsData.filter(e => e.category === filter);

    const handleRsvp = (e, event) => {
        toggleRsvp(event.name);
        if (!rsvps[event.name]) {
            // Spawn confetti
            const colors = ['#00d4ff', '#7c3aed', '#f472b6', '#fbbf24', '#34d399', '#f97316'];
            const rect = e.target.getBoundingClientRect();
            for (let i = 0; i < 20; i++) {
                const piece = document.createElement('div');
                piece.className = 'confetti-piece';
                piece.style.left = (rect.left + rect.width / 2 + (Math.random() - 0.5) * 100) + 'px';
                piece.style.top = (rect.top - 10) + 'px';
                piece.style.background = colors[Math.floor(Math.random() * colors.length)];
                piece.style.animationDuration = (1 + Math.random()) + 's';
                piece.style.animationDelay = (Math.random() * 0.3) + 's';
                document.body.appendChild(piece);
                setTimeout(() => piece.remove(), 2000);
            }
        }
    };

    return (
        <div className="page-transition">
            <div className="page-header">
                <h1><i className="fas fa-calendar-day"></i> Campus Events</h1>
                <p className="subtitle">Discover, RSVP, and participate</p>
            </div>

            <div className="event-filters">
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`filter-btn ${filter === cat ? 'active' : ''}`}
                        onClick={() => { setFilter(cat); showToast(`Showing ${cat === 'all' ? 'all' : cat} events`, 'info', 1500); }}
                    >
                        {cat === 'all' ? '🎯 All' : cat === 'academic' ? '🎓 Academic' : cat === 'cultural' ? '🎭 Cultural' : cat === 'sports' ? '🏅 Sports' : '💻 Workshops'}
                    </button>
                ))}
            </div>

            <div className="grid-3">
                {filtered.map((event, i) => (
                    <div key={event.id} className="event-card" style={{ animationDelay: `${i * 0.06}s` }}>
                        <div className="event-banner" style={{ background: event.gradient }}>
                            <span className="event-date"><i className="fas fa-calendar"></i> {event.date}</span>
                            <span className="event-tag">{event.category}</span>
                        </div>
                        <div className="event-body">
                            <h3>{event.name}</h3>
                            <p>{event.desc}</p>
                            <div className="event-meta">
                                <span><i className="fas fa-map-marker-alt"></i> {event.venue}</span>
                                <span><i className="fas fa-users"></i> {event.interest}</span>
                            </div>
                            <button
                                className={`btn ${rsvps[event.name] ? 'btn-success' : 'btn-primary'}`}
                                onClick={(e) => handleRsvp(e, event)}
                            >
                                {rsvps[event.name] ? <><i className="fas fa-check"></i> RSVP'd!</> : 'RSVP Now'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
