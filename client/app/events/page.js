"use client";
import React, { useState, useEffect } from 'react';
import Shell from '../../components/Shell';
import EventCard from '../../components/EventCard';
import './events.css';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/events', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <Shell>
        <div className="loading-screen">
          <div className="loader"></div>
          <p className="ambient-text">Syncing temporal data...</p>
        </div>
      </Shell>
    );
  }

  const upcomingEvents = events.filter(e => new Date(e.dateTime) >= new Date());
  const pastEvents = events.filter(e => new Date(e.dateTime) < new Date()).reverse();

  return (
    <Shell>
      <div className="events-timeline">
        <header className="timeline-header">
          <p className="ambient-text">Temporal • The Rhythm</p>
          <h1 className="timeline-title">Moments</h1>
        </header>

        <section className="temporal-section">
          <div className="section-label">
            <span>Upcoming</span>
            <span className="count-pill">{upcomingEvents.length}</span>
          </div>
          <div className="timeline-events">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map(event => (
                <EventCard key={event._id} event={event} variant="primary" />
              ))
            ) : (
              <p className="no-events">No upcoming moments scheduled.</p>
            )}
          </div>
        </section>

        {pastEvents.length > 0 && (
          <section className="temporal-section">
            <div className="section-label">
              <span>Past</span>
              <span className="count-pill">{pastEvents.length}</span>
            </div>
            <div className="timeline-events">
              {pastEvents.map(event => (
                <EventCard key={event._id} event={event} variant="secondary" />
              ))}
            </div>
          </section>
        )}
      </div>
    </Shell>
  );
};

export default EventsPage;
