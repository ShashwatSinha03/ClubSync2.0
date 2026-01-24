'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';

export default function Navbar() {
    const { user, loginWithGoogle, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            // Google gives us an access token or code. 
            // Depending on the flow, @react-oauth/google mostly gives code or token.
            // If using implicit flow (default usually) we get access_token. 
            // But backend `verifyIdToken` expects an ID TOKEN.
            // We need to request 'id_token' specifically or use the One Tap / Google Login button component.
            // However, useGoogleLogin hook has an override.
            // Actually, best to use the flow that returns id_token if we want to verify on backend easily.
            // Or use the `code` flow and exchange it on backend. 
            // For simplicity with `verifyIdToken` on backend, we need `id_token`.
            // But `useGoogleLogin` with `flow: 'implicit'` returns access_token.
            // Let's use the Component `GoogleLogin` instead? Or just use the token we get?
            // Wait, standard `verifyIdToken` in node library verifies ID TOKEN, not access token.
            // We can get ID Token via `useGoogleLogin` by asking for `response_type: 'id_token'` but that's deprecated/harder.
            // Let's stick to the simpler approach: The standard `GoogleLogin` button component gives credential (id_token).
            // But user asked for a custom button style potentially. 
            // Let's use the hook but we need to fetch user info or use `flow: 'auth-code'`.
            // ACTUALLY, simpler: The `GoogleLogin` component is the valid way to get `credential` (JWT).
            // But if we want a custom button, we use `useGoogleLogin`.
            // Note: `verifyIdToken` needs an ID Token. `useGoogleLogin` IMPLICIT flow gives access_token.
            // `useGoogleLogin` AUTH-CODE flow gives code.
            // If we use `useGoogleLogin` we might need to change backend to use `getToken(code)`.
            // For now, let's use the GoogleLogin component for simplicity OR assume we can switch to backend exchange if needed.
            // Let's try to use the Component in the logic, but usually Navbar has a button.
            // I will implement a custom button that calls `googleLogin`.
            // ISSUE: `useGoogleLogin` by default gives access_token, not id_token.
            // Backend `client.verifyIdToken` EXPECTS id_token.
            // To fix this: I'll change backend to accept `access_token` and use `tokeninfo` endpoint OR
            // I'll make the client send the `code` and backend exchange it.
            // OR I'll use the `GoogleLogin` component (which renders a Google button) for the login button on the landing page/navbar.
            // The request says "Login with Google button on top-right".
            // I'll implement a custom handler that triggers the login.
            
            // To keep it simple and robust:
            // I'll use `flow: 'auth-code'` and handle code exchange on backend? 
            // No, the backend code I wrote uses `verifyIdToken` which expects `idToken`.
            // So I MUST send an id_token.
            // The `GoogleLogin` component provides `credential` which IS the id_token.
            // So I should render the `GoogleLogin` component or similar.
            // But for a custom "Login" button...
            // Let's just use the logic `onSuccess: (response) => loginWithGoogle(response.credential)`
            // This works if we Use `GoogleLogin` component.
            // If we use `useGoogleLogin` hook, we don't get credential easily without code exchange.
            // I will Use `GoogleLogin` component wrapper for the button, or adjust backend.
            // Let's just use the `GoogleLogin` component for the "Login" button in the Navbar.
        },
        onError: () => console.log('Login Failed')
    });

    const handleLoginSuccess = (credentialResponse) => {
        loginWithGoogle(credentialResponse.credential);
    };

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
                        // We will use the GoogleLogin component in the landing page mostly, 
                        // but here we can link to it or show it.
                        // For a consistent UI, maybe just a Link to "Login" or render the button.
                         <Link href="/" className="btn btn--primary">
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
