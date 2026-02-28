import React, { useState } from 'react';

/* ─── CGC Landran Campus Building Data ─── */
const buildingInfo = {
    'main-gate': {
        name: 'Main Gate & Reception',
        icon: 'fa-archway',
        floors: 1,
        departments: 'Security, Visitor Mgmt',
        facilities: 'ID Check, Visitor Passes, CCTV Control Room',
        hours: '24/7',
        distance: 'Entry Point',
        color: '#f59e0b'
    },
    'admin-block': {
        name: 'Administrative Block',
        icon: 'fa-landmark',
        floors: 3,
        departments: 'Administration, Accounts, Registrar',
        facilities: 'Chairman Office, Director Office, Exam Cell, Fee Counter',
        hours: '9:00 AM – 5:00 PM',
        distance: '2 min from gate',
        color: '#f59e0b'
    },
    'block-a': {
        name: 'Academic Block A',
        icon: 'fa-building',
        floors: 4,
        departments: 'CSE, IT, AI/ML, Data Science',
        facilities: 'Smart Classrooms, Programming Labs, Seminar Hall',
        hours: '8:00 AM – 6:00 PM',
        distance: '4 min from gate',
        color: '#10b981'
    },
    'block-b': {
        name: 'Academic Block B',
        icon: 'fa-building',
        floors: 4,
        departments: 'ECE, EEE, Applied Sciences',
        facilities: 'Electronics Labs, Communication Lab, Physics Lab',
        hours: '8:00 AM – 6:00 PM',
        distance: '5 min from gate',
        color: '#0ea5e9'
    },
    'block-c': {
        name: 'Academic Block C',
        icon: 'fa-building',
        floors: 4,
        departments: 'ME, CE, Architecture',
        facilities: 'Workshop, Drawing Hall, CAD Lab, Material Testing Lab',
        hours: '8:00 AM – 6:00 PM',
        distance: '6 min from gate',
        color: '#8b5cf6'
    },
    'library': {
        name: 'Central Library',
        icon: 'fa-book-reader',
        floors: 3,
        departments: 'All Departments',
        facilities: '60,000+ Books, E-Library, Reading Rooms, OPAC',
        hours: '8:00 AM – 10:00 PM',
        distance: '5 min from gate',
        color: '#6366f1'
    },
    'auditorium': {
        name: 'CGC Auditorium',
        icon: 'fa-theater-masks',
        floors: 2,
        departments: 'Events & Cultural',
        facilities: '1500 Seats, Stage, Green Room, AV System, AC Hall',
        hours: 'Event-based',
        distance: '4 min from gate',
        color: '#ec4899'
    },
    'cafeteria': {
        name: 'Food Court & Canteen',
        icon: 'fa-utensils',
        floors: 1,
        departments: 'All Students & Staff',
        facilities: 'Multi-cuisine, Dominos, Nescafé, Juice Corner, Maggi Point',
        hours: '7:30 AM – 9:00 PM',
        distance: '5 min from gate',
        color: '#f97316'
    },
    'sports-ground': {
        name: 'Sports Complex & Ground',
        icon: 'fa-futbol',
        floors: 1,
        departments: 'Sports & Physical Education',
        facilities: 'Cricket Ground, Football, Basketball, Volleyball, Badminton, Gym',
        hours: '6:00 AM – 8:00 PM',
        distance: '8 min from gate',
        color: '#ef4444'
    },
    'boys-hostel': {
        name: 'Boys Hostel',
        icon: 'fa-bed',
        floors: 5,
        departments: 'Residential – Boys',
        facilities: 'Triple/Double Sharing, Common Room, Wi-Fi, Mess, RO Water',
        hours: '24/7',
        distance: '10 min from gate',
        color: '#06b6d4'
    },
    'girls-hostel': {
        name: 'Girls Hostel',
        icon: 'fa-bed',
        floors: 5,
        departments: 'Residential – Girls',
        facilities: 'Triple/Double Sharing, Common Room, Wi-Fi, Mess, 24/7 Security',
        hours: '24/7',
        distance: '9 min from gate',
        color: '#a855f7'
    },
    'placement-cell': {
        name: 'Training & Placement Cell',
        icon: 'fa-briefcase',
        floors: 2,
        departments: 'Placements, Internships, Career Guidance',
        facilities: 'Interview Rooms, GD Hall, Aptitude Lab, Company Tie-ups',
        hours: '9:00 AM – 5:00 PM',
        distance: '3 min from gate',
        color: '#14b8a6'
    },
    'parking': {
        name: 'Parking Area',
        icon: 'fa-car',
        floors: 1,
        departments: 'Vehicle Parking',
        facilities: 'Two Wheeler, Four Wheeler, Faculty Parking, EV Charging',
        hours: '7:00 AM – 8:00 PM',
        distance: '1 min from gate',
        color: '#64748b'
    },
    'health-center': {
        name: 'Medical / Health Center',
        icon: 'fa-hospital',
        floors: 1,
        departments: 'Medical Aid',
        facilities: 'First Aid, OPD, Pharmacy, Ambulance, Counseling',
        hours: '9:00 AM – 5:00 PM (Emergency 24/7)',
        distance: '6 min from gate',
        color: '#f43f5e'
    },
    'workshop': {
        name: 'Central Workshop',
        icon: 'fa-wrench',
        floors: 2,
        departments: 'ME, CE, Production',
        facilities: 'Machine Shop, Welding, Carpentry, Fitting, CNC Lab',
        hours: '8:00 AM – 5:00 PM',
        distance: '7 min from gate',
        color: '#78716c'
    }
};

