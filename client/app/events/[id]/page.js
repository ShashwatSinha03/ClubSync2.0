"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import Shell from '../../../components/Shell';
import ActionButton from '../../../components/ActionButton';
import StatusPill from '../../../components/StatusPill';
import './event-detail.css';

const EventDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  // Old RSVP logic removed as per Phase E9.

  const handleAttendance = async (userId, currentStatus) => {
    // Behavior: Checking -> PRESENT, Unchecking -> ABSENT
    const newStatus = currentStatus === 'PRESENT' ? 'ABSENT' : 'PRESENT';
    
    try {
      const response = await fetch(`http://localhost:5001/api/events/${id}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ userId, status: newStatus })
      });

      if (response.ok) {
        setData(prev => {
          const newAttendanceList = [...prev.attendance];
          const index = newAttendanceList.findIndex(a => 
            (a.userId._id || a.userId) === userId
          );
          if (index !== -1) {
            newAttendanceList[index] = { ...newAttendanceList[index], status: newStatus };
          }
          return { ...prev, attendance: newAttendanceList };
        });
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

        {/* Old RSVP interaction block removed as it is now inline on EventCards */}

        {isAdmin && (
          <section className="admin-attendance-section">
            <div className="section-label">Attendance Marking</div>
            <div className="attendance-list-snapshot">
              {attendance && attendance.length > 0 ? (
                attendance.map((record) => {
                  const memberId = record.userId._id || record.userId;
                  const memberName = record.userId.name || "Member";
                  return (
                    <div key={memberId} className="attendance-row-snapshot">
                      <label className="checkbox-container">
                        <input 
                          type="checkbox" 
                          checked={record.status === 'PRESENT'}
                          onChange={() => handleAttendance(memberId, record.status)}
                        />
                        <span className="checkmark"></span>
                        <span className="member-name">{memberName}</span>
                      </label>
                    </div>
                  );
                })
              ) : (
                <p className="no-activity">No members in snapshot for this event.</p>
              )}
            </div>
          </section>
        )}
        
        {isPast && !isAdmin && (
           <div className="club-memory">
             <p>This moment has passed.</p>
             {attendance === 'PRESENT' && <p className="success-text">You were present. Memory stored.</p>}
           </div>
        )}
      </div>
    </Shell>
    );
};

export default EventDetailPage;
