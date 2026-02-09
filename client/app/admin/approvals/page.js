'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminApprovalsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [pendingUsers, setPendingUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'ADMIN') {
                router.push('/home');
            } else {
                fetchPendingUsers();
            }
        }
    }, [user, loading, router]);

    const fetchPendingUsers = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/pending-users`, {
                credentials: 'include'
            });

            if (res.ok) {
                const data = await res.json();
                setPendingUsers(data);
            } else {
                setError('Failed to fetch pending users');
            }
        } catch (error) {
            console.error('Error fetching pending users:', error);
            setError('Error loading pending users');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (userId) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/approve-user/${userId}`, {
                method: 'POST',
                credentials: 'include'
            });

            if (res.ok) {
                // Remove approved user from list
                setPendingUsers(pendingUsers.filter(u => u._id !== userId));
            } else {
                const errorData = await res.json();
                alert(errorData.message || 'Failed to approve user');
            }
        } catch (error) {
            console.error('Error approving user:', error);
            alert('Error approving user');
        }
    };

    if (loading || !user || user.role !== 'ADMIN') {
        return <div className="loading">Checking credentials...</div>;
    }

    return (
        <div className="approvals-page">
            <div className="container">
                <header className="header">
                    <div>
                        <h1>User Approvals</h1>
                        <p className="subtitle">Review and approve pending user registrations</p>
                    </div>
                    <Link href="/home" className="btn btn--outline">
                        ← Back to Home
                    </Link>
                </header>

                <main className="main-content">
                    {isLoading ? (
                        <div className="loading-state">Loading pending users...</div>
                    ) : error ? (
                        <div className="error-state">{error}</div>
                    ) : pendingUsers.length === 0 ? (
                        <div className="empty-state">
                            <div className="icon">✓</div>
                            <h2>All caught up!</h2>
                            <p>No pending user approvals at the moment.</p>
                        </div>
                    ) : (
                        <div className="users-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Instrument</th>
                                        <th>Registered</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingUsers.map(user => (
                                        <tr key={user._id}>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>{user.instrument || 'N/A'}</td>
                                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <button 
                                                    onClick={() => handleApprove(user._id)}
                                                    className="btn btn--primary btn--sm"
                                                >
                                                    Approve
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>

            <style jsx>{`
                .approvals-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
                    color: white;
                    padding: 2rem;
                }

                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 3rem;
                    padding-bottom: 2rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                h1 {
                    font-size: 2.5rem;
                    font-weight: 800;
                    margin-bottom: 0.5rem;
                }

                .subtitle {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 1rem;
                }

                .btn {
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                    text-decoration: none;
                    display: inline-block;
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

                .btn--primary {
                    background: #ffdd00;
                    color: #0a0a0a;
                }

                .btn--primary:hover {
                    background: #ffd700;
                }

                .btn--sm {
                    padding: 0.5rem 1rem;
                    font-size: 0.9rem;
                }

                .loading-state,
                .error-state {
                    text-align: center;
                    padding: 3rem;
                    color: rgba(255, 255, 255, 0.6);
                }

                .error-state {
                    color: #ff4444;
                }

                .empty-state {
                    text-align: center;
                    padding: 4rem 2rem;
                }

                .empty-state .icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                    color: #22c55e;
                }

                .empty-state h2 {
                    font-size: 1.75rem;
                    margin-bottom: 0.5rem;
                }

                .empty-state p {
                    color: rgba(255, 255, 255, 0.6);
                }

                .users-table {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    overflow: hidden;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                }

                th {
                    background: rgba(255, 255, 255, 0.05);
                    padding: 1rem 1.5rem;
                    text-align: left;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                td {
                    padding: 1.25rem 1.5rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                }

                tbody tr {
                    transition: background 0.2s;
                }

                tbody tr:hover {
                    background: rgba(255, 255, 255, 0.02);
                }

                .loading {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: rgba(255, 255, 255, 0.6);
                }
            `}</style>
        </div>
    );
}
