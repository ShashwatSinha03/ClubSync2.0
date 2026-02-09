"use client";
import React from 'react';
import Nav from './Nav';
import './Shell.css';

const Shell = ({ children }) => {
  return (
    <div className="shell">
      <header className="shell-header">
        <div className="shell-container">
          <Nav variant="desktop" />
        </div>
      </header>

      <main className="shell-main">
        <div className="shell-container">
          {children}
        </div>
      </main>

      <footer className="shell-mobile-nav">
        <Nav variant="mobile" />
      </footer>
    </div>
  );
};

export default Shell;
