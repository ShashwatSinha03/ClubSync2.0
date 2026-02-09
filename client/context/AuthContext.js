'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
                credentials: 'include' // Important for cookies
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error(error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data);
                router.push('/home');
                return { success: true };
            } else {
                const errorData = await res.json();
                // Check if user is pending approval
                if (errorData.status === 'PENDING') {
                    router.push('/pending');
                    return { success: false, error: errorData.message, status: 'PENDING' };
                }
                return { success: false, error: errorData.message || 'Login failed' };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const register = async (userData) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
                credentials: 'include'
            });

            if (res.ok) {
                const data = await res.json();
                // User is pending approval - don't set user state
                router.push('/pending');
                return { success: true, status: 'PENDING' };
            } else {
                const errorData = await res.json();
                return { success: false, error: errorData.message || 'Registration failed' };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            setUser(null);
            router.push('/');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
