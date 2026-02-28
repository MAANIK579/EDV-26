import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000/api';

export default function StudentClubs() {
    const { token, user } = useAuth();
    const { showToast } = useApp();
    const navigate = useNavigate();
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchClubs = useCallback(() => {
        if (!token) return;
        fetch(`${API}/clubs`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch clubs');
                return res.json();
            })
            .then(data => {
                setClubs(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                showToast('Failed to load clubs', 'error');
                setLoading(false);
            });
    }, [token, showToast]);

    useEffect(() => {
        fetchClubs();
        const interval = setInterval(fetchClubs, 15000); // 15s polling
        return () => clearInterval(interval);
    }, [fetchClubs]);

    const toggleJoin = async (clubId, clubName, isMember) => {
        try {
            const res = await fetch(`${API}/clubs/${clubId}/toggle`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to toggle membership');

            showToast(isMember ? `Left ${clubName}` : `Successfully joined ${clubName}!`, 'success');
            // Optimistic UI update
            setClubs(prev => prev.map(c => c.id === clubId ? { ...c, isMember: !isMember } : c));
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading clubs...</div>;

    const myClubs = clubs.filter(c => c.isMember);
    const availableClubs = clubs.filter(c => !c.isMember);

    const ClubCard = ({ club }) => (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: 18, color: 'var(--text-primary)', margin: 0 }}>{club.name}</h3>
                <span style={{
                    padding: '4px 10px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600,
                    backgroundColor: club.category === 'technical' ? '#00d4ff20' :
                        club.category === 'cultural' ? '#f472b620' : '#8b5cf620',
                    color: club.category === 'technical' ? '#00d4ff' :
                        club.category === 'cultural' ? '#f472b6' : '#8b5cf6'
                }}>
                    {club.category}
                </span>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: 14, flex: 1, margin: 0, lineHeight: 1.5 }}>
                {club.description}
            </p>

            <button
                className={`btn ${club.isMember ? 'btn-outline' : 'btn-primary'}`}
                style={{ width: '100%', marginTop: 'auto' }}
                onClick={() => toggleJoin(club.id, club.name, club.isMember)}
            >
                {club.isMember ? 'Leave Club' : 'Join Club'}
            </button>
        </div>
    );

    return (
        <div className="page-transition" style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 40 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/services')} style={{ marginBottom: 20 }}>
                <i className="fas fa-arrow-left"></i> Back to Campus Hub
            </button>

            <div className="page-header" style={{ marginBottom: 40 }}>
                <h1><i className="fas fa-users" style={{ color: '#8b5cf6' }}></i> Student Clubs</h1>
                <p className="subtitle">Discover communities, join clubs, and connect with peers.</p>
            </div>

            {myClubs.length > 0 && (
                <div style={{ marginBottom: 48 }}>
                    <h2 style={{ fontSize: 20, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <i className="fas fa-star" style={{ color: 'var(--yellow)' }}></i> My Clubs
                    </h2>
                    <div className="grid-3">
                        {myClubs.map(club => <ClubCard key={club.id} club={club} />)}
                    </div>
                </div>
            )}

            <div>
                <h2 style={{ fontSize: 20, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <i className="fas fa-compass" style={{ color: 'var(--cyan)' }}></i> Discover Clubs
                </h2>
                {availableClubs.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No more clubs available to join.</p>
                ) : (
                    <div className="grid-3">
                        {availableClubs.map(club => <ClubCard key={club.id} club={club} />)}
                    </div>
                )}
            </div>
        </div>
    );
}
