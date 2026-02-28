import React from 'react';
import { useApp } from '../context/AppContext';

export default function Settings() {
    const { theme, toggleTheme, settings, updateSetting, showToast } = useApp();

    return (
        <div className="page-transition">
            <div className="page-header">
                <h1><i className="fas fa-cog"></i> Settings</h1>
                <p className="subtitle">Customize your experience and manage application preferences</p>
            </div>

            <div className="glass-card" style={{ maxWidth: 800, margin: '0 auto' }}>
                <div style={{ padding: '0 8px' }}>
                    <div className="setting-section">
                        <h4 style={{ marginBottom: 20, color: 'var(--cyan)', borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                            <i className="fas fa-palette" style={{ marginRight: 8 }}></i> Appearance
                        </h4>
                        <div className="setting-item">
                            <div className="setting-label"><strong>Dark Mode</strong><span>Switch between light and dark themes</span></div>
                            <label className="toggle-switch">
                                <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>

                    <div className="setting-section" style={{ marginTop: 40 }}>
                        <h4 style={{ marginBottom: 20, color: 'var(--purple)', borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                            <i className="fas fa-bell" style={{ marginRight: 8 }}></i> Notifications
                        </h4>
                        <div className="setting-item">
                            <div className="setting-label"><strong>Push Notifications</strong><span>Get instant browser alerts for important updates</span></div>
                            <label className="toggle-switch">
                                <input type="checkbox" checked={settings.pushNotifs} onChange={() => { updateSetting('pushNotifs', !settings.pushNotifs); showToast(settings.pushNotifs ? '🔕 Notifications off' : '🔔 Notifications on', 'info', 2000); }} />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="setting-item">
                            <div className="setting-label"><strong>Email Digests</strong><span>Receive weekly summaries of classes and events</span></div>
                            <label className="toggle-switch">
                                <input type="checkbox" checked={settings.emailDigests} onChange={() => { updateSetting('emailDigests', !settings.emailDigests); showToast(settings.emailDigests ? '📧 Digests off' : '📧 Digests on', 'info', 2000); }} />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>

                    <div className="setting-section" style={{ marginTop: 40 }}>
                        <h4 style={{ marginBottom: 20, color: 'var(--emerald)', borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                            <i className="fas fa-globe" style={{ marginRight: 8 }}></i> Localization
                        </h4>
                        <div className="setting-item">
                            <div className="setting-label"><strong>Language</strong><span>Select your preferred interface language</span></div>
                            <select className="setting-select" value={settings.language} onChange={e => { updateSetting('language', e.target.value); showToast(`🌐 Language set to ${e.target.options[e.target.selectedIndex].text}`, 'success', 2000); }}>
                                <option value="en">English</option>
                                <option value="hi">Hindi</option>
                                <option value="ta">Tamil</option>
                                <option value="te">Telugu</option>
                            </select>
                        </div>
                    </div>

                    <div className="setting-section" style={{ marginTop: 40 }}>
                        <h4 style={{ marginBottom: 20, color: 'var(--rose)', borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                            <i className="fas fa-shield-alt" style={{ marginRight: 8 }}></i> Privacy & Security
                        </h4>
                        <div className="setting-item">
                            <div className="setting-label"><strong>Public Profile</strong><span>Allow other students to find you</span></div>
                            <label className="toggle-switch">
                                <input type="checkbox" checked={true} readOnly />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        <div style={{ marginTop: 16 }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => showToast('🔑 Password reset link sent to your email!', 'info')}>
                                Change Password
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
