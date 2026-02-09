"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Shell from '../../../components/Shell';
import ActionButton from '../../../components/ActionButton';
import StatusPill from '../../../components/StatusPill';
import './event-detail.css';

const EventDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));

    const fetchDetail = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/events/${id}`, {
          credentials: 'include'
        });
        if (response.ok) {
          const detail = await response.json();
          setData(detail);
        }
      } catch (error) {
        console.error('Error fetching event detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleRSVP = async (status) => {
    try {
      const response = await fetch(`http://localhost:5001/api/events/${id}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setData(prev => ({ ...prev, rsvp: status }));
      }
    } catch (error) {
      console.error('Error submitting RSVP:', error);
    }
  };

  const handleAttendance = async (userId, present) => {
    try {
      const response = await fetch(`http://localhost:5001/api/events/${id}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ userId, present })
      });

      if (response.ok) {
        const updatedAttendance = await response.json();
        setData(prev => {
          const newAttendanceList = [...prev.attendance];
          const index = newAttendanceList.findIndex(a => a.userId._id === userId);
          if (index !== -1) {
            newAttendanceList[index] = { ...newAttendanceList[index], present };
          } else {
             // This case shouldn't normally happen if we fetch full list for admin
             // But for safety, we could refetch or find the member in a member list
          }
          return { ...prev, attendance: newAttendanceList };
        });
        
        // Final, responsible feel: maybe brief silent confirmation
      }
    } catch (error) {
      console.error('Error submitting attendance:', error);
    }
  };

  if (loading) return (
    <Shell>
      <div className="loading-screen">
        <div className="loader"></div>
      </div>
    </Shell>
  );

  if (!data) return (
    <Shell>
      <div className="event-detail-container">
        <p>Event not found.</p>
      </div>
    </Shell>
  );

  const { event, rsvp, attendance } = data;
  const isPast = new Date(event.dateTime) < new Date();
  const isAdmin = user?.role === 'ADMIN';

  const dateObj = new Date(event.dateTime);
  const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <Shell>
      <div className="event-detail-container">
        <Link href="/events" className="event-back-link">
          ← Back to Rhythm
        </Link>

        <header className="event-detail-header">
          <StatusPill status={event.type} />
          <h1 className="event-spinnaker">{event.title}</h1>
        </header>

        <div className="event-meta-banner">
          <div className="meta-item">
            <span className="meta-label">When</span>
            <span className="meta-value">{formattedDate} at {formattedTime}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Where</span>
            <span className="meta-value">{event.location}</span>
          </div>
          {rsvp && (
            <div className="meta-item">
              <span className="meta-label">Your Status</span>
              <StatusPill status={rsvp} />
            </div>
          )}
        </div>

        <section className="event-notes-section">
          <div className="section-label">Notes</div>
          <div className="notes-content">
            {event.notes || "No specific notes for this moment."}
          </div>
        </section>

        {!isPast && (
          <div className="rsvp-interaction-block">
            <p className="ambient-text">Will you be part of this moment?</p>
            <div className="rsvp-options">
              <ActionButton 
                label="Going" 
                variant={rsvp === 'GOING' ? 'active' : 'primary'} 
                onClick={() => handleRSVP('GOING')} 
              />
              <ActionButton 
                label="Not Going" 
                variant={rsvp === 'NOT_GOING' ? 'active' : 'secondary'} 
                onClick={() => handleRSVP('NOT_GOING')} 
              />
            </div>
          </div>
        )}

        {isAdmin && isPast && (
          <section className="admin-attendance-section">
            <div className="section-label">Attendance Marking</div>
            <div className="attendance-list">
              {/* Note: In a real app, we'd need a list of all members. 
                  For now, we use what's returned in attendance array or handle it simply */}
              {attendance && attendance.length > 0 ? (
                attendance.map((record) => (
                  <div key={record.userId._id} className="attendance-row">
                    <div className="member-info">
                      <span className="member-name">{record.userId.name}</span>
                      <span className="member-instrument">{record.userId.instrument}</span>
                    </div>
                    <div className="attendance-actions">
                       <ActionButton 
                        label="Present" 
                        variant={record.present ? 'active' : 'secondary'} 
                        onClick={() => handleAttendance(record.userId._id, true)}
                      />
                      <ActionButton 
                        label="Absent" 
                        variant={!record.present ? 'active' : 'secondary'} 
                        onClick={() => handleAttendance(record.userId._id, false)}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-events">No records to mark yet. (Attendance logic needs member list integration)</p>
              )}
            </div>
          </section>
        )}
        
        {isPast && !isAdmin && (
           <div className="club-memory">
             <p>This moment has passed.</p>
             {attendance?.present && <p className="success-text">You were present. Memory stored.</p>}
           </div>
        )}
      </div>
    </Shell>
  );
};

export default EventDetailPage;
