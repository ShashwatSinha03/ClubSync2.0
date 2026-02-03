'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const { register } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        instrument: 'Vocalist'
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await register(formData);
        if (!res.success) {
            setError(res.error);
        }
    };

    return (
        <div className="login-page">
            <div className="ambient-orb"></div>
            
            <div className="login-card">
                <div className="card-header">
                    <Link href="/" className="logo">SAARANG</Link>
                    <h1>Join the Club</h1>
                    <p>Start your musical journey today.</p>
                </div>

                <div className="card-body">
                    {error && <div className="error-message" style={{
                        background: 'rgba(255, 0, 0, 0.1)', 
                        border: '1px solid rgba(255, 0, 0, 0.3)', 
                        color: '#ff4444', 
                        padding: '10px', 
                        borderRadius: '8px', 
                        marginBottom: '1rem',
                        textAlign: 'center'
                    }}>{error}</div>}
                    
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Enter your full name"
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="Enter your email"
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Create a password"
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Your contact number"
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Primary Instrument</label>
                            <select
                                name="instrument"
                                value={formData.instrument}
                                onChange={handleChange}
                                className="form-input"
                            >
                                <option value="Vocalist">Vocalist</option>
                                <option value="Guitarist">Guitarist</option>
                                <option value="Drummer">Drummer</option>
                                <option value="Keyboardist">Keyboardist</option>
                                <option value="Bassist">Bassist</option>
                                <option value="Tablist">Tablist</option>
                                <option value="Violinist">Violinist</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <button type="submit" className="cta-button full-width">Sign Up</button>
                    </form>

                    <div className="auth-footer" style={{marginTop: '1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.6)'}}>
                        <p>Already have an account? <Link href="/login" style={{color: '#ffdd00', textDecoration: 'none'}}>Sign In</Link></p>
                    </div>
                </div>
            </div>
            <style jsx>{`
                .form-group {
                    margin-bottom: 1.2rem;
                    text-align: left;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 0.4rem;
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 0.9rem;
                }
                .form-input {
                    width: 100%;
                    padding: 12px 16px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: white;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                }
                .form-input:focus {
                    outline: none;
                    border-color: #ffdd00;
                    background: rgba(255, 255, 255, 0.1);
                }
                .form-input option {
                    background: #121212;
                    color: white;
                }
                .full-width {
                    width: 100%;
                    margin-top: 1rem;
                    padding: 14px;
                    background: var(--primary, #8b5cf6);
                    color: white;
                    border: none;
                    border-radius: 99px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .full-width:hover {
                    box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
                    transform: translateY(-2px);
                }
            `}</style>
        </div>
    );
}
