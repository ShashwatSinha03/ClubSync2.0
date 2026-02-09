'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Stepper, { Step } from '../../components/Stepper';
import './signup.css';

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
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        setError('');

        if (!formData.email.endsWith('@rishihood.edu.in')) {
            setError('Please use your official Rishihood University email address.');
            setIsSubmitting(false);
            return;
        }

        const res = await register(formData);
        if (!res.success) {
            setError(res.error);
            setIsSubmitting(false);
            // We might want to reset the stepper or just show error
        }
    };

    return (
        <div className="signup-page">
            <div className="signup-container">
                <header className="signup-header">
                    <Link href="/" className="logo">SAARANG</Link>
                    <h1>The Journey Starts Here</h1>
                    <p>Complete the steps to join the club.</p>
                </header>

                {error && (
                    <div className="signup-error">
                        {error}
                    </div>
                )}

                <Stepper 
                    onFinalStepCompleted={handleFinalSubmit}
                    nextButtonText="Next Step"
                    backButtonText="Go Back"
                >
                    <Step>
                        <div className="step-inner">
                            <h3>Tell us about yourself</h3>
                            <p className="step-description">Your basic identity within the club.</p>
                            
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. John Doe"
                                    className="step-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Contact number"
                                    className="step-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Primary Instrument</label>
                                <select
                                    name="instrument"
                                    value={formData.instrument}
                                    onChange={handleChange}
                                    className="step-input"
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
                        </div>
                    </Step>

                    <Step>
                        <div className="step-inner">
                            <h3>Secure your account</h3>
                            <p className="step-description">Use a strong password for your portal access.</p>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="email@example.com"
                                    className="step-input"
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
                                    placeholder="Min. 8 characters"
                                    className="step-input"
                                />
                            </div>
                        </div>
                    </Step>

                    <Step>
                        <div className="step-inner">
                            <h3>Ready to join?</h3>
                            <p className="step-description">Review your details before submitting.</p>
                            
                            <div className="signup-review">
                                <div className="review-item">
                                    <span className="label">Name:</span>
                                    <span className="value">{formData.name || 'Not provided'}</span>
                                </div>
                                <div className="review-item">
                                    <span className="label">Instrument:</span>
                                    <span className="value">{formData.instrument}</span>
                                </div>
                                <div className="review-item">
                                    <span className="label">Email:</span>
                                    <span className="value">{formData.email || 'Not provided'}</span>
                                </div>
                            </div>
                            
                            <p className="submit-note">
                                By completing this step, you agree to follow the club rules and guidelines.
                            </p>
                            
                            {isSubmitting && (
                                <div className="submitting-indicator">
                                    Submitting your request...
                                </div>
                            )}
                        </div>
                    </Step>
                </Stepper>

                <footer className="signup-footer">
                    <p>Joined before? <Link href="/login">Sign In</Link></p>
                </footer>
            </div>
        </div>
    );
}