/* ─── SVG Building Shapes for CGC Layout ─── */
const buildings = [
    // Row 1 — Entrance & Admin area
    { id: 'main-gate', x: 340, y: 10, w: 120, h: 40 },
    { id: 'parking', x: 160, y: 15, w: 140, h: 32 },
    { id: 'admin-block', x: 500, y: 15, w: 140, h: 32 },

    // Row 2 — Central campus
    { id: 'placement-cell', x: 60, y: 80, w: 130, h: 50 },
    { id: 'auditorium', x: 220, y: 80, w: 150, h: 60 },
    { id: 'block-a', x: 400, y: 80, w: 150, h: 60 },
    { id: 'library', x: 580, y: 80, w: 130, h: 55 },

    // Row 3 — Middle campus
    { id: 'cafeteria', x: 60, y: 175, w: 130, h: 50 },
    { id: 'block-b', x: 220, y: 170, w: 150, h: 60 },
    { id: 'block-c', x: 400, y: 170, w: 150, h: 60 },
    { id: 'health-center', x: 580, y: 175, w: 130, h: 50 },

    // Row 4 — Lower campus
    { id: 'workshop', x: 100, y: 270, w: 140, h: 50 },
    { id: 'sports-ground', x: 280, y: 260, w: 220, h: 65 },
    { id: 'boys-hostel', x: 540, y: 270, w: 110, h: 50 },
    { id: 'girls-hostel', x: 670, y: 270, w: 110, h: 50 },
];

/* ─── Road paths connecting areas ─── */
const roads = [
    // Vertical main road from gate going down
    { x1: 400, y1: 50, x2: 400, y2: 80 },
    { x1: 400, y1: 140, x2: 400, y2: 170 },
    { x1: 400, y1: 230, x2: 400, y2: 260 },

    // Horizontal roads
    { x1: 190, y1: 60, x2: 570, y2: 60 },
    { x1: 125, y1: 150, x2: 650, y2: 150 },
    { x1: 125, y1: 245, x2: 710, y2: 245 },

    // Vertical connectors
    { x1: 200, y1: 47, x2: 200, y2: 80 },
    { x1: 600, y1: 47, x2: 600, y2: 80 },
    { x1: 125, y1: 130, x2: 125, y2: 175 },
    { x1: 650, y1: 135, x2: 650, y2: 175 },
    { x1: 170, y1: 225, x2: 170, y2: 270 },
    { x1: 600, y1: 225, x2: 600, y2: 270 },
    { x1: 725, y1: 245, x2: 725, y2: 270 },
];

/* ─── Trees and green areas ─── */
const trees = [
    { cx: 30, cy: 120 }, { cx: 45, cy: 200 }, { cx: 30, cy: 280 },
    { cx: 760, cy: 120 }, { cx: 775, cy: 200 }, { cx: 760, cy: 80 },
    { cx: 350, y: 255, w: 20, h: 15 },
];

/* ─── Legend categories ─── */
const legend = [
    { label: 'Academic', color: '#10b981' },
    { label: 'Admin & Services', color: '#f59e0b' },
    { label: 'Facilities', color: '#f97316' },
    { label: 'Residential', color: '#06b6d4' },
    { label: 'Sports & Rec', color: '#ef4444' },
];

