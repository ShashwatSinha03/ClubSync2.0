"use client";
import React from 'react';
import './ActionButton.css';

const ActionButton = ({ label, onClick, active = false, className = '' }) => {
  return (
    <button 
      className={`action-button ${active ? 'active' : ''} ${className}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default ActionButton;
