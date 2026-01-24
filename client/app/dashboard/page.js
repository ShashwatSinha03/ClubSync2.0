'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import EventCard from '../../components/EventCard';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [events, setEvents] = useState([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            fetchEvents();
        }
    }, [user]);

    const fetchEvents = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setEvents(data);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setIsLoadingEvents(false);
        }
    };

    if (loading || !user) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <h1>Welcome Back, {user.name.split(' ')[0]} 👋</h1>
                <p>Here's what's happening at Saarang.</p>
            </header>

            <section className="upcoming-events">
                <h2>Upcoming Events</h2>
                
                {isLoadingEvents ? (
                    <p>Loading events...</p>
                ) : events.length > 0 ? (
                    <div className="events-grid">
                        {events.map(event => (
                            <EventCard key={event._id} event={event} onRsvp={(id) => console.log('RSVP for', id)} />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No upcoming events scheduled.</p>
                        <p>Time to jam on your own! 🎸</p>
                    </div>
                )}
            </section>

            <style jsx>{`
                .dashboard-page {
                    padding: 2rem 0;
                }
                .dashboard-header {
                    margin-bottom: 2rem;
                }
                .dashboard-header h1 {
                    font-size: 2.5rem;
                    background: linear-gradient(to right, var(--text-main), var(--text-muted));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .dashboard-header p {
                    color: var(--text-muted);
                }
                .upcoming-events h2 {
                    margin-bottom: 1.5rem;
                    font-size: 1.5rem;
                    border-bottom: 1px solid var(--border);
                    padding-bottom: 0.5rem;
                }
                .events-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                }
                .empty-state {
                    text-align: center;
                    padding: 4rem 2rem;
                    background: var(--surface);
                    border-radius: var(--radius);
                    color: var(--text-muted);
                    border: 1px dashed var(--border);
                }
            `}</style>
        </div>
    );
}
