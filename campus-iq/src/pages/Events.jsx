import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const categories = ['all', 'academic', 'cultural', 'sports', 'workshop'];

export default function Events() {
    const { events, toggleRsvp, showToast } = useApp();
    const [filter, setFilter] = useState('all');

    // Default gradients based on category
    const getGradient = (cat) => {
        if (cat === 'workshop') return 'linear-gradient(135deg, #00d4ff, #7c3aed)';
        if (cat === 'cultural') return 'linear-gradient(135deg, #7c3aed, #f472b6)';
        if (cat === 'academic') return 'linear-gradient(135deg, #34d399, #00d4ff)';
        if (cat === 'sports') return 'linear-gradient(135deg, #fbbf24, #f97316)';
        return 'linear-gradient(135deg, #00d4ff, #34d399)';
    };

    const formattedEvents = events.map(e => ({
        ...e,
        // Since backend sends ISO date, format it nicely
        formattedDate: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        gradient: getGradient(e.category)
    }));

    const filtered = filter === 'all'
        ? formattedEvents
        : formattedEvents.filter(e => e.category === filter);

    const handleRsvp = (e, event) => {
        toggleRsvp(event.id, event.title); // Update to use title instead of name

        // Spawn confetti if we are RSVPing (isRsvpd is currently false)
        if (!event.isRsvpd) {
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
                            <span className="event-date"><i className="fas fa-calendar"></i> {event.formattedDate}</span>
                            <span className="event-tag">{event.category}</span>
                        </div>
                        <div className="event-body">
                            <h3>{event.title}</h3>
                            <p>{event.description}</p>
                            <div className="event-meta">
                                <span><i className="fas fa-map-marker-alt"></i> {event.venue}</span>
                                <span><i className="fas fa-users"></i> Event</span>
                            </div>
                            <button
                                className={`btn ${event.isRsvpd ? 'btn-success' : 'btn-primary'}`}
                                onClick={(e) => handleRsvp(e, event)}
                            >
                                {event.isRsvpd ? <><i className="fas fa-check"></i> RSVP'd!</> : 'RSVP Now'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
