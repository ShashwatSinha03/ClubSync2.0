"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './AdminOverlay.css';

const AdminOverlay = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('approvals');
    const [pendingUsers, setPendingUsers] = useState([]);
    const [activeUsers, setActiveUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const [newEvent, setNewEvent] = useState({
        title: '',
        type: 'Jam Session',
        dateTime: '',
        location: '',
        notes: ''
    });

    useEffect(() => {
        if (isOpen && user?.role === 'ADMIN') {
            fetchData();
        }
    }, [isOpen, activeTab, user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'approvals') {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/pending-users`, {
                    credentials: 'include'
                });
                if (res.ok) setPendingUsers(await res.json());
            } else if (activeTab === 'roles') {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
                    credentials: 'include'
                });
                if (res.ok) setActiveUsers(await res.json());
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/approve-user/${userId}`, {
                method: 'POST',
                credentials: 'include'
            });
            if (res.ok) {
                // Remove from list
                setPendingUsers(prev => prev.filter(u => u._id !== userId));
            }
        } catch (error) {
            console.error('Approval failed:', error);
        }
    };

    const handleReject = async (userId) => {
        if (!confirm('Are you sure you want to reject this user? This cannot be undone.')) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/reject-user/${userId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                setPendingUsers(prev => prev.filter(u => u._id !== userId));
            }
        } catch (error) {
            console.error('Rejection failed:', error);
        }
    };

    const handleCreateEvent = async () => {
        if (!newEvent.title || !newEvent.dateTime || !newEvent.location) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(newEvent)
            });
            if (res.ok) {
                alert('Event created successfully!');
                setNewEvent({
                    title: '',
                    type: 'Jam Session',
                    dateTime: '',
                    location: '',
                    notes: ''
                });
                onClose(); // Close overlay to see event in feed
                // Ideally trigger refresh of feed, but page reload works for now or let context update
                window.location.reload(); 
            }
        } catch (error) {
            console.error('Create event failed:', error);
        }
    };

    const handleRoleUpdate = async (userId, newRole) => {
        // Optimistic update
        setActiveUsers(prev => prev.map(u => 
            u._id === userId ? { ...u, role: newRole } : u
        ));

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ userId, role: newRole })
            });
            
            if (!res.ok) {
                // Revert if failed
                fetchData();
            }
        } catch (error) {
            console.error('Role update failed:', error);
            fetchData();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="admin-overlay-backdrop" onClick={onClose}>
            <div className="admin-overlay-card" onClick={e => e.stopPropagation()}>
                <header className="overlay-header">
                    <h2>Admin Console</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </header>

                <div className="admin-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'approvals' ? 'active' : ''}`}
                        onClick={() => setActiveTab('approvals')}
                    >
                        Approvals {pendingUsers.length > 0 && `(${pendingUsers.length})`}
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'roles' ? 'active' : ''}`}
                        onClick={() => setActiveTab('roles')}
                    >
                        Members & Roles
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
                        onClick={() => setActiveTab('create')}
                    >
                        Create Event
                    </button>
                </div>

                <div className="admin-content">
                    {loading ? (
                        <div className="empty-state">Loading...</div>
                    ) : activeTab === 'approvals' ? (
                        <div className="admin-section">
                            {pendingUsers.length === 0 ? (
                                <p className="empty-state">No pending approvals.</p>
                            ) : (
                                pendingUsers.map(u => (
                                    <div key={u._id} className="admin-item">
                                        <div className="user-info">
                                            <h3>{u.name}</h3>
                                            <p className="user-text">{u.email} • {u.instrument}</p>
                                        </div>
                                        <div className="action-row">
                                            <button 
                                                className="action-btn reject"
                                                onClick={() => handleReject(u._id)}
                                            >
                                                Reject
                                            </button>
                                            <button 
                                                className="action-btn"
                                                onClick={() => handleApprove(u._id)}
                                            >
                                                Approve
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : activeTab === 'roles' ? (
                        <div className="admin-section">
                            {activeUsers.map(u => (
                                <div key={u._id} className="admin-item">
                                    <div className="user-info">
                                        <h3>{u.name} {u._id === user?._id && '(You)'}</h3>
                                        <p className="user-text">{u.role}</p>
                                    </div>
                                    
                                    {u._id !== user?._id && (
                                        u.role === 'MEMBER' ? (
                                            <button 
                                                className="action-btn promote"
                                                onClick={() => handleRoleUpdate(u._id, 'ADMIN')}
                                            >
                                                Make Admin
                                            </button>
                                        ) : (
                                            <button 
                                                className="action-btn demote"
                                                onClick={() => handleRoleUpdate(u._id, 'MEMBER')}
                                            >
                                                Remove Admin
                                            </button>
                                        )
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="create-event-form">
                            <div className="form-group">
                                <label>Event Title</label>
                                <input 
                                    type="text" 
                                    className="form-input"
                                    value={newEvent.title}
                                    onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                                    placeholder="e.g. Wednesday Jam Session"
                                />
                            </div>
                            <div className="form-group">
                                <label>Type</label>
                                <select 
                                    className="form-input"
                                    value={newEvent.type}
                                    onChange={e => setNewEvent({...newEvent, type: e.target.value})}
                                >
                                    <option value="Jam Session">Jam Session</option>
                                    <option value="Workshop">Workshop</option>
                                    <option value="Audition">Audition</option>
                                    <option value="Concert">Concert</option>
                                    <option value="Meeting">Meeting</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Date & Time</label>
                                <input 
                                    type="datetime-local" 
                                    className="form-input"
                                    value={newEvent.dateTime}
                                    onChange={e => setNewEvent({...newEvent, dateTime: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input 
                                    type="text" 
                                    className="form-input"
                                    value={newEvent.location}
                                    onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                                    placeholder="e.g. Music Room (Block A)"
                                />
                            </div>
                            <div className="form-group">
                                <label>Notes</label>
                                <textarea 
                                    className="form-textarea"
                                    value={newEvent.notes}
                                    onChange={e => setNewEvent({...newEvent, notes: e.target.value})}
                                    placeholder="Any details for members..."
                                />
                            </div>
                            <button className="submit-btn" onClick={handleCreateEvent}>
                                Create Event
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminOverlay;
