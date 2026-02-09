"use client";
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import Shell from '../../components/Shell';
import EventCard from '../../components/EventCard';
import './home.css';

const HomePage = () => {
  const { user } = useAuth();
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

  const upcomingEvents = events.filter(e => new Date(e.dateTime) >= new Date());
  const nextEvent = upcomingEvents[0];
  const otherUpcoming = upcomingEvents.slice(1, 3);

  if (loading) {
    return (
      <Shell>
        <div className="loading-screen">
          <div className="loader"></div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="home-container">
        <header className="home-header">
           <p className="greeting-text" style={{ 
              opacity: 0.6, 
              fontSize: '0.9rem', 
              marginBottom: '0.5rem',
              letterSpacing: '0.5px' 
           }}>
              Hi, {user?.name?.split(' ')[0]}
           </p>
          <div className="pulse-indicator">
            <div className="pulse-dot"></div>
            <span>The Pulse</span>
          </div></header>

        {nextEvent ? (
          <section className="focus-section">
            <div className="section-label">Next Up</div>
            <EventCard 
              event={nextEvent} 
              variant="primary" 
            />
          </section>
        ) : (
          <section className="focus-section">
             <p className="no-events">No upcoming events. Stay tuned.</p>
          </section>
        )}

        {otherUpcoming.length > 0 && (
          <section className="upcoming-section">
            <div className="section-label">Coming Soon</div>
            <div className="upcoming-grid">
              {otherUpcoming.map((event) => (
                <EventCard key={event._id} event={event} variant="secondary" />
              ))}
            </div>
          </section>
        )}

        <footer className="club-memory">
           <p>“Turning moments into memory”</p>
        </footer>
      </div>
    </Shell>
  );
};

export default HomePage;
