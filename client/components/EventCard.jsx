'use client';

import { useAuth } from '../context/AuthContext';

export default function EventCard({ event, onRsvp }) {
    const { user } = useAuth();
    
    const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Check current user's RSVP status
    const currentRsvp = event.rsvpList?.find(r => r.user?._id === user?._id || r.user === user?._id)?.status;

    return (
        <div className="card event-card">
            <div className="event-card__header">
                <span className={`event-type event-type--${event.type.toLowerCase().replace(' ', '-')}`}>
                    {event.type}
                </span>
                <span className="event-date">{formattedDate}</span>
            </div>
            
            <h3 className="event-title">{event.title}</h3>
            
            <div className="event-details">
                <p><strong>📍 Location:</strong> {event.location}</p>
                {event.notes && <p className="event-notes">📝 {event.notes}</p>}
            </div>

            <div className="event-actions">
                <div className="rsvp-buttons">
                    <button 
                        className={`rsvp-btn ${currentRsvp === 'GOING' ? 'active' : ''}`}
                        onClick={() => onRsvp(event._id, 'GOING')}
                    >
                        Going
                    </button>
                    <button 
                        className={`rsvp-btn ${currentRsvp === 'MAYBE' ? 'active' : ''}`}
                        onClick={() => onRsvp(event._id, 'MAYBE')}
                    >
                        Maybe
                    </button>
                    <button 
                        className={`rsvp-btn ${currentRsvp === 'NOT_GOING' ? 'active' : ''}`}
                        onClick={() => onRsvp(event._id, 'NOT_GOING')}
                    >
                        No
                    </button>
                </div>
            </div>

            <style jsx>{`
                .event-card {
                    display: flex;
                    flex-direction: column;
                    gap: 1.2rem;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    transition: transform 0.2s;
                    position: relative;
                    overflow: hidden;
                }
                .event-card:hover {
                    transform: translateY(-4px);
                    border-color: var(--primary);
                }
                .event-card__header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.8rem;
                }
                .event-type {
                    text-transform: uppercase;
                    font-size: 0.65rem;
                    font-weight: 800;
                    padding: 4px 10px;
                    border-radius: 99px;
                    color: white;
                    letter-spacing: 0.5px;
                }
                .event-type--rehearsal { background-color: #3b82f6; }
                .event-type--jam { background-color: #ec4899; }
                .event-type--audition { background-color: #eab308; color: black; }
                .event-type--performance { background-color: #ef4444; }

                .event-date {
                    color: var(--text-muted);
                    font-weight: 500;
                }
                .event-title {
                    font-size: 1.4rem;
                    font-weight: 700;
                    color: white;
                }
                .event-details {
                    color: var(--text-muted);
                    font-size: 0.95rem;
                    line-height: 1.5;
                }
                .event-notes {
                    margin-top: 0.5rem;
                    font-style: italic;
                    font-size: 0.85rem;
                    opacity: 0.8;
                }
                
                .rsvp-buttons {
                    display: flex;
                    gap: 0.5rem;
                    margin-top: 0.5rem;
                }
                .rsvp-btn {
                    flex: 1;
                    padding: 0.6rem;
                    font-size: 0.8rem;
                    font-weight: 600;
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.05);
                    color: var(--text-muted);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    transition: all 0.2s;
                }
                .rsvp-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }
                .rsvp-btn.active {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                    box-shadow: 0 0 15px rgba(139, 92, 246, 0.3);
                }
            `}</style>
        </div>
    );
}
