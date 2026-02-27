import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
    const { theme, toggleTheme, settings, updateSetting, showToast, todos, addTodo, toggleTodo, deleteTodo } = useApp();
    const { user } = useAuth();

    const userName = user?.name || user?.email?.split('@')[0] || 'Student';
    const userEmail = user?.email || 'student@campus.edu';

    // Pomodoro Timer
    const [pomodoroMode, setPomodoroMode] = useState('work'); // work, break
    const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
    const [pomodoroRunning, setPomodoroRunning] = useState(false);

    useEffect(() => {
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
    }, [pomodoroRunning, pomodoroMode]);

    const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    const resetPomodoro = () => {
        setPomodoroRunning(false);
        setPomodoroMode('work');
        setPomodoroTime(25 * 60);
    };

    // Todo
    const [todoInput, setTodoInput] = useState('');
    const handleAddTodo = (e) => {
        e.preventDefault();
        if (!todoInput.trim()) return;
        addTodo(todoInput.trim());
        setTodoInput('');
    };

    return (
        <div className="page-transition">
            <div className="page-header">
                <h1><i className="fas fa-user-circle"></i> Profile & Settings</h1>
                <p className="subtitle">Manage your account, preferences, and productivity tools</p>
            </div>

            {/* Profile Card + Settings */}
            <div className="profile-grid">
                <div className="profile-card">
                    <div className="profile-banner"></div>
                    <div className="profile-avatar-wrap">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} alt="Profile" />
                    </div>
                    <h3>{userName}</h3>
                    <p className="subtitle">B.Tech Computer Science & Engineering</p>
                    <p className="meta">Semester 6 · Roll No. 2022CSE1234</p>
                    <div className="profile-stats">
                        <div><span className="ps-value">8.9</span><span className="ps-label">CGPA</span></div>
                        <div><span className="ps-value">87%</span><span className="ps-label">Attendance</span></div>
                        <div><span className="ps-value">6</span><span className="ps-label">Courses</span></div>
                    </div>
                    <div className="profile-contact">
                        <div className="contact-row"><i className="fas fa-envelope"></i> {userEmail}</div>
                        <div className="contact-row"><i className="fas fa-phone"></i> +91 98765 43210</div>
                        <div className="contact-row"><i className="fas fa-map-marker-alt"></i> Hostel B, Room 312</div>
                    </div>
                </div>

                <div className="glass-card">
                    <h3><i className="fas fa-cog" style={{ color: 'var(--cyan)', marginRight: 8 }}></i>Settings</h3>

                    <div className="setting-item">
                        <div className="setting-label"><strong>Dark Mode</strong><span>Toggle app theme</span></div>
                        <label className="toggle-switch">
                            <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="setting-item">
                        <div className="setting-label"><strong>Push Notifications</strong><span>Get instant alerts</span></div>
                        <label className="toggle-switch">
                            <input type="checkbox" checked={settings.pushNotifs} onChange={() => { updateSetting('pushNotifs', !settings.pushNotifs); showToast(settings.pushNotifs ? '🔕 Notifications off' : '🔔 Notifications on', 'info', 2000); }} />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="setting-item">
                        <div className="setting-label"><strong>Email Digests</strong><span>Weekly email summaries</span></div>
                        <label className="toggle-switch">
                            <input type="checkbox" checked={settings.emailDigests} onChange={() => { updateSetting('emailDigests', !settings.emailDigests); showToast(settings.emailDigests ? '📧 Digests off' : '📧 Digests on', 'info', 2000); }} />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="setting-item">
                        <div className="setting-label"><strong>Language</strong><span>Select preferred language</span></div>
                        <select className="setting-select" value={settings.language} onChange={e => { updateSetting('language', e.target.value); showToast(`🌐 Language set to ${e.target.options[e.target.selectedIndex].text}`, 'success', 2000); }}>
                            <option value="en">English</option>
                            <option value="hi">Hindi</option>
                            <option value="ta">Tamil</option>
                            <option value="te">Telugu</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Pomodoro + Todo */}
            <div className="grid-2" style={{ marginBottom: 24 }}>
                {/* Pomodoro Timer */}
                <div className="glass-card">
                    <h3><i className="fas fa-hourglass-half" style={{ color: 'var(--pink)', marginRight: 8 }}></i>Pomodoro Timer</h3>
                    <div className="pomodoro">
                        <div className="pomodoro-label">{pomodoroMode === 'work' ? '🎯 FOCUS TIME' : '☕ BREAK TIME'}</div>
                        <div className="pomodoro-timer">{formatTime(pomodoroTime)}</div>
                        <div className="pomodoro-buttons">
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
                    <h3><i className="fas fa-tasks" style={{ color: 'var(--green)', marginRight: 8 }}></i>Todo List ({todos.filter(t => !t.done).length} remaining)</h3>
                    <form className="todo-input-row" onSubmit={handleAddTodo}>
                        <input value={todoInput} onChange={e => setTodoInput(e.target.value)} placeholder="Add a new task…" />
                        <button type="submit" className="btn btn-primary btn-sm"><i className="fas fa-plus"></i></button>
                    </form>
                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                        {todos.length === 0 && (
                            <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-dim)', fontSize: 13 }}>
                                <i className="fas fa-inbox" style={{ fontSize: 24, marginBottom: 8, display: 'block', opacity: 0.3 }}></i>
                                No tasks yet. Add one above!
                            </div>
                        )}
                        {todos.map(todo => (
                            <div key={todo.id} className={`todo-item ${todo.done ? 'done' : ''}`}>
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
    );
}
