'use client';

import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
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
        <div className="login-page">
            <div className="ambient-orb"></div>
            
            <div className="login-card">
                <div className="card-header">
                    <Link href="/" className="logo">SAARANG</Link>
                    <h1>Welcome Back</h1>
                    <p>Sign in to sync your rhythm.</p>
                </div>

                <div className="card-body">
                    <div className="google-btn-wrapper">
                        <GoogleLogin
                            onSuccess={handleSuccess}
                            onError={() => console.log('Login Failed')}
                            theme="filled_black"
                            shape="pill"
                            size="large"
                            width="280"
                            text="continue_with"
                        />
                    </div>
                </div>

                <div className="card-footer">
                    <p>By continuing, you agree to our Terms of Service and Privacy Policy.</p>
                </div>
            </div>
        </div>
    );
}
