import React, { useState, useEffect, useMemo } from 'react';

// Room database with schedule
const allRooms = [
    // Classrooms
    { id: 'R101', number: '101', floor: '1st Floor', building: 'Main Block', type: 'Classroom', capacity: 60, schedule: { 9: 'DSA', 10: 'OS', 14: 'CN' } },
    { id: 'R102', number: '102', floor: '1st Floor', building: 'Main Block', type: 'Classroom', capacity: 60, schedule: { 9: 'Prob & Stats', 11: 'Ethics' } },
    { id: 'R105', number: '105', floor: '1st Floor', building: 'Main Block', type: 'Classroom', capacity: 40, schedule: { 10: 'OS', 14: 'OS' } },
    { id: 'R201', number: '201', floor: '2nd Floor', building: 'Main Block', type: 'Seminar Hall', capacity: 100, schedule: { 15: 'Workshop' } },
    { id: 'R205', number: '205', floor: '2nd Floor', building: 'Main Block', type: 'Classroom', capacity: 60, schedule: { 9: 'CN', 14: 'CN' } },
    { id: 'R301', number: '301', floor: '3rd Floor', building: 'Main Block', type: 'Smart Classroom', capacity: 50, schedule: { 9: 'DSA', 11: 'DSA' } },
    { id: 'R302', number: '302', floor: '3rd Floor', building: 'Main Block', type: 'Classroom', capacity: 50, schedule: { 14: 'CN Lab' } },
    { id: 'R314', number: '314', floor: '3rd Floor', building: 'Main Block', type: 'Classroom', capacity: 45, schedule: { 10: 'Math' } },
    { id: 'R315', number: '315', floor: '3rd Floor', building: 'Main Block', type: 'Classroom', capacity: 45, schedule: { 9: 'Physics', 10: 'Chemistry', 14: 'Math' } },
    { id: 'R401', number: '401', floor: '4th Floor', building: 'Main Block', type: 'Classroom', capacity: 55, schedule: { 10: 'Prof. Ethics', 15: 'Prof. Ethics' } },
    { id: 'R402', number: '402', floor: '4th Floor', building: 'Main Block', type: 'Conference Room', capacity: 30, schedule: {} },
    // Labs
    { id: 'L201', number: 'Lab 201', floor: '2nd Floor', building: 'CS Block', type: 'Computer Lab', capacity: 40, schedule: { 16: 'Web Dev' } },
    { id: 'L204', number: 'Lab 204', floor: '2nd Floor', building: 'CS Block', type: 'AI/ML Lab', capacity: 35, schedule: { 9: 'ML', 11: 'ML' } },
    { id: 'L301', number: 'Lab 301', floor: '3rd Floor', building: 'CS Block', type: 'Programming Lab', capacity: 40, schedule: { 14: 'DSA Lab' } },
    { id: 'L302', number: 'Lab 302', floor: '3rd Floor', building: 'CS Block', type: 'Networking Lab', capacity: 35, schedule: { 14: 'CN Lab' } },
    { id: 'L303', number: 'Lab 303', floor: '3rd Floor', building: 'CS Block', type: 'IoT Lab', capacity: 25, schedule: {} },
    { id: 'P101', number: 'Physics Lab', floor: '1st Floor', building: 'Science Block', type: 'Lab', capacity: 30, schedule: { 10: 'Physics Lab' } },
    { id: 'C101', number: 'Chem Lab', floor: '1st Floor', building: 'Science Block', type: 'Lab', capacity: 30, schedule: { 11: 'Chemistry Lab' } },
];

import { useAuth } from '../context/AuthContext';

