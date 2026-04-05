"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import './EventCard.css';

const EventCard = ({ event, variant = 'secondary' }) => {
  const isPrimary = variant === 'primary';
  const isPast = new Date(event.dateTime) < new Date();
  const { user } = useAuth();
  
  // Local state for optimistic UI updates
  const [currentRsvp, setCurrentRsvp] = useState(event.userRsvp || null);
  const [attendingCount, setAttendingCount] = useState(event.attendingCount || 0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Format date and time
  const dateObj = new Date(event.dateTime);
  const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const handleRsvp = async (status) => {
    if (isPast) return; // Time lock
    
    // Optimistic UI update
    const previousRsvp = currentRsvp;
    let newCount = attendingCount;
    
    if (status === 'ATTENDING' && previousRsvp !== 'ATTENDING') newCount++;
    if (status !== 'ATTENDING' && previousRsvp === 'ATTENDING') newCount--;
    
    setCurrentRsvp(status);
    setAttendingCount(newCount);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${event._id}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update RSVP');
      }
    } catch (error) {
      console.error('RSVP Error:', error);
      // Revert optimistic update on failure
      setCurrentRsvp(previousRsvp);
      setAttendingCount(previousRsvp === 'ATTENDING' ? attendingCount : newCount); // rudimentary revert
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className={`event-card event-card-${variant} ${isPast ? 'event-past' : ''}`}>
      <div className="event-info">
        <div className="event-type">{event.type}</div>
        <Link href={`/events/${event._id}`} className="event-title-link">
          <h3 className="event-title">{event.title}</h3>
        </Link>
        <div className="event-details">
          <span className="event-date">{formattedDate}</span>
          <span className="event-dot">•</span>
          <span className="event-time">{formattedTime}</span>
          {isPrimary && (
            <>
              <span className="event-dot">•</span>
              <span className="event-location">{event.location}</span>
            </>
          )}
        </div>
      </div>
      
      {isPrimary && (
        <div className="event-rsvp-section">
          <div className="rsvp-buttons">
            <button 
              className={`rsvp-btn ${currentRsvp === 'ATTENDING' ? 'active-attending' : ''}`}
              onClick={() => handleRsvp('ATTENDING')}
              disabled={isPast}
            >
              I'm Attending
            </button>
            <button 
              className={`rsvp-btn ${currentRsvp === 'NOT_ATTENDING' ? 'active-not-attending' : ''}`}
              onClick={() => handleRsvp('NOT_ATTENDING')}
              disabled={isPast}
            >
              Not Attending
            </button>
          </div>
          
          <div className="rsvp-meta">
            <span className="attending-count">{attendingCount} attending</span>
            {isAdmin && event.rsvpList && (
              <button 
                className="expand-admin-btn" 
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Hide List' : 'View List'}
              </button>
            )}
          </div>
          
          {isAdmin && isExpanded && event.rsvpList && (
            <div className="admin-rsvp-list">
              <div className="rsvp-group attending">
                <h4>Attending ({event.rsvpList.attending?.length || 0})</h4>
                <ul>
                  {event.rsvpList.attending?.map(u => <li key={u._id}>{u.name}</li>) || <li>None</li>}
                </ul>
              </div>
              <div className="rsvp-group not-attending">
                <h4>Not Attending ({event.rsvpList.notAttending?.length || 0})</h4>
                <ul>
                  {event.rsvpList.notAttending?.map(u => <li key={u._id}>{u.name}</li>) || <li>None</li>}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventCard;
