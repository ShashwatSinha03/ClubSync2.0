"use client";
import React from 'react';
import Link from 'next/link';
import './EventCard.css';
import ActionButton from './ActionButton';

const EventCard = ({ event, variant = 'secondary', onRSVP, rsvpStatus }) => {
  const isPrimary = variant === 'primary';
  const isPast = new Date(event.dateTime) < new Date();

  // Format date and time
  const dateObj = new Date(event.dateTime);
  const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

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
      
      {isPrimary && !isPast && (
        <div className="event-actions">
          <ActionButton 
            label={rsvpStatus === 'GOING' ? "Attending" : "I'm attending"} 
            variant={rsvpStatus === 'GOING' ? 'active' : 'primary'}
            onClick={onRSVP} 
          />
        </div>
      )}
    </div>
  );
};

export default EventCard;
