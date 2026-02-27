import React from 'react';

const scheduleData = {
    '09:00 - 10:00': { Mon: { name: 'Data Structures', room: 'Room 301', color: '#00d4ff' }, Tue: { name: 'Machine Learning', room: 'Lab 204', color: '#7c3aed' }, Wed: { name: 'Data Structures', room: 'Room 301', color: '#00d4ff' }, Thu: { name: 'Computer Networks', room: 'Room 205', color: '#fbbf24' }, Fri: { name: 'Prob & Stats', room: 'Room 102', color: '#34d399' } },
    '10:00 - 11:00': { Mon: { name: 'Operating Systems', room: 'Room 105', color: '#f472b6' }, Tue: null, Wed: { name: 'Operating Systems', room: 'Room 105', color: '#f472b6' }, Thu: { name: 'Prof. Ethics', room: 'Room 401', color: '#f97316' }, Fri: { name: 'Machine Learning', room: 'Lab 204', color: '#7c3aed' } },
    '11:00 - 12:00': { Mon: { name: 'Machine Learning', room: 'Lab 204', color: '#7c3aed' }, Tue: { name: 'Data Structures', room: 'Room 301', color: '#00d4ff' }, Wed: null, Thu: { name: 'Machine Learning', room: 'Lab 204', color: '#7c3aed' }, Fri: null },
    '12:00 - 01:00': { Mon: null, Tue: null, Wed: null, Thu: null, Fri: null },
    '01:00 - 02:00': { Mon: { name: 'Prob & Stats', room: 'Room 102', color: '#34d399' }, Tue: { name: 'Computer Networks', room: 'Room 205', color: '#fbbf24' }, Wed: { name: 'Prob & Stats', room: 'Room 102', color: '#34d399' }, Thu: null, Fri: { name: 'Operating Systems', room: 'Room 105', color: '#f472b6' } },
    '02:00 - 03:00': { Mon: { name: 'Computer Networks', room: 'Room 205', color: '#fbbf24' }, Tue: { name: 'Prof. Ethics', room: 'Room 401', color: '#f97316' }, Wed: { name: 'Computer Networks', room: 'Lab 302', color: '#fbbf24' }, Thu: { name: 'Data Structures', room: 'Lab 301', color: '#00d4ff' }, Fri: null },
    '03:00 - 04:00': { Mon: null, Tue: null, Wed: { name: 'Prof. Ethics', room: 'Room 401', color: '#f97316' }, Thu: null, Fri: { name: 'Computer Networks', room: 'Room 205', color: '#fbbf24' } }
};

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export default function Schedule() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0=Sun, 1=Mon

    return (
        <div className="page-transition">
            <div className="page-header">
                <h1><i className="fas fa-calendar-alt"></i> Weekly Schedule</h1>
                <p className="subtitle">Your class timetable for this week</p>
            </div>

            <div className="glass-card">
                <div className="schedule-table-wrap">
                    <table className="schedule-table">
                        <thead>
                            <tr>
                                <th>Time</th>
                                {days.map(d => <th key={d}>{d}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(scheduleData).map(([time, slots]) => {
                                const hourNum = parseInt(time.split(':')[0]);
                                return (
                                    <tr key={time}>
                                        <td className="time-cell">{time}</td>
                                        {days.map((day, di) => {
                                            const cls = slots[day];
                                            const isNow = currentHour === hourNum && currentDay === di + 1;
                                            return (
                                                <td key={day}>
                                                    {cls ? (
                                                        <div className={`class-block ${isNow ? 'now' : ''}`} style={{ '--accent': cls.color, borderLeftColor: cls.color }}>
                                                            <span className="class-name">{cls.name}</span>
                                                            <span className="class-room">{cls.room}</span>
                                                            {isNow && <span className="live-badge" style={{ marginTop: 4 }}>NOW</span>}
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>—</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
