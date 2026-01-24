'use client';

export default function EventCard({ event, onRsvp }) {
    const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className="card event-card">
            <div className="event-card__header">
                <span className={`event-type event-type--${event.type}`}>
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
                {/* RSVP Buttons can be added here if passed */}
                 <div className="rsvp-status">
                    {/* Placeholder for RSVP status or buttons */}
                    {onRsvp && (
                        <button className="btn btn--primary btn--sm" onClick={() => onRsvp(event._id)}>
                            View Details / RSVP
                        </button>
                    )}
                 </div>
            </div>

            <style jsx>{`
                .event-card {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .event-card__header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.875rem;
                }
                .event-type {
                    text-transform: uppercase;
                    font-size: 0.7rem;
                    font-weight: 700;
                    padding: 4px 8px;
                    border-radius: 4px;
                    color: white;
                }
                .event-type--rehearsal { background-color: #3b82f6; }
                .event-type--jam { background-color: #ec4899; }
                .event-type--audition { background-color: #eab308; color: black; }
                .event-type--performance { background-color: #ef4444; }

                .event-date {
                    color: var(--text-muted);
                }
                .event-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                }
                .event-details {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }
                .event-notes {
                    margin-top: 0.5rem;
                    font-style: italic;
                }
            `}</style>
        </div>
    );
}
