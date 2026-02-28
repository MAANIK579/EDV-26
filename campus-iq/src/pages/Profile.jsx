import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
    const { todos, addTodo, toggleTodo, deleteTodo, showToast } = useApp();
    const { user, token, setUser } = useAuth();

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editData, setEditData] = useState({
        name: user?.name || '',
        rollNo: user?.rollNo || '',
        course: user?.course || '',
        semester: user?.semester || '',
        block: user?.block || '',
        fatherName: user?.fatherName || '',
        motherName: user?.motherName || ''
    });

    const handleStartEdit = () => {
        setEditData({
            name: user?.name || '',
            rollNo: user?.rollNo || '',
            course: user?.course || '',
            semester: user?.semester || '',
            block: user?.block || '',
            fatherName: user?.fatherName || '',
            motherName: user?.motherName || ''
        });
        setIsEditing(true);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
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
        } finally {
            setSaving(false);
        }
    };

    // Pomodoro Timer
    const [pomodoroMode, setPomodoroMode] = useState('work');
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

    const completedTodos = todos.filter(t => t.done).length;
    const pomodoroPercent = pomodoroMode === 'work'
        ? ((25 * 60 - pomodoroTime) / (25 * 60)) * 100
        : ((5 * 60 - pomodoroTime) / (5 * 60)) * 100;

    const infoItems = [
        { icon: 'fa-id-card', label: 'Roll Number', value: user?.rollNo },
        { icon: 'fa-graduation-cap', label: 'Course', value: user?.course },
        { icon: 'fa-layer-group', label: 'Semester', value: user?.semester ? `Semester ${user.semester}` : null },
        { icon: 'fa-building', label: 'Block / Hostel', value: user?.block },
        { icon: 'fa-user-tie', label: "Father's Name", value: user?.fatherName },
        { icon: 'fa-user', label: "Mother's Name", value: user?.motherName },
        { icon: 'fa-envelope', label: 'Email', value: user?.email },
    ];

    return (
        <div className="page-transition">
            <div className="page-header">
                <h1><i className="fas fa-user-circle"></i> My Profile</h1>
                <p className="subtitle">Your academic identity and personal workspace</p>
            </div>

            <div className="profile-layout">
                {/* ─── Left Column: Profile Hero + Details ─── */}
                <div className="profile-left-col">
                    {/* Hero Card */}
                    <div className="profile-hero-card">
                        <div className="profile-hero-banner">
                            <div className="profile-hero-banner-pattern"></div>
                        </div>
                        <div className="profile-hero-body">
                            <div className="profile-hero-avatar">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="Profile" />
                                <span className="profile-status-dot"></span>
                            </div>
                            <div className="profile-hero-info">
                                <h2 className="profile-hero-name">{user?.name || 'Student'}</h2>
                                <span className="profile-hero-role">
                                    <i className="fas fa-shield-alt"></i>
                                    {user?.role === 'admin' ? 'Administrator' : 'Student'}
                                </span>
                                <p className="profile-hero-email">
                                    <i className="fas fa-envelope"></i> {user?.email}
                                </p>
                            </div>
                            {!isEditing && (
                                <button className="btn btn-primary profile-edit-btn" onClick={handleStartEdit}>
                                    <i className="fas fa-pen"></i> Edit Profile
                                </button>
                            )}
                        </div>

                        {/* Quick Stats */}
                        <div className="profile-stats-bar">
                            <div className="profile-stat-item">
                                <span className="profile-stat-value">{user?.semester || '—'}</span>
                                <span className="profile-stat-label">Semester</span>
                            </div>
                            <div className="profile-stat-divider"></div>
                            <div className="profile-stat-item">
                                <span className="profile-stat-value">{user?.cgpa || '8.9'}</span>
                                <span className="profile-stat-label">CGPA</span>
                            </div>
                            <div className="profile-stat-divider"></div>
                            <div className="profile-stat-item">
                                <span className="profile-stat-value">{user?.attendance || '92%'}</span>
                                <span className="profile-stat-label">Attendance</span>
                            </div>
                            <div className="profile-stat-divider"></div>
                            <div className="profile-stat-item">
                                <span className="profile-stat-value">{completedTodos}/{todos.length}</span>
                                <span className="profile-stat-label">Tasks Done</span>
                            </div>
                        </div>
                    </div>

                    {/* Info / Edit Card */}
                    <div className="profile-details-card">
                        {!isEditing ? (
                            <>
                                <div className="profile-details-header">
                                    <h3><i className="fas fa-info-circle"></i> Personal Information</h3>
                                </div>
                                <div className="profile-info-grid">
                                    {infoItems.map((item, idx) => (
                                        <div className="profile-info-item" key={idx}>
                                            <div className="profile-info-icon">
                                                <i className={`fas ${item.icon}`}></i>
                                            </div>
                                            <div className="profile-info-content">
                                                <span className="profile-info-label">{item.label}</span>
                                                <span className={`profile-info-value ${!item.value ? 'empty' : ''}`}>
                                                    {item.value || 'Not set'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="profile-details-header">
                                    <h3><i className="fas fa-edit"></i> Edit Information</h3>
                                    <button className="btn btn-sm btn-secondary" onClick={() => setIsEditing(false)}>
                                        <i className="fas fa-times"></i> Cancel
                                    </button>
                                </div>
                                <form onSubmit={handleUpdateProfile} className="profile-edit-form">
                                    <div className="profile-form-row full">
                                        <label>
                                            <i className="fas fa-user"></i> Full Name
                                        </label>
                                        <input
                                            value={editData.name}
                                            onChange={e => setEditData({ ...editData, name: e.target.value })}
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>
                                    <div className="profile-form-row">
                                        <label>
                                            <i className="fas fa-id-card"></i> Roll No
                                        </label>
                                        <input
                                            value={editData.rollNo}
                                            onChange={e => setEditData({ ...editData, rollNo: e.target.value })}
                                            placeholder="e.g. 2024CSE001"
                                        />
                                    </div>
                                    <div className="profile-form-row">
                                        <label>
                                            <i className="fas fa-layer-group"></i> Semester
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="8"
                                            value={editData.semester}
                                            onChange={e => setEditData({ ...editData, semester: e.target.value })}
                                            placeholder="1-8"
                                        />
                                    </div>
                                    <div className="profile-form-row full">
                                        <label>
                                            <i className="fas fa-graduation-cap"></i> Course
                                        </label>
                                        <input
                                            value={editData.course}
                                            onChange={e => setEditData({ ...editData, course: e.target.value })}
                                            placeholder="e.g. B.Tech Computer Science"
                                        />
                                    </div>
                                    <div className="profile-form-row full">
                                        <label>
                                            <i className="fas fa-building"></i> Block / Hostel
                                        </label>
                                        <input
                                            value={editData.block}
                                            onChange={e => setEditData({ ...editData, block: e.target.value })}
                                            placeholder="e.g. Block A, Room 304"
                                        />
                                    </div>
                                    <div className="profile-form-row">
                                        <label>
                                            <i className="fas fa-user-tie"></i> Father's Name
                                        </label>
                                        <input
                                            value={editData.fatherName}
                                            onChange={e => setEditData({ ...editData, fatherName: e.target.value })}
                                            placeholder="Father's full name"
                                        />
                                    </div>
                                    <div className="profile-form-row">
                                        <label>
                                            <i className="fas fa-user"></i> Mother's Name
                                        </label>
                                        <input
                                            value={editData.motherName}
                                            onChange={e => setEditData({ ...editData, motherName: e.target.value })}
                                            placeholder="Mother's full name"
                                        />
                                    </div>
                                    <div className="profile-form-actions">
                                        <button type="submit" className="btn btn-primary" disabled={saving}>
                                            {saving ? (
                                                <><i className="fas fa-spinner fa-spin"></i> Saving...</>
                                            ) : (
                                                <><i className="fas fa-check"></i> Save Changes</>
                                            )}
                                        </button>
                                        <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                                            Discard
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>

                {/* ─── Right Column: Widgets ─── */}
                <div className="profile-right-col">
                    {/* Pomodoro Timer */}
                    <div className="profile-widget-card">
                        <div className="profile-widget-header">
                            <h3><i className="fas fa-hourglass-half" style={{ color: 'var(--pink)' }}></i> Focus Timer</h3>
                            <span className={`profile-mode-badge ${pomodoroMode}`}>
                                {pomodoroMode === 'work' ? '🎯 Focus' : '☕ Break'}
                            </span>
                        </div>
                        <div className="pomodoro-ring-container">
                            <svg className="pomodoro-ring" viewBox="0 0 120 120">
                                <circle className="pomodoro-ring-bg" cx="60" cy="60" r="52" />
                                <circle
                                    className="pomodoro-ring-progress"
                                    cx="60" cy="60" r="52"
                                    style={{
                                        strokeDasharray: `${2 * Math.PI * 52}`,
                                        strokeDashoffset: `${2 * Math.PI * 52 * (1 - pomodoroPercent / 100)}`,
                                        stroke: pomodoroMode === 'work' ? 'var(--emerald)' : 'var(--amber)'
                                    }}
                                />
                            </svg>
                            <div className="pomodoro-ring-text">
                                <span className="pomodoro-ring-time">{formatTime(pomodoroTime)}</span>
                                <span className="pomodoro-ring-label">{pomodoroMode === 'work' ? 'minutes left' : 'break time'}</span>
                            </div>
                        </div>
                        <div className="pomodoro-buttons">
                            <button
                                className={`btn ${pomodoroRunning ? 'btn-danger' : 'btn-primary'}`}
                                onClick={() => setPomodoroRunning(!pomodoroRunning)}
                            >
                                <i className={`fas ${pomodoroRunning ? 'fa-pause' : 'fa-play'}`}></i>
                                {pomodoroRunning ? 'Pause' : 'Start'}
                            </button>
                            <button className="btn btn-secondary" onClick={resetPomodoro}>
                                <i className="fas fa-redo"></i> Reset
                            </button>
                        </div>
                    </div>

                    {/* Todo Manager */}
                    <div className="profile-widget-card">
                        <div className="profile-widget-header">
                            <h3><i className="fas fa-tasks" style={{ color: 'var(--green)' }}></i> Priority Tasks</h3>
                            <span className="profile-task-count">
                                {completedTodos}/{todos.length}
                            </span>
                        </div>
                        {todos.length > 0 && (
                            <div className="profile-task-progress-bar">
                                <div
                                    className="profile-task-progress-fill"
                                    style={{ width: todos.length > 0 ? `${(completedTodos / todos.length) * 100}%` : '0%' }}
                                ></div>
                            </div>
                        )}
                        <form className="profile-todo-form" onSubmit={handleAddTodo}>
                            <input
                                name="todoText"
                                placeholder="Add a new task..."
                            />
                            <button type="submit" className="btn btn-primary btn-sm">
                                <i className="fas fa-plus"></i>
                            </button>
                        </form>
                        <div className="profile-todo-list">
                            {todos.length === 0 && (
                                <div className="profile-empty-state">
                                    <i className="fas fa-clipboard-check"></i>
                                    <p>No tasks yet. Add one above!</p>
                                </div>
                            )}
                            {todos.map(todo => (
                                <div key={todo.id} className={`profile-todo-item ${todo.done ? 'done' : ''}`}>
                                    <div className="profile-todo-check" onClick={() => toggleTodo(todo.id)}>
                                        <i className="fas fa-check"></i>
                                    </div>
                                    <span className="profile-todo-text">{todo.text}</span>
                                    <span className="profile-todo-delete" onClick={() => deleteTodo(todo.id)}>
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
