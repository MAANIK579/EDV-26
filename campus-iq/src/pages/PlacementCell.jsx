import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000/api';

export default function PlacementCell() {
    const { token } = useAuth();
    const { showToast } = useApp();
    const navigate = useNavigate();

    const [placements, setPlacements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        let isMounted = true;
        const fetchPlacements = async () => {
            try {
                const res = await fetch(`${API}/placements`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (isMounted) setPlacements(data);
                }
            } catch (err) {
                console.error("Failed to fetch placements", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (token) fetchPlacements();

        // Polling for updates
        const intervalId = setInterval(fetchPlacements, 15000);
        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [token]);

    const toggleApply = async (id, currentStatus) => {
        // Optimistic UI update
        setPlacements(prev => prev.map(p =>
            p.id === id ? { ...p, hasApplied: !currentStatus } : p
        ));

        try {
            const res = await fetch(`${API}/placements/${id}/apply`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (res.ok) {
                showToast(currentStatus ? 'Application withdrawn' : 'Successfully applied!', currentStatus ? 'info' : 'success');
            } else {
                throw new Error(data.error || 'Failed to update application');
            }
        } catch (err) {
            // Revert optimistic update on error
            setPlacements(prev => prev.map(p =>
                p.id === id ? { ...p, hasApplied: currentStatus } : p
            ));
            showToast(err.message, 'error');
        }
    };

    const myApplications = placements.filter(p => p.hasApplied);
    const availablePlacements = placements.filter(p => !p.hasApplied);

    const renderPlacementCard = (p) => (
        <div key={p.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', animation: 'slideUp 0.4s var(--ease) both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                    <h3 style={{ fontSize: 18, color: 'var(--text-primary)', marginBottom: 4 }}>{p.companyName}</h3>
                    <div style={{ color: 'var(--cyan)', fontWeight: 600, fontSize: 14 }}>{p.role}</div>
                </div>
                <div style={{ background: 'var(--bg-elevated)', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, border: '1px solid var(--border)', color: p.type === 'Internship' ? 'var(--pink)' : 'var(--purple)' }}>
                    {p.type}
                </div>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, flex: 1 }}>
                {p.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20, padding: 12, background: 'var(--bg-container)', borderRadius: 'var(--radius-md)' }}>
                <div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Salary / Pkg</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{p.salary}</div>
                </div>
                <div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Eligible Batch</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{p.eligibleBatch || 'Any'}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Apply Before</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: p.deadline ? (new Date(p.deadline) < new Date() ? 'var(--red)' : 'var(--text-primary)') : 'var(--text-primary)' }}>
                        {p.deadline ? new Date(p.deadline).toLocaleDateString() : 'N/A'}
                    </div>
                </div>
            </div>

            <button
                className={`btn ${p.hasApplied ? 'btn-secondary' : 'btn-primary'}`}
                style={{ width: '100%' }}
                onClick={() => toggleApply(p.id, p.hasApplied)}
            >
                {p.hasApplied ? (
                    <><i className="fas fa-check" style={{ marginRight: 6 }}></i>Applied</>
                ) : (
                    <><i className="fas fa-paper-plane" style={{ marginRight: 6 }}></i>Apply Now</>
                )}
            </button>
        </div>
    );

    return (
        <div className="page-transition" style={{ paddingBottom: 40 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/services')} style={{ marginBottom: 20 }}>
                <i className="fas fa-arrow-left"></i> Back to Campus Hub
            </button>

            <div className="page-header" style={{ marginBottom: 32 }}>
                <h1><i className="fas fa-briefcase" style={{ color: 'var(--pink)' }}></i> Placement Cell</h1>
                <p className="subtitle">Discover job opportunities, internships, and campus drives.</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                <button
                    onClick={() => setActiveTab('all')}
                    style={{ background: 'none', border: 'none', color: activeTab === 'all' ? 'var(--pink)' : 'var(--text-secondary)', padding: '8px 16px', fontSize: 15, fontWeight: activeTab === 'all' ? 600 : 400, cursor: 'pointer', position: 'relative' }}
                >
                    Available Drives
                    {activeTab === 'all' && <div style={{ position: 'absolute', bottom: -13, left: 0, right: 0, height: 2, background: 'var(--pink)', borderRadius: 2 }} />}
                </button>
                <button
                    onClick={() => setActiveTab('applied')}
                    style={{ background: 'none', border: 'none', color: activeTab === 'applied' ? 'var(--pink)' : 'var(--text-secondary)', padding: '8px 16px', fontSize: 15, fontWeight: activeTab === 'applied' ? 600 : 400, cursor: 'pointer', position: 'relative' }}
                >
                    My Applications <span style={{ marginLeft: 6, padding: '2px 8px', borderRadius: 12, background: 'var(--bg-elevated)', fontSize: 11 }}>{myApplications.length}</span>
                    {activeTab === 'applied' && <div style={{ position: 'absolute', bottom: -13, left: 0, right: 0, height: 2, background: 'var(--pink)', borderRadius: 2 }} />}
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>
                    <i className="fas fa-circle-notch fa-spin fa-2x"></i>
                    <div style={{ marginTop: 12 }}>Loading opportunities...</div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                    {activeTab === 'all' && (
                        availablePlacements.length > 0 ? availablePlacements.map(renderPlacementCard) :
                            <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                                <i className="fas fa-briefcase fa-3x" style={{ opacity: 0.2, marginBottom: 16 }}></i>
                                <h3>No new drives available</h3>
                                <p>Check back later for new opportunities.</p>
                            </div>
                    )}

                    {activeTab === 'applied' && (
                        myApplications.length > 0 ? myApplications.map(renderPlacementCard) :
                            <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                                <i className="fas fa-file-alt fa-3x" style={{ opacity: 0.2, marginBottom: 16 }}></i>
                                <h3>No applications yet</h3>
                                <p>You haven't applied to any drives yet. Check the Available Drives tab to get started!</p>
                            </div>
                    )}
                </div>
            )}
        </div>
    );
}
