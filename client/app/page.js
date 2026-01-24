'use client';

import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, loginWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSuccess = (credentialResponse) => {
    loginWithGoogle(credentialResponse.credential);
  };

  return (
    <div className="landing-page">
      <section className="hero">
        <h1 className="hero__title">SAARANG</h1>
        <p className="hero__subtitle">The Official Music Club of Rishihood University</p>
        
        <div className="hero__actions">
          {!user && (
            <div className="login-wrapper">
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => console.log('Login Failed')}
                theme="filled_black"
                shape="pill"
                size="large"
                text="continue_with"
                useOneTap
              />
            </div>
          )}
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <h3>Rehearsals</h3>
          <p>Join regular jam sessions and practice with the band.</p>
        </div>
        <div className="feature-card">
            <h3>Events</h3>
            <p>Perform at university fests and cultural events.</p>
        </div>
        <div className="feature-card">
            <h3>Community</h3>
            <p>Connect with other musicians and grow together.</p>
        </div>
      </section>

      <style jsx>{`
        .landing-page {
          min-height: calc(100vh - var(--header-height));
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem 0;
        }

        .hero {
          margin-bottom: 4rem;
        }

        .hero__title {
          font-size: 5rem;
          font-weight: 800;
          letter-spacing: -2px;
          margin-bottom: 0.5rem;
          background: linear-gradient(to right, var(--primary), var(--secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero__subtitle {
          font-size: 1.5rem;
          color: var(--text-muted);
          margin-bottom: 2rem;
          max-width: 600px;
        }

        .login-wrapper {
            display: flex;
            justify-content: center;
        }

        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          width: 100%;
          max-width: 1000px;
        }

        .feature-card {
          background: var(--surface);
          padding: 2rem;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          transition: transform 0.2s;
        }
        
        .feature-card:hover {
            transform: translateY(-5px);
            border-color: var(--primary);
        }

        .feature-card h3 {
          color: var(--primary);
          margin-bottom: 1rem;
          font-size: 1.25rem;
        }

        .feature-card p {
          color: var(--text-muted);
        }

        @media (max-width: 768px) {
            .hero__title {
                font-size: 3rem;
            }
        }
      `}</style>
    </div>
  );
}
