import React, { useState } from 'react';

const buildingInfo = {
    'main-block': { name: 'Main Academic Block', floors: 4, departments: 'CSE, ECE, ME, CE', facilities: 'Smart Classrooms, Faculty Cabins, Seminar Halls', hours: '8:00 AM - 6:00 PM', distance: '2 min walk' },
    'library': { name: 'Central Library', floors: 3, departments: 'All Departments', facilities: '50,000+ Books, Digital Section, Discussion Rooms', hours: '8:00 AM - 11:00 PM', distance: '3 min walk' },
    'cs-block': { name: 'CS & IT Block', floors: 3, departments: 'CSE, IT, AI/ML', facilities: 'Computer Labs, IoT Lab, AI Research Lab', hours: '8:00 AM - 8:00 PM', distance: '5 min walk' },
    'admin': { name: 'Admin Building', floors: 2, departments: 'Administration', facilities: 'Registrar, Dean Office, Accounts', hours: '9:00 AM - 5:00 PM', distance: '6 min walk' },
    'labs': { name: 'Science Labs', floors: 2, departments: 'Physics, Chemistry, Biology', facilities: 'Research Labs, Equipment Room', hours: '9:00 AM - 5:00 PM', distance: '3 min walk' },
    'cafeteria': { name: 'Food Court', floors: 1, departments: 'All Students', facilities: 'Multi-cuisine, Juice Bar, Snack Corner', hours: '7:00 AM - 10:00 PM', distance: '4 min walk' },
    'sports': { name: 'Sports Complex', floors: 2, departments: 'Sports', facilities: 'Gym, Courts, Swimming Pool, Track', hours: '6:00 AM - 9:00 PM', distance: '7 min walk' },
    'auditorium': { name: 'Auditorium', floors: 1, departments: 'Events & Cultural', facilities: '1000 Seats, Stage, Green Room', hours: 'Event-based', distance: '5 min walk' },
    'hostel': { name: 'Hostel Block A & B', floors: 5, departments: 'Residential', facilities: 'Common Room, Laundry, Wi-Fi', hours: '24/7', distance: '8 min walk' },
    'health': { name: 'Health Center', floors: 1, departments: 'Medical', facilities: 'OPD, Pharmacy, Emergency, Counseling', hours: '24/7 Emergency', distance: '9 min walk' }
};

const buildings = [
    { id: 'main-block', x: 60, y: 30, w: 180, h: 80, color: '#00d4ff' },
    { id: 'library', x: 280, y: 30, w: 140, h: 80, color: '#7c3aed' },
    { id: 'cs-block', x: 460, y: 30, w: 160, h: 80, color: '#34d399' },
    { id: 'admin', x: 60, y: 150, w: 120, h: 60, color: '#fbbf24' },
    { id: 'labs', x: 220, y: 150, w: 120, h: 60, color: '#f472b6' },
    { id: 'cafeteria', x: 380, y: 150, w: 120, h: 60, color: '#f97316' },
    { id: 'sports', x: 540, y: 150, w: 120, h: 60, color: '#ef4444' },
    { id: 'auditorium', x: 60, y: 260, w: 140, h: 60, color: '#8b5cf6' },
    { id: 'hostel', x: 240, y: 260, w: 160, h: 60, color: '#06b6d4' },
    { id: 'health', x: 440, y: 260, w: 120, h: 60, color: '#ec4899' },
];

export default function CampusMap() {
    const [selected, setSelected] = useState(null);
    const info = selected ? buildingInfo[selected] : null;

    return (
        <div className="page-transition">
            <div className="page-header">
                <h1><i className="fas fa-map-marked-alt"></i> Campus Map</h1>
                <p className="subtitle">Click a building to see details</p>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="map-container">
                    <div className="campus-map">
                        <svg viewBox="0 0 700 360" className="campus-svg">
                            <defs>
                                <filter id="glow"><feGaussianBlur stdDeviation="3" result="g" /><feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                            </defs>
                            {/* Paths */}
                            <line x1="150" y1="110" x2="150" y2="150" stroke="rgba(255,255,255,0.08)" strokeWidth="3" strokeDasharray="6" />
                            <line x1="350" y1="110" x2="350" y2="150" stroke="rgba(255,255,255,0.08)" strokeWidth="3" strokeDasharray="6" />
                            <line x1="540" y1="110" x2="540" y2="150" stroke="rgba(255,255,255,0.08)" strokeWidth="3" strokeDasharray="6" />
                            <line x1="130" y1="210" x2="130" y2="260" stroke="rgba(255,255,255,0.08)" strokeWidth="3" strokeDasharray="6" />
                            <line x1="320" y1="210" x2="320" y2="260" stroke="rgba(255,255,255,0.08)" strokeWidth="3" strokeDasharray="6" />
                            <line x1="500" y1="210" x2="500" y2="260" stroke="rgba(255,255,255,0.08)" strokeWidth="3" strokeDasharray="6" />

                            {buildings.map(b => (
                                <g key={b.id} className={`map-building ${selected === b.id ? 'selected' : ''}`} onClick={() => setSelected(b.id)} style={{ cursor: 'pointer' }}>
                                    <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="6" fill={b.color} fillOpacity="0.2" stroke={b.color} strokeWidth={selected === b.id ? 3 : 1.5} filter={selected === b.id ? 'url(#glow)' : ''} />
                                    <text x={b.x + b.w / 2} y={b.y + b.h / 2 + 4} textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="11" fontWeight="600">{buildingInfo[b.id].name.split(' ').slice(0, 2).join(' ')}</text>
                                </g>
                            ))}

                            {/* You Marker */}
                            <circle cx="350" cy="200" r="6" fill="#00d4ff" />
                            <circle cx="350" cy="200" r="12" fill="none" stroke="#00d4ff" strokeWidth="2" opacity="0.5">
                                <animate attributeName="r" from="8" to="18" dur="2s" repeatCount="indefinite" />
                                <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
                            </circle>
                            <text x="350" y="225" textAnchor="middle" fill="#00d4ff" fontSize="10" fontWeight="700">You</text>
                        </svg>
                    </div>

                    <div className="map-info">
                        {info ? (
                            <div className="map-info-detail" style={{ animation: 'fadeIn 0.3s var(--ease)' }}>
                                <h3>{info.name}</h3>
                                <div className="info-row"><i className="fas fa-layer-group"></i> {info.floors} Floors</div>
                                <div className="info-row"><i className="fas fa-building"></i> {info.departments}</div>
                                <div className="info-row"><i className="fas fa-tools"></i> {info.facilities}</div>
                                <div className="info-row"><i className="fas fa-clock"></i> {info.hours}</div>
                                <div className="info-row"><i className="fas fa-walking"></i> {info.distance} from you</div>
                            </div>
                        ) : (
                            <div className="map-info-placeholder">
                                <i className="fas fa-map-marker-alt"></i>
                                <p>Select a building to see details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
