'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.email.endsWith('@rishihood.edu.in')) {
            setError('Please use your official Rishihood University email address.');
            return;
        }

        const res = await login(formData.email, formData.password);
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
                    <h1>Welcome Back</h1>
                    <p>Sign in to sync your rhythm.</p>
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
                                placeholder="Enter your password"
                                className="form-input"
                            />
                        </div>
                        <button type="submit" className="cta-button full-width">Log In</button>
                    </form>

                    <div className="auth-footer" style={{marginTop: '1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.6)'}}>
                        <p>Don't have an account? <Link href="/signup" style={{color: '#ffdd00', textDecoration: 'none'}}>Sign Up</Link></p>
                    </div>
                </div>

                <div className="card-footer">
                    <p>By continuing, you agree to our Terms of Service and Privacy Policy.</p>
                </div>
            </div>

        </div>
    );
}
