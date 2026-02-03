'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import EventCard from '../../components/EventCard';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [events, setEvents] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const [eventsRes, announcementsRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`, { credentials: 'include' }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/announcements`, { credentials: 'include' })
            ]);

            if (eventsRes.ok) {
                const eventsData = await eventsRes.json();
                setEvents(eventsData);
            }
            if (announcementsRes.ok) {
                const announcementsData = await announcementsRes.json();
                setAnnouncements(announcementsData);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRsvp = async (eventId, status) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${eventId}/rsvp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
                credentials: 'include'
            });

            if (res.ok) {
                // Optimistically update or just re-fetch
                fetchDashboardData();
            }
        } catch (error) {
            console.error('RSVP failed:', error);
        }
    };

    if (loading || !user) {
        return (
            <div className="loading-state">
                <div className="loader"></div>
                <p>Syncing your rhythm...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="welcome-text">
                    <h1>Welcome Back, <span className="highlight">{user.name.split(' ')[0]}</span> 👋</h1>
                    <p>Here's everything happening at Saarang today.</p>
                </div>
                {user.role === 'ADMIN' && (
                    <button onClick={() => router.push('/admin')} className="btn btn--outline admin-quick-btn">
                        ⚙️ Admin Panel
                    </button>
                )}
            </header>

            <main className="dashboard-grid">
                {/* Announcements Section */}
                <section className="dashboard-section announcements-section">
                    <div className="section-header">
                        <h2>📣 Latest Notices</h2>
                    </div>
                    <div className="announcements-list">
                        {announcements.length > 0 ? (
                            announcements.map(ann => (
                                <div key={ann._id} className="announcement-card">
                                    <h3>{ann.title}</h3>
                                    <p>{ann.content}</p>
                                    <span className="ann-meta">
                                        By {ann.createdBy.name} • {new Date(ann.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="empty-msg">No active announcements.</p>
                        )}
                    </div>
                </section>

                {/* Upcoming Events Section */}
                <section className="dashboard-section events-section">
                    <div className="section-header">
                        <h2>🎵 Upcoming Musical Sessions</h2>
                    </div>
                    
                    {isLoading ? (
                        <p>Loading events...</p>
                    ) : events.length > 0 ? (
                        <div className="events-grid">
                            {events.map(event => (
                                <EventCard 
                                    key={event._id} 
                                    event={event} 
                                    onRsvp={handleRsvp} 
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>No upcoming events scheduled.</p>
                            <p>Check back later for rehearsals or jam calls! 🎸</p>
                        </div>
                    )}
                </section>
            </main>

            <style jsx>{`
                .dashboard-container {
                    padding: 2rem 0 5rem 0;
                    animation: fadeIn 0.5s ease-out;
                }
                .dashboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 3rem;
                }
                .welcome-text h1 {
                    font-size: 2.5rem;
                    font-weight: 800;
                    margin-bottom: 0.5rem;
                }
                .highlight {
                    background: linear-gradient(135deg, var(--primary), var(--secondary));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .welcome-text p {
                    color: var(--text-muted);
                    font-size: 1.1rem;
                }

                .dashboard-grid {
                    display: grid;
                    grid-template-columns: 350px 1fr;
                    gap: 3rem;
                }

                .section-header {
                    margin-bottom: 1.5rem;
                    border-bottom: 1px solid var(--border);
                    padding-bottom: 0.75rem;
                }
                .section-header h2 {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: white;
                }

                /* Announcements */
                .announcements-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .announcement-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 1.5rem;
                    border-radius: 16px;
                    border-left: 4px solid var(--primary);
                }
                .announcement-card h3 {
                    font-size: 1.1rem;
                    margin-bottom: 0.5rem;
                }
                .announcement-card p {
                    font-size: 0.9rem;
                    color: var(--text-muted);
                    line-height: 1.5;
                    margin-bottom: 1rem;
                }
                .ann-meta {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    opacity: 0.6;
                }

                /* Events */
                .events-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 1.5rem;
                }

                .empty-msg, .empty-state {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    padding: 2rem;
                    text-align: center;
                    background: rgba(255, 255, 255, 0.01);
                    border-radius: 12px;
                    border: 1px dashed var(--border);
                }

                .loading-state {
                    height: 80vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    color: var(--text-muted);
                }
                
                .loader {
                    width: 40px;
                    height: 40px;
                    border: 4px solid var(--border);
                    border-top-color: var(--primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 1024px) {
                    .dashboard-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}
