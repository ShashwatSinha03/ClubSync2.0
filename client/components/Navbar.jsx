'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

import { useState } from 'react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);



    return (
        <nav className="navbar">
            <div className="container navbar__container">
                <Link href="/" className="navbar__logo">
                    SAARANG
                </Link>

                <div className="navbar__actions">
                    {user ? (
                        <div className="navbar__profile">
                            <button 
                                onClick={() => setDropdownOpen(!dropdownOpen)} 
                                className="navbar__profile-btn"
                            >
                                <img 
                                    src={user.profilePicture} 
                                    alt={user.name} 
                                    className="navbar__avatar" 
                                />
                                <span>{user.name}</span>
                            </button>

                            {dropdownOpen && (
                                <div className="navbar__dropdown">
                                    <div className="navbar__dropdown-header">
                                        <p className="navbar__user-name">{user.name}</p>
                                        <p className="navbar__user-email">{user.email}</p>
                                        <span className="navbar__user-role">{user.role}</span>
                                    </div>
                                    <Link href="/profile" className="navbar__dropdown-item" onClick={() => setDropdownOpen(false)}>
                                        My Profile
                                    </Link>
                                    <Link href="/dashboard" className="navbar__dropdown-item" onClick={() => setDropdownOpen(false)}>
                                         Dashboard
                                    </Link>
                                    {user.role === 'ADMIN' && (
                                        <Link href="/admin" className="navbar__dropdown-item" onClick={() => setDropdownOpen(false)}>
                                            Admin Panel
                                        </Link>
                                    )}
                                    <button onClick={logout} className="navbar__dropdown-item navbar__logout">
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                         <Link href="/login" className="btn btn--primary">
                            Login
                        </Link>
                    )}
                </div>
            </div>

            <style jsx>{`
                .navbar {
                    height: var(--header-height);
                    border-bottom: 1px solid var(--border);
                    background-color: rgba(18, 18, 18, 0.8);
                    backdrop-filter: blur(10px);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    display: flex;
                    align-items: center;
                }
                .navbar__container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                }
                .navbar__logo {
                    font-size: 1.5rem;
                    font-weight: 700;
                    letter-spacing: 2px;
                    color: var(--primary);
                    text-transform: uppercase;
                }
                .navbar__actions {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-md);
                }
                .navbar__profile {
                    position: relative;
                }
                .navbar__profile-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: transparent;
                    color: var(--text-main);
                    border: 1px solid var(--border);
                    padding: 0.25rem 0.75rem;
                    border-radius: 99px;
                }
                .navbar__avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    object-fit: cover;
                }
                .navbar__dropdown {
                    position: absolute;
                    top: 120%;
                    right: 0;
                    background-color: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius);
                    width: 250px;
                    padding: var(--spacing-sm);
                    box-shadow: 0 10px 15px rgba(0,0,0,0.5);
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .navbar__dropdown-header {
                    padding: var(--spacing-sm) var(--spacing-md);
                    border-bottom: 1px solid var(--border);
                    margin-bottom: var(--spacing-sm);
                }
                .navbar__user-name {
                    font-weight: 600;
                }
                .navbar__user-email {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                }
                .navbar__user-role {
                    font-size: 0.7rem;
                    background: var(--primary);
                    color: white;
                    padding: 2px 6px;
                    border-radius: 4px;
                    margin-top: 4px;
                    display: inline-block;
                }
                .navbar__dropdown-item {
                    padding: var(--spacing-sm) var(--spacing-md);
                    border-radius: var(--radius);
                    text-align: left;
                    font-size: 0.9rem;
                    transition: background 0.2s;
                }
                .navbar__dropdown-item:hover {
                    background-color: var(--surface-hover);
                }
                .navbar__logout {
                    color: var(--error);
                }
            `}</style>
        </nav>
    );
}
