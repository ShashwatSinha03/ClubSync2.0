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
                <div className="loading-screen">
                    <div className="loader"></div>
                    <p className="ambient-text">Recalling memories...</p>
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
            <div className="you-container">
                <header className="identity-section">
                    <p className="ambient-text">Profile • Your Identity</p>
                    <h1 className="identity-name">{user?.name}</h1>
                    <div className="identity-meta">
                        <span>{user?.email}</span>
                        <span className="meta-dot">•</span>
                        <span>{user?.role === 'ADMIN' ? 'Admin' : 'Member'}</span>
                        <span className="meta-dot">•</span>
                        <span>Since {formatDate(memberSince || user?.createdAt)}</span>
                    </div>
                </header>

                <section className="memory-section">
                    <p className="memory-text">
                        You've attended <strong>{stats?.attended || 0}</strong> out of <strong>{stats?.totalPast || 0}</strong> sessions.
                    </p>
                </section>

                <section className="timeline-section">
                    <header className="section-header">
                        <span className="section-label">Your Memory</span>
                    </header>
                    
                    {history.length === 0 ? (
                        <p className="no-activity">No activity recorded yet.</p>
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
                                        variant="timeline"
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
