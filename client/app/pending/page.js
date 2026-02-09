'use client';

import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PendingPage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // If user is logged in and approved, redirect to home
        if (user && user.accountStatus === 'APPROVED') {
            router.push('/home');
        }
    }, [user, router]);

    return (
        <div className="pending-page">
            <div className="pending-card">
                <div className="icon">⏳</div>
                <h1>Awaiting Approval</h1>
                <p className="message">
                    Your account is currently under review by our admin team.
                    You'll receive access once your account is approved.
                </p>
                <div className="info-box">
                    <p>We'll notify you via email once you're approved.</p>
                </div>
                <button onClick={logout} className="btn btn--outline">
                    Logout
                </button>
            </div>

            <style jsx>{`
                .pending-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
                }

                .pending-card {
                    max-width: 500px;
                    width: 100%;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 3rem 2rem;
                    text-align: center;
                }

                .icon {
                    font-size: 4rem;
                    margin-bottom: 1.5rem;
                }

                h1 {
                    font-size: 2rem;
                    font-weight: 700;
                    color: white;
                    margin-bottom: 1rem;
                }

                .message {
                    color: rgba(255, 255, 255, 0.7);
                    line-height: 1.6;
                    margin-bottom: 2rem;
                }

                .info-box {
                    background: rgba(255, 221, 0, 0.1);
                    border: 1px solid rgba(255, 221, 0, 0.3);
                    border-radius: 8px;
                    padding: 1rem;
                    margin-bottom: 2rem;
                }

                .info-box p {
                    color: #ffdd00;
                    font-size: 0.9rem;
                    margin: 0;
                }

                .btn {
                    padding: 0.75rem 2rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                }

                .btn--outline {
                    background: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: white;
                }

                .btn--outline:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.3);
                }
            `}</style>
        </div>
    );
}
