'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/home');
    }
  }, [user, router]);

  return (
    <div className="landing-page">
      <div className="ambient-light top-left"></div>
      <div className="ambient-light bottom-right"></div>

      <section className="hero">
        <div className="hero__content">
            <h1 className="hero__title">
              Unleash Your <br />
              <span className="gradient-text">Rhythm.</span>
            </h1>
            <p className="hero__subtitle">
                The official digital hub for Saarang Music Club of Rishihood University. 
                Sync rehearsals, manage events, and amplify your community.
            </p>
            
            <div className="hero__actions">
            {!user && (
                <Link href="/signup" className="btn btn--primary btn--large">
                    Get Started
                </Link>
            )}
            </div>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <div className="feature-icon">🎸</div>
          <h3>Jam Sessions</h3>
          <p>Coordinate jamming and rehearsals seamlessly with real-time scheduling.</p>
        </div>
        <div className="feature-card">
           <div className="feature-icon">📅</div>
            <h3>Event Management</h3>
            <p>Showcase talents at university fests. Track RSVPs and lineups effortlessly.</p>
        </div>
        <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Community Growth</h3>
            <p>Connect with vocalists, guitarists, and drummers. Build your dream band.</p>
        </div>
      </section>
    </div>
  );
}
