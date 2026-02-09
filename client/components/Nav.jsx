"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import AdminOverlay from './AdminOverlay';
import PillNav from './PillNav';
import ThemeToggle from './ThemeToggle';
import './Nav.css';

const Nav = ({ variant = 'desktop' }) => {
  const { user } = useAuth();
  const [showAdmin, setShowAdmin] = React.useState(false);

  const navItems = [
    { label: 'Home', href: '/home' },
    { label: 'Events', href: '/events' },
    { label: 'You', href: '/you' },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({
      label: 'Admin',
      onClick: () => setShowAdmin(true)
    });
  }

  return (
    <div className="nav-container">
      <PillNav 
        items={navItems}
        baseColor="var(--nav-base)"
        pillColor="var(--nav-pill)"
        pillTextColor="var(--nav-pill)"
        hoveredPillTextColor="var(--nav-base)"
      />
      <div className="desktop-only" style={{ marginLeft: '1rem' }}>
        <ThemeToggle />
      </div>
      {user?.role === 'ADMIN' && (
        <AdminOverlay isOpen={showAdmin} onClose={() => setShowAdmin(false)} />
      )}
    </div>
  );
};

export default Nav;