export default function RoomOccupancy() {
    const { token, isAuthenticated } = useAuth();
    const [fetchedRooms, setFetchedRooms] = useState([]);

    // UI State
    const [currentHour, setCurrentHour] = useState(new Date().getHours());
    const [filter, setFilter] = useState('all'); // all, available, occupied
    const [floorFilter, setFloorFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isAuthenticated && token) {
            fetch('http://localhost:5000/api/rooms', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => setFetchedRooms(data))
                .catch(err => console.error('Failed to fetch rooms', err));
        }
    }, [isAuthenticated, token]);

    // Update current hour every minute
    useEffect(() => {
        const id = setInterval(() => setCurrentHour(new Date().getHours()), 60000);
        return () => clearInterval(id);
    }, []);

    const rooms = useMemo(() => {
        return fetchedRooms.map(room => {
            let isOccupied = false;
            let currentClass = null;

            if (room.statusOverride) {
                isOccupied = room.statusOverride === 'occupied';
                currentClass = isOccupied ? 'Manual Override' : null;
            } else if (room.schedule) {
                const scheduleData = typeof room.schedule === 'string' ? JSON.parse(room.schedule) : room.schedule;
                const classAtHour = scheduleData[currentHour.toString()];
                if (classAtHour) {
                    isOccupied = true;
                    currentClass = classAtHour;
                }
            }

            return {
                ...room,
                floor: room.building, // Adjust based on DB format or keep placeholder 
                isOccupied,
                currentClass,
                nextEvent: { type: isOccupied ? 'occupied' : 'free', time: 'Next Hour' }
            };
        });
    }, [currentHour, fetchedRooms]);

    const filteredRooms = rooms.filter(room => {
        if (filter === 'available' && room.isOccupied) return false;
        if (filter === 'occupied' && !room.isOccupied) return false;
        if (floorFilter !== 'all' && room.floor !== floorFilter) return false;
        if (searchQuery && !room.number.toLowerCase().includes(searchQuery.toLowerCase()) && !room.building.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const availableCount = rooms.filter(r => !r.isOccupied).length;
    const occupiedCount = rooms.filter(r => r.isOccupied).length;

    const floors = [...new Set(fetchedRooms.map(r => 'Main Floor'))];

    const h12 = currentHour > 12 ? currentHour - 12 : currentHour;
    const ampm = currentHour >= 12 ? 'PM' : 'AM';

    return (
        <div className="page-transition">
            <div className="page-header">
                <h1><i className="fas fa-door-open"></i> Room Occupancy Tracker</h1>
                <p className="subtitle">Real-time room availability across campus — showing status for <strong>{h12}:00 {ampm}</strong></p>
            </div>

            {/* Quick Stats */}
            <div className="stats-grid" style={{ marginBottom: 20 }}>
                <div className="stat-card" style={{ '--accent': 'var(--green)' }}>
                    <div className="stat-icon" style={{ color: 'var(--green)' }}><i className="fas fa-door-open"></i></div>
                    <div><div className="stat-value">{availableCount}</div><div className="stat-label">Available Rooms</div></div>
                </div>
                <div className="stat-card" style={{ '--accent': 'var(--red)' }}>
                    <div className="stat-icon" style={{ color: 'var(--red)' }}><i className="fas fa-lock"></i></div>
                    <div><div className="stat-value">{occupiedCount}</div><div className="stat-label">Occupied Rooms</div></div>
                </div>
                <div className="stat-card" style={{ '--accent': 'var(--cyan)' }}>
                    <div className="stat-icon" style={{ color: 'var(--cyan)' }}><i className="fas fa-building"></i></div>
                    <div><div className="stat-value">{rooms.length}</div><div className="stat-label">Total Rooms</div></div>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Search rooms..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', minWidth: 180 }}
                    />
                    <div className="room-filter-bar" style={{ margin: 0 }}>
                        {['all', 'available', 'occupied'].map(f => (
                            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                                {f === 'all' ? '🏢 All' : f === 'available' ? '✅ Available' : '🔴 Occupied'}
                            </button>
                        ))}
                    </div>
                    <select
                        className="setting-select"
                        value={floorFilter}
                        onChange={e => setFloorFilter(e.target.value)}
                    >
                        <option value="all">All Floors</option>
                        {floors.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
            </div>

            {/* Room Grid */}
            <div className="rooms-grid">
                {filteredRooms.map(room => (
                    <div key={room.id} className={`room-card ${room.isOccupied ? 'occupied' : 'available'}`}>
                        <div className="room-number">{room.number}</div>
                        <div className="room-type">{room.type} · {room.building}</div>

                        <div className={`room-status-badge ${room.isOccupied ? 'occupied' : 'available'}`}>
                            <i className={`fas ${room.isOccupied ? 'fa-lock' : 'fa-check-circle'}`}></i>
                            {room.isOccupied ? 'Occupied' : 'Available'}
                        </div>

                        {room.isOccupied && room.currentClass && (
                            <div className="room-detail">
                                <i className="fas fa-chalkboard-teacher"></i> {room.currentClass}
                            </div>
                        )}

                        <div className="room-detail">
                            <i className="fas fa-users"></i> Capacity: {room.capacity} seats
                        </div>

                        {room.nextEvent && (
                            <div className="room-detail" style={{ color: room.nextEvent.type === 'free' ? 'var(--green)' : 'var(--amber)' }}>
                                <i className={`fas ${room.nextEvent.type === 'free' ? 'fa-clock' : 'fa-exclamation-circle'}`}></i>
                                {room.nextEvent.type === 'free'
                                    ? `Free at ${room.nextEvent.time}`
                                    : `${room.nextEvent.class} at ${room.nextEvent.time}`
                                }
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {filteredRooms.length === 0 && (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-dim)' }}>
                    <i className="fas fa-search" style={{ fontSize: 32, marginBottom: 12, display: 'block', opacity: 0.3 }}></i>
                    No rooms match your filters
                </div>
            )}
        </div>
    );
}
