'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    
    const [activeTab, setActiveTab] = useState('events');
    const [events, setEvents] = useState([]);
    const [users, setUsers] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    
    // Form States
    const [newEvent, setNewEvent] = useState({ title: '', type: 'rehearsal', date: '', location: '', notes: '' });
    const [newAnn, setNewAnn] = useState({ title: '', content: '' });
    const [selectedEventId, setSelectedEventId] = useState('');

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'ADMIN') {
                router.push('/dashboard');
            } else {
                fetchAllData();
            }
        }
    }, [user, loading, router]);

    const fetchAllData = async () => {
        try {
            const [eventsRes, usersRes, annRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`, { credentials: 'include' }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, { credentials: 'include' }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/announcements`, { credentials: 'include' })
            ]);

            if (eventsRes.ok) setEvents(await eventsRes.json());
            if (usersRes.ok) setUsers(await usersRes.json());
            if (annRes.ok) setAnnouncements(await annRes.json());
        } catch (error) {
            console.error('Error fetching admin data:', error);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newEvent),
            credentials: 'include'
        });
        if (res.ok) {
            setNewEvent({ title: '', type: 'rehearsal', date: '', location: '', notes: '' });
            fetchAllData();
        }
    };

    const handleCreateAnn = async (e) => {
        e.preventDefault();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/announcements`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newAnn),
            credentials: 'include'
        });
        if (res.ok) {
            setNewAnn({ title: '', content: '' });
            fetchAllData();
        }
    };

    const markAttendance = async (userId, eventId, status) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${eventId}/attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, status }),
            credentials: 'include'
        });
        if (res.ok) fetchAllData();
    };

    if (loading || !user || user.role !== 'ADMIN') return <div className="loading">Checking credentials...</div>;

    const selectedEvent = events.find(e => e._id === selectedEventId);

    return (
        <div className="admin-container">
            <header className="admin-header">
                <h1>Admin Command Center</h1>
                <p>Manage Saarang's events, members, and broadcasts.</p>
            </header>

            <nav className="admin-tabs">
                <button className={activeTab === 'events' ? 'active' : ''} onClick={() => setActiveTab('events')}>Events</button>
                <button className={activeTab === 'attendance' ? 'active' : ''} onClick={() => setActiveTab('attendance')}>Attendance</button>
                <button className={activeTab === 'members' ? 'active' : ''} onClick={() => setActiveTab('members')}>Member List</button>
                <button className={activeTab === 'announcements' ? 'active' : ''} onClick={() => setActiveTab('announcements')}>Announcements</button>
                <button className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>Analytics</button>
            </nav>

            <main className="admin-content">
                {activeTab === 'events' && (
                    <div className="tab-pane">
                        <div className="grid-2">
                            <section className="card">
                                <h2>Create Event</h2>
                                <form onSubmit={handleCreateEvent} className="form-stack">
                                    <input placeholder="Title" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} required className="input" />
                                    <select value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})} className="input">
                                        <option value="rehearsal">Rehearsal</option>
                                        <option value="jam">Jam Session</option>
                                        <option value="audition">Audition</option>
                                        <option value="performance">Performance</option>
                                    </select>
                                    <input type="datetime-local" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} required className="input" />
                                    <input placeholder="Location" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} className="input" />
                                    <textarea placeholder="Notes (Setlist etc.)" value={newEvent.notes} onChange={e => setNewEvent({...newEvent, notes: e.target.value})} className="input" />
                                    <button type="submit" className="btn btn--primary">Create Session</button>
                                </form>
                            </section>
                            <section className="card">
                                <h2>Manage Existing</h2>
                                <div className="scroll-list">
                                    {events.map(e => (
                                        <div key={e._id} className="admin-item">
                                            <span>{e.title} ({e.type})</span>
                                            <button onClick={() => {/* Delete logic */}} className="btn btn--outline btn--sm">Remove</button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                )}

                {activeTab === 'attendance' && (
                    <div className="tab-pane card">
                        <h2>Take Attendance</h2>
                        <select 
                            className="input" 
                            style={{ maxWidth: '400px', marginBottom: '2rem' }}
                            value={selectedEventId}
                            onChange={e => setSelectedEventId(e.target.value)}
                        >
                            <option value="">Select an Event</option>
                            {events.map(e => <option key={e._id} value={e._id}>{e.title} - {new Date(e.date).toLocaleDateString()}</option>)}
                        </select>

                        {selectedEventId && (
                            <div className="attendance-list">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Member</th>
                                            <th>RSVP</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => {
                                            const rsvp = selectedEvent?.rsvpList?.find(r => (r.user?._id || r.user) === u._id);
                                            const att = selectedEvent?.attendance?.find(a => (a.user?._id || a.user) === u._id);
                                            return (
                                                <tr key={u._id}>
                                                    <td>{u.name}</td>
                                                    <td>{rsvp?.status || 'No Response'}</td>
                                                    <td>
                                                        <div className="att-btns">
                                                            <button 
                                                                className={`att-btn ${att?.status === 'PRESENT' ? 'p-active' : ''}`}
                                                                onClick={() => markAttendance(u._id, selectedEventId, 'PRESENT')}
                                                            >P</button>
                                                            <button 
                                                                className={`att-btn ${att?.status === 'ABSENT' ? 'a-active' : ''}`}
                                                                onClick={() => markAttendance(u._id, selectedEventId, 'ABSENT')}
                                                            >A</button>
                                                            <button 
                                                                className={`att-btn ${att?.status === 'LATE' ? 'l-active' : ''}`}
                                                                onClick={() => markAttendance(u._id, selectedEventId, 'LATE')}
                                                            >L</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'members' && (
                    <div className="tab-pane card">
                        <h2>Saarang Core Members</h2>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Instrument</th>
                                    <th>Role</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id}>
                                        <td>{u.name}</td>
                                        <td>{u.instrument || 'Member'}</td>
                                        <td>{u.role}</td>
                                        <td><button className="btn btn--outline btn--sm">View Stats</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'announcements' && (
                    <div className="tab-pane">
                         <div className="grid-2">
                             <section className="card">
                                 <h2>New Broadcast</h2>
                                 <form onSubmit={handleCreateAnn} className="form-stack">
                                     <input placeholder="Title" value={newAnn.title} onChange={e => setNewAnn({...newAnn, title: e.target.value})} className="input" required />
                                     <textarea placeholder="Content" value={newAnn.content} onChange={e => setNewAnn({...newAnn, content: e.target.value})} className="input" rows="5" required />
                                     <button type="submit" className="btn btn--primary">Publish Notice</button>
                                 </form>
                             </section>
                             <section className="card">
                                 <h2>Recent</h2>
                                 <div className="scroll-list">
                                     {announcements.map(a => (
                                         <div key={a._id} className="admin-item">
                                             <span>{a.title}</span>
                                             <button className="btn btn--outline btn--sm">Archive</button>
                                         </div>
                                     ))}
                                 </div>
                             </section>
                         </div>
                    </div>
                )}
                {activeTab === 'analytics' && (
                    <div className="tab-pane">
                        <div className="analytics-grid">
                            <section className="card">
                                <h2>Active Participation</h2>
                                <div className="stats-list">
                                    {users.slice(0, 5).map(u => (
                                        <div key={u._id} className="stat-row">
                                            <span>{u.name}</span>
                                            <strong>{Math.floor(Math.random() * 90) + 10}%</strong> {/* Simulating for now */}
                                        </div>
                                    ))}
                                </div>
                            </section>
                            <section className="card">
                                <h2>Event Popularity</h2>
                                <div className="stats-list">
                                    {events.slice(0, 5).map(e => (
                                        <div key={e._id} className="stat-row">
                                            <span>{e.title}</span>
                                            <strong>{e.rsvpList?.length || 0} RSVPs</strong>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                )}
            </main>

            <style jsx>{`
                .admin-container { padding: 3rem 0; }
                .admin-header { margin-bottom: 3rem; }
                .admin-header h1 { font-size: 2.5rem; font-weight: 800; color: white; }
                .admin-header p { color: var(--text-muted); }

                .admin-tabs {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    border-bottom: 1px solid var(--border);
                    padding-bottom: 1rem;
                }
                .admin-tabs button {
                    background: transparent;
                    color: var(--text-muted);
                    padding: 0.5rem 1.5rem;
                    font-weight: 600;
                    border-radius: 8px;
                    transition: all 0.2s;
                }
                .admin-tabs button.active {
                    background: var(--primary);
                    color: white;
                }

                .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
                .form-stack { display: flex; flex-direction: column; gap: 1rem; }
                .scroll-list { height: 400px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.75rem; }
                
                .admin-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                }

                .analytics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
                .stat-row { display: flex; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid var(--border); }
                .stat-row:last-child { border-bottom: none; }

                .admin-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                }
                .admin-table th, .admin-table td {
                    padding: 1.25rem;
                    border-bottom: 1px solid var(--border);
                }
                .admin-table th { color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase; }

                .att-btns { display: flex; gap: 0.5rem; }
                .att-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 6px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid var(--border);
                    color: white;
                    font-size: 0.75rem;
                    font-weight: 700;
                }
                .p-active { background: #22c55e; border-color: #22c55e; }
                .a-active { background: #ef4444; border-color: #ef4444; }
                .l-active { background: #eab308; border-color: #eab308; }

                .loading { height: 80vh; display: flex; align-items: center; justify-content: center; color: var(--text-muted); }
            `}</style>
        </div>
    );
}
