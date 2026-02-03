'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    
    const [stats, setStats] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ instrument: '', phone: '' });

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user) {
            fetchStats();
            setEditData({ instrument: user.instrument || '', phone: user.phone || '' });
        }
    }, [user, loading, router]);

    const fetchStats = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/stats/${user._id}`, { credentials: 'include' });
            if (res.ok) setStats(await res.json());
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editData),
            credentials: 'include'
        });
        if (res.ok) {
            setIsEditing(false);
            // In a real app, you might want to update the AuthContext user object here too
            window.location.reload(); 
        }
    };

    if (loading || !user) return <div className="loading">Loading Profile...</div>;

    return (
        <div className="profile-container">
            <header className="profile-header">
                <div className="profile-main">
                    <img src={user.profilePicture} alt={user.name} className="profile-avatar" />
                    <div className="profile-text">
                        <h1>{user.name}</h1>
                        <p className="user-email">{user.email}</p>
                        <span className="user-role-badge">{user.role}</span>
                    </div>
                </div>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="btn btn--primary">Edit Profile</button>
                ) : (
                    <button onClick={() => setIsEditing(false)} className="btn btn--outline">Cancel</button>
                )}
            </header>

            <div className="profile-grid">
                <section className="profile-info-section">
                    <div className="card">
                        <h2>Member Details</h2>
                        {isEditing ? (
                            <form onSubmit={handleUpdateProfile} className="profile-form">
                                <div className="form-group">
                                    <label>Primary Instrument / Role</label>
                                    <input 
                                        type="text" 
                                        className="input" 
                                        value={editData.instrument} 
                                        onChange={e => setEditData({...editData, instrument: e.target.value})}
                                        placeholder="Vocalist, Guitarist, etc."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input 
                                        type="text" 
                                        className="input" 
                                        value={editData.phone} 
                                        onChange={e => setEditData({...editData, phone: e.target.value})}
                                    />
                                </div>
                                <button type="submit" className="btn btn--primary btn-full">Save Changes</button>
                            </form>
                        ) : (
                            <div className="info-list">
                                <div className="info-item">
                                    <span>Instrument:</span>
                                    <strong>{user.instrument || 'Vocalist'}</strong>
                                </div>
                                <div className="info-item">
                                    <span>Phone:</span>
                                    <strong>{user.phone || 'Not provided'}</strong>
                                </div>
                                <div className="info-item">
                                    <span>Joined:</span>
                                    <strong>{new Date(user.createdAt).toLocaleDateString()}</strong>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="card stats-card">
                        <h2>Attendance Stats</h2>
                        {stats ? (
                            <div className="stats-grid">
                                <div className="stat-box">
                                    <span className="stat-val">{stats.attendancePercentage.toFixed(1)}%</span>
                                    <span className="stat-label">Ratio</span>
                                </div>
                                <div className="stat-box">
                                    <span className="stat-val">{stats.attendedEvents}</span>
                                    <span className="stat-label">Attended</span>
                                </div>
                                <div className="stat-box">
                                    <span className="stat-val">{stats.totalPastEvents}</span>
                                    <span className="stat-label">Total Sessions</span>
                                </div>
                            </div>
                        ) : (
                            <p>Loading stats...</p>
                        )}
                    </div>
                </section>

                <section className="profile-history-section card">
                    <h2>RSVP & Session History</h2>
                    <div className="history-list">
                        {stats?.rsvpHistory.length > 0 ? (
                            stats.rsvpHistory.map((item, idx) => (
                                <div key={idx} className="history-item">
                                    <div className="hist-main">
                                        <strong>{item.title}</strong>
                                        <span>{new Date(item.date).toLocaleDateString()}</span>
                                    </div>
                                    <span className={`hist-status status--${item.status.toLowerCase()}`}>
                                        {item.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="empty">No RSVP history found.</p>
                        )}
                    </div>
                </section>
            </div>

            <style jsx>{`
                .profile-container { padding: 4rem 0; animation: fadeIn 0.5s ease-out; }
                .profile-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4rem; }
                .profile-main { display: flex; gap: 2rem; align-items: center; }
                .profile-avatar { width: 100px; height: 100px; border-radius: 50%; border: 3px solid var(--primary); }
                .profile-text h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 0.25rem; }
                .user-email { color: var(--text-muted); font-size: 1.1rem; margin-bottom: 0.5rem; }
                .user-role-badge { background: var(--primary); color: white; padding: 4px 12px; border-radius: 99px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }

                .profile-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 3rem; }
                .profile-info-section { display: flex; flex-direction: column; gap: 2rem; }
                
                h2 { font-size: 1.25rem; font-weight: 700; margin-bottom: 2rem; display: flex; align-items: center; gap: 0.5rem; color: #fff; }

                .info-list { display: flex; flex-direction: column; gap: 1.5rem; }
                .info-item { display: flex; justify-content: space-between; padding-bottom: 1rem; border-bottom: 1px solid var(--border); }
                .info-item span { color: var(--text-muted); }

                .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
                .stat-box { text-align: center; padding: 1.5rem; background: rgba(255,255,255,0.03); border-radius: 16px; border: 1px solid var(--border); }
                .stat-val { display: block; font-size: 1.5rem; font-weight: 800; color: var(--primary); }
                .stat-label { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; margin-top: 0.25rem; }

                .history-list { display: flex; flex-direction: column; }
                .history-item { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 0; border-bottom: 1px solid var(--border); }
                .history-item:last-child { border-bottom: none; }
                .hist-main { display: flex; flex-direction: column; }
                .hist-main span { font-size: 0.85rem; color: var(--text-muted); }
                .hist-status { font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: 6px; }
                .status--going { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
                .status--maybe { background: rgba(234, 179, 8, 0.1); color: #eab308; }
                .status--not_going { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

                .profile-form { display: flex; flex-direction: column; gap: 1rem; }
                .form-group label { display: block; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--text-muted); }
                .btn-full { width: 100%; margin-top: 1rem; }

                .loading { height: 80vh; display: flex; align-items: center; justify-content: center; color: var(--text-muted); }

                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 900px) { .profile-grid { grid-template-columns: 1fr; } }
            `}</style>
        </div>
    );
}
