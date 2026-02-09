"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Shell from '../../components/Shell';
import EventCard from '../../components/EventCard';
import './you.css';

const ProfilePage = () => {
    const { user } = useAuth();
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/activity`, {
                    credentials: 'include'
                });
                if (res.ok) {
                    setActivity(await res.json());
                }
            } catch (error) {
                console.error('Fetch activity error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivity();
    }, []);

    if (loading) {
        return (
            <Shell>
                <div className="home-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
                    <div style={{ width: '20px', height: '20px', border: '2px solid #333', borderTopColor: '#eee', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </Shell>
        );
    }

    const { stats, history, memberSince } = activity || { stats: {}, history: [] };

    const formatDate = (isoString) => {
        if (!isoString) return 'Unknown';
        return new Date(isoString).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    return (
        <Shell>
            <div className="home-container you-container">
                <section className="identity-section">
                    <h1 className="identity-name">{user?.name}</h1>
                    <p className="identity-meta">
                        <span>{user?.email}</span>
                        <span>{user?.role === 'ADMIN' ? 'Admin' : 'Member'}</span>
                        <span>Since {formatDate(memberSince || user?.createdAt)}</span>
                    </p>
                </section>

                <section className="memory-section">
                    <p className="memory-text">
                        You have attended <strong>{stats?.attended || 0}</strong> out of <strong>{stats?.totalPast || 0}</strong> sessions since you joined.
                        {stats?.missed > 0 && <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.9rem', color: '#664444' }}>You missed {stats.missed} committed events.</span>}
                    </p>
                </section>

                <section className="timeline-section">
                    <span className="section-label">Your Memory</span>
                    
                    {history.length === 0 ? (
                        <p style={{ color: '#555', fontStyle: 'italic', marginTop: '1rem' }}>No activity recorded yet.</p>
                    ) : (
                        <div className="timeline-list">
                            {history.map(item => (
                                <div key={item._id} className={`timeline-item status-${item.status}`}>
                                    <span className="status-label">
                                        {item.status === 'ATTENDED' && 'Present'}
                                        {item.status === 'MISSED' && 'Missed'}
                                        {item.status === 'UPCOMING' && 'Committed'}
                                    </span>
                                    <EventCard 
                                        event={item} 
                                        variant="timeline" // Using fallback style defined in CSS or default
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </Shell>
    );
};

export default ProfilePage;
