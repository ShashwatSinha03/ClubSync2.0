'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [events, setEvents] = useState([]);
    const [newEvent, setNewEvent] = useState({
        title: '',
        type: 'rehearsal',
        date: '',
        location: '',
        notes: ''
    });

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/');
            } else if (user.role !== 'ADMIN') {
                router.push('/dashboard');
            } else {
                fetchEvents();
            }
        }
    }, [user, loading, router]);

    const fetchEvents = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setEvents(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEvent),
                credentials: 'include'
            });

            if (res.ok) {
                setNewEvent({ title: '', type: 'rehearsal', date: '', location: '', notes: '' });
                fetchEvents();
                alert('Event created successfully!');
            } else {
                alert('Failed to create event');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteEvent = async (id) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) fetchEvents();
        } catch (error) {
            console.error(error);
        }
    };

    if (loading || !user || user.role !== 'ADMIN') return <p>Loading...</p>;

    return (
        <div className="admin-page">
            <h1>Admin Dashboard</h1>
            
            <div className="admin-grid">
                <section className="create-event card">
                    <h2>Create New Event</h2>
                    <form onSubmit={handleCreateEvent} className="event-form">
                        <div className="form-group">
                            <label>Title</label>
                            <input 
                                type="text" 
                                className="input" 
                                value={newEvent.title} 
                                onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                                required 
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Type</label>
                            <select 
                                className="input"
                                value={newEvent.type}
                                onChange={e => setNewEvent({...newEvent, type: e.target.value})}
                            >
                                <option value="rehearsal">Rehearsal</option>
                                <option value="jam">Jam Session</option>
                                <option value="audition">Audition</option>
                                <option value="performance">Performance</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Date & Time</label>
                            <input 
                                type="datetime-local" 
                                className="input"
                                value={newEvent.date}
                                onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Location</label>
                            <input 
                                type="text" 
                                className="input"
                                value={newEvent.location}
                                onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Notes</label>
                            <textarea 
                                className="input"
                                rows="3"
                                value={newEvent.notes}
                                onChange={e => setNewEvent({...newEvent, notes: e.target.value})}
                            />
                        </div>

                        <button type="submit" className="btn btn--primary">Create Event</button>
                    </form>
                </section>

                <section className="manage-events card">
                    <h2>Manage Events</h2>
                    <div className="event-list">
                        {events.map(event => (
                            <div key={event._id} className="admin-event-item">
                                <div>
                                    <strong>{event.title}</strong>
                                    <span className={`badge badge--${event.type}`}>{event.type}</span>
                                    <p>{new Date(event.date).toLocaleDateString()}</p>
                                </div>
                                <button 
                                    className="btn btn--outline btn--danger"
                                    onClick={() => handleDeleteEvent(event._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <style jsx>{`
                .admin-page { padding: 2rem 0; }
                .admin-page h1 { margin-bottom: 2rem; }
                .admin-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                }
                .form-group { margin-bottom: 1rem; }
                .form-group label { display: block; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--text-muted); }
                .event-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    max-height: 500px;
                    overflow-y: auto;
                }
                .admin-event-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem;
                    background: var(--surface-hover);
                    border-radius: var(--radius);
                }
                .badge {
                    font-size: 0.7rem;
                    padding: 2px 6px;
                    border-radius: 4px;
                    margin-left: 0.5rem;
                    background: #555;
                }
                .btn--danger {
                    color: var(--error);
                    border-color: var(--error);
                }
                .btn--danger:hover {
                    background: var(--error);
                    color: white;
                }
                @media (max-width: 768px) {
                    .admin-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
}
