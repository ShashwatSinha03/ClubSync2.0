"use client";
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="theme-switch-wrapper">
      <input 
        id="theme-switch" 
        type="checkbox" 
        checked={theme === 'light'} 
        onChange={toggleTheme} 
        style={{ display: 'none' }}
      />
      <label className="love-heart" htmlFor="theme-switch">
        <i className="round"></i>
        <div className="bottom"></div>
      </label>
    </div>
  );
};

export default ThemeToggle;
