import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
    const { todos, addTodo, toggleTodo, deleteTodo, showToast } = useApp();
    const { user, token, setUser } = useAuth();

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: user?.name || '',
        rollNo: user?.rollNo || '',
        course: user?.course || '',
        semester: user?.semester || '',
        block: user?.block || '',
        fatherName: user?.fatherName || '',
        motherName: user?.motherName || ''
    });

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const API = 'http://localhost:5000/api';
            const res = await fetch(`${API}/auth/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editData)
            });
            const data = await res.json();
            if (data.success) {
                setUser(data.user);
                setIsEditing(false);
                showToast('✅ Profile updated successfully!', 'success');
            } else {
                showToast(data.error || 'Failed to update profile', 'error');
            }
        } catch (err) {
            showToast('Network error', 'error');
        }
    };

    // Pomodoro Timer
    const [pomodoroMode, setPomodoroMode] = useState('work'); // work, break
    const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
    const [pomodoroRunning, setPomodoroRunning] = useState(false);

    React.useEffect(() => {
        if (!pomodoroRunning) return;
        const id = setInterval(() => {
            setPomodoroTime(prev => {
                if (prev <= 0) {
                    setPomodoroRunning(false);
                    if (pomodoroMode === 'work') {
                        showToast('🎉 Work session complete! Take a break.', 'success', 3000);
                        setPomodoroMode('break');
                        return 5 * 60;
                    } else {
                        showToast('💪 Break over! Ready for another session?', 'info', 3000);
                        setPomodoroMode('work');
                        return 25 * 60;
                    }
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [pomodoroRunning, pomodoroMode, showToast]);

    const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    const resetPomodoro = () => {
        setPomodoroRunning(false);
        setPomodoroMode('work');
        setPomodoroTime(25 * 60);
    };

    const handleAddTodo = (e) => {
        e.preventDefault();
        const input = e.target.elements.todoText;
        if (!input.value.trim()) return;
        addTodo(input.value.trim());
        input.value = '';
    };

    return (
        <div className="page-transition">
            <div className="page-header">
                <h1><i className="fas fa-user-circle"></i> Student Profile</h1>
                <p className="subtitle">View and manage your academic and personal information</p>
            </div>

            <div className="profile-grid">
                <div className="profile-card" style={{ height: 'fit-content' }}>
                    <div className="profile-banner"></div>
                    <div className="profile-avatar-wrap">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="Profile" />
                    </div>
                    <div style={{ padding: '0 20px 20px' }}>
                        {!isEditing ? (
                            <>
                                <h3 style={{ marginBottom: 4 }}>{user?.name}</h3>
                                <p className="subtitle" style={{ color: 'var(--cyan)', fontWeight: 600 }}>{user?.course || 'Set your course'}</p>
                                <p className="meta" style={{ marginBottom: 20 }}>Semester {user?.semester || '—'} · Roll No. {user?.rollNo || '—'}</p>

                                <div className="profile-stats">
                                    <div><span className="ps-value">{user?.cgpa || '8.5'}</span><span className="ps-label">CGPA</span></div>
                                    <div><span className="ps-value">{user?.attendance || '92%'}</span><span className="ps-label">Attendance</span></div>
                                </div>

                                <div className="info-section" style={{ marginTop: 24, textAlign: 'left' }}>
                                    <h5 style={{ color: 'var(--text-dim)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Detailed Information</h5>
                                    <div className="contact-row"><i className="fas fa-id-card"></i> <strong>Roll No:</strong> {user?.rollNo || 'N/A'}</div>
                                    <div className="contact-row"><i className="fas fa-building"></i> <strong>Block/Hostel:</strong> {user?.block || 'N/A'}</div>
                                    <div className="contact-row"><i className="fas fa-user-tie"></i> <strong>Father's Name:</strong> {user?.fatherName || 'N/A'}</div>
                                    <div className="contact-row"><i className="fas fa-female"></i> <strong>Mother's Name:</strong> {user?.motherName || 'N/A'}</div>
                                    <div className="contact-row"><i className="fas fa-envelope"></i> <strong>Email:</strong> {user?.email}</div>
                                </div>

                                <button className="btn btn-primary w-100" style={{ marginTop: 24 }} onClick={() => setIsEditing(true)}>
                                    <i className="fas fa-edit"></i> Edit Profile
                                </button>
                            </>
                        ) : (
                            <form onSubmit={handleUpdateProfile} style={{ textAlign: 'left' }}>
                                <div className="form-group" style={{ marginBottom: 12 }}>
                                    <label style={{ fontSize: 12, color: 'var(--text-dim)' }}>Full Name</label>
                                    <input className="form-input" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} required />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div className="form-group" style={{ marginBottom: 12 }}>
                                        <label style={{ fontSize: 12, color: 'var(--text-dim)' }}>Roll No</label>
                                        <input className="form-input" value={editData.rollNo} onChange={e => setEditData({ ...editData, rollNo: e.target.value })} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 12 }}>
                                        <label style={{ fontSize: 12, color: 'var(--text-dim)' }}>Semester</label>
                                        <input type="number" className="form-input" value={editData.semester} onChange={e => setEditData({ ...editData, semester: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginBottom: 12 }}>
                                    <label style={{ fontSize: 12, color: 'var(--text-dim)' }}>Course</label>
                                    <input className="form-input" value={editData.course} onChange={e => setEditData({ ...editData, course: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 12 }}>
                                    <label style={{ fontSize: 12, color: 'var(--text-dim)' }}>Block / Hostel</label>
                                    <input className="form-input" value={editData.block} onChange={e => setEditData({ ...editData, block: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 12 }}>
                                    <label style={{ fontSize: 12, color: 'var(--text-dim)' }}>Father's Name</label>
                                    <input className="form-input" value={editData.fatherName} onChange={e => setEditData({ ...editData, fatherName: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 12 }}>
                                    <label style={{ fontSize: 12, color: 'var(--text-dim)' }}>Mother's Name</label>
                                    <input className="form-input" value={editData.motherName} onChange={e => setEditData({ ...editData, motherName: e.target.value })} />
                                </div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                                    <button type="submit" className="btn btn-primary flex-1">Save Changes</button>
                                    <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Pomodoro Timer */}
                    <div className="glass-card">
                        <h3><i className="fas fa-hourglass-half" style={{ color: 'var(--pink)', marginRight: 8 }}></i>Focus Timer</h3>
                        <div className="pomodoro">
                            <div className="pomodoro-label">{pomodoroMode === 'work' ? '🎯 FOCUS TIME' : '☕ BREAK TIME'}</div>
                            <div className="pomodoro-timer" style={{ fontSize: 48, fontWeight: 800 }}>{formatTime(pomodoroTime)}</div>
                            <div className="pomodoro-buttons" style={{ marginTop: 20 }}>
                                <button className={`btn ${pomodoroRunning ? 'btn-danger' : 'btn-primary'}`} onClick={() => setPomodoroRunning(!pomodoroRunning)}>
                                    <i className={`fas ${pomodoroRunning ? 'fa-pause' : 'fa-play'}`}></i>
                                    {pomodoroRunning ? 'Pause' : 'Start'}
                                </button>
                                <button className="btn btn-secondary" onClick={resetPomodoro}>
                                    <i className="fas fa-redo"></i> Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Todo Manager */}
                    <div className="glass-card">
                        <h3><i className="fas fa-tasks" style={{ color: 'var(--green)', marginRight: 8 }}></i>Priority Tasks</h3>
                        <form className="todo-input-row" onSubmit={handleAddTodo} style={{ marginBottom: 16 }}>
                            <input name="todoText" placeholder="What needs to be done?" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '10px 15px', borderRadius: 'var(--radius-md)', color: 'white', flex: 1 }} />
                            <button type="submit" className="btn btn-primary"><i className="fas fa-plus"></i></button>
                        </form>
                        <div style={{ maxHeight: 250, overflowY: 'auto' }}>
                            {todos.map(todo => (
                                <div key={todo.id} className={`todo-item ${todo.done ? 'done' : ''}`} style={{ padding: '10px 0' }}>
                                    <div className="todo-check" onClick={() => toggleTodo(todo.id)}>
                                        <i className="fas fa-check"></i>
                                    </div>
                                    <span className="todo-text">{todo.text}</span>
                                    <span className="todo-delete" onClick={() => deleteTodo(todo.id)}>
                                        <i className="fas fa-trash-alt"></i>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