export default function CampusMap() {
    const [selected, setSelected] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [hoveredId, setHoveredId] = useState(null);
    const info = selected ? buildingInfo[selected] : null;

    const filteredBuildings = searchQuery.trim()
        ? buildings.filter(b => {
            const bi = buildingInfo[b.id];
            const q = searchQuery.toLowerCase();
            return bi.name.toLowerCase().includes(q) ||
                bi.departments.toLowerCase().includes(q) ||
                bi.facilities.toLowerCase().includes(q);
        })
        : buildings;

    const highlightedIds = searchQuery.trim()
        ? new Set(filteredBuildings.map(b => b.id))
        : null;

    return (
        <div className="page-transition">
            <div className="page-header">
                <h1><i className="fas fa-map-marked-alt"></i> CGC Landran Campus Map</h1>
                <p className="subtitle">Interactive map of Chandigarh Group of Colleges — Landran</p>
            </div>

            {/* Legend */}
            <div className="campus-map-legend">
                {legend.map(l => (
                    <span key={l.label} className="legend-item">
                        <span className="legend-dot" style={{ background: l.color }}></span>
                        {l.label}
                    </span>
                ))}
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="map-container">
                    <div className="campus-map">
                        {/* Search */}
                        <div className="map-search-bar">
                            <i className="fas fa-search"></i>
                            <input
                                placeholder="Search buildings, labs, departments..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button className="map-search-clear" onClick={() => setSearchQuery('')}>
                                    <i className="fas fa-times"></i>
                                </button>
                            )}
                        </div>

                        <svg viewBox="0 0 800 350" className="campus-svg">
                            <defs>
                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="4" result="g" />
                                    <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
                                </filter>
                                <filter id="shadow">
                                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.4)" />
                                </filter>
                                {/* Grass pattern */}
                                <pattern id="grass" patternUnits="userSpaceOnUse" width="20" height="20">
                                    <rect width="20" height="20" fill="rgba(16,185,129,0.03)" />
                                    <circle cx="10" cy="10" r="1" fill="rgba(16,185,129,0.08)" />
                                </pattern>
                            </defs>

                            {/* Background campus ground */}
                            <rect x="0" y="0" width="800" height="350" fill="url(#grass)" rx="8" />

                            {/* Campus boundary */}
                            <rect x="15" y="5" width="770" height="340" rx="12" fill="none"
                                stroke="rgba(255,255,255,0.05)" strokeWidth="2" strokeDasharray="8 4" />

                            {/* Label: CGC Landran */}
                            <text x="400" y="345" textAnchor="middle" fill="rgba(255,255,255,0.06)"
                                fontSize="40" fontWeight="900" letterSpacing="4">
                                CGC LANDRAN
                            </text>

                            {/* Roads */}
                            {roads.map((r, i) => (
                                <line key={i}
                                    x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2}
                                    stroke="rgba(255,255,255,0.06)" strokeWidth="4" strokeLinecap="round"
                                />
                            ))}
                            {/* Road center lines */}
                            {roads.map((r, i) => (
                                <line key={'d' + i}
                                    x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2}
                                    stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="6 8"
                                />
                            ))}

                            {/* Tree decorations */}
                            {trees.filter(t => t.cx).map((t, i) => (
                                <g key={'tree' + i}>
                                    <circle cx={t.cx} cy={t.cy} r="8" fill="rgba(16,185,129,0.12)" />
                                    <circle cx={t.cx} cy={t.cy} r="4" fill="rgba(16,185,129,0.2)" />
                                </g>
                            ))}

                            {/* Buildings */}
                            {buildings.map(b => {
                                const bi = buildingInfo[b.id];
                                const isSelected = selected === b.id;
                                const isHovered = hoveredId === b.id;
                                const isDimmed = highlightedIds && !highlightedIds.has(b.id);
                                const color = bi.color;

                                return (
                                    <g key={b.id}
                                        className={`map-building ${isSelected ? 'selected' : ''}`}
                                        onClick={() => setSelected(b.id)}
                                        onMouseEnter={() => setHoveredId(b.id)}
                                        onMouseLeave={() => setHoveredId(null)}
                                        style={{ cursor: 'pointer', opacity: isDimmed ? 0.15 : 1, transition: 'opacity 0.3s' }}
                                    >
                                        {/* Building shadow */}
                                        <rect
                                            x={b.x + 2} y={b.y + 2}
                                            width={b.w} height={b.h}
                                            rx="6" fill="rgba(0,0,0,0.3)"
                                        />
                                        {/* Building body */}
                                        <rect
                                            x={b.x} y={b.y}
                                            width={b.w} height={b.h}
                                            rx="6"
                                            fill={color}
                                            fillOpacity={isSelected ? 0.45 : isHovered ? 0.35 : 0.18}
                                            stroke={color}
                                            strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1}
                                            filter={isSelected ? 'url(#glow)' : ''}
                                        />
                                        {/* Building icon */}
                                        <text
                                            x={b.x + 14} y={b.y + b.h / 2 - 2}
                                            fill={color} fontSize="11" fontFamily="Font Awesome 6 Free" fontWeight="900"
                                            dominantBaseline="middle"
                                        >
                                            {b.id === 'main-gate' ? '🚪' : ''}
                                        </text>
                                        {/* Building name */}
                                        <text
                                            x={b.x + b.w / 2} y={b.y + b.h / 2 - 4}
                                            textAnchor="middle" dominantBaseline="middle"
                                            fill="rgba(255,255,255,0.9)" fontSize="10" fontWeight="700"
                                            style={{ pointerEvents: 'none' }}
                                        >
                                            {bi.name.length > 20 ? bi.name.split(' ').slice(0, 2).join(' ') : bi.name}
                                        </text>
                                        {/* Subtitle */}
                                        <text
                                            x={b.x + b.w / 2} y={b.y + b.h / 2 + 10}
                                            textAnchor="middle" dominantBaseline="middle"
                                            fill="rgba(255,255,255,0.4)" fontSize="7.5" fontWeight="500"
                                            style={{ pointerEvents: 'none' }}
                                        >
                                            {bi.departments.split(',')[0]}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* You are here marker */}
                            <g>
                                <circle cx="300" cy="150" r="5" fill="#00d4ff" />
                                <circle cx="300" cy="150" r="10" fill="none" stroke="#00d4ff" strokeWidth="1.5" opacity="0.5">
                                    <animate attributeName="r" from="7" to="16" dur="2s" repeatCount="indefinite" />
                                    <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
                                </circle>
                                <text x="300" y="168" textAnchor="middle" fill="#00d4ff" fontSize="8" fontWeight="700">📍 You</text>
                            </g>
                        </svg>
                    </div>

                    {/* Info Panel */}
                    <div className="map-info">
                        {info ? (
                            <div className="map-info-detail" style={{ animation: 'fadeUp 0.3s var(--ease)' }}>
                                <div className="map-info-badge" style={{ background: `${info.color}15`, color: info.color }}>
                                    <i className={`fas ${info.icon}`}></i>
                                </div>
                                <h3>{info.name}</h3>
                                <div className="map-info-tags">
                                    <span className="map-tag"><i className="fas fa-layer-group"></i> {info.floors} Floor{info.floors > 1 ? 's' : ''}</span>
                                    <span className="map-tag"><i className="fas fa-walking"></i> {info.distance}</span>
                                </div>
                                <div className="map-info-section">
                                    <span className="map-info-section-title">Departments</span>
                                    <p>{info.departments}</p>
                                </div>
                                <div className="map-info-section">
                                    <span className="map-info-section-title">Facilities</span>
                                    <p>{info.facilities}</p>
                                </div>
                                <div className="map-info-section">
                                    <span className="map-info-section-title">Hours</span>
                                    <p><i className="fas fa-clock" style={{ color: 'var(--emerald)', marginRight: 6 }}></i>{info.hours}</p>
                                </div>
                                <button className="btn btn-sm btn-secondary" style={{ marginTop: 12 }} onClick={() => setSelected(null)}>
                                    <i className="fas fa-times"></i> Close
                                </button>
                            </div>
                        ) : (
                            <div className="map-info-placeholder">
                                <div className="map-placeholder-icon">
                                    <i className="fas fa-map-marker-alt"></i>
                                </div>
                                <h4>Select a Building</h4>
                                <p>Click on any building on the map to view its details, facilities, and timings.</p>
                                <div className="map-quick-stats">
                                    <div className="map-quick-stat">
                                        <span className="map-qs-value">15</span>
                                        <span className="map-qs-label">Buildings</span>
                                    </div>
                                    <div className="map-quick-stat">
                                        <span className="map-qs-value">30+</span>
                                        <span className="map-qs-label">Labs</span>
                                    </div>
                                    <div className="map-quick-stat">
                                        <span className="map-qs-value">25</span>
                                        <span className="map-qs-label">Acres</span>
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
