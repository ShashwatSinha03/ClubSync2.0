"use client";
import React from 'react';
import './StatusPill.css';

const StatusPill = ({ status, type = 'rsvp' }) => {
  const getLabel = () => {
    switch(status) {
      case 'GOING': return 'Attending';
      case 'NOT_GOING': return 'Not Attending';
      case 'PRESENT': return 'Present';
      case 'ABSENT': return 'Absent';
      default: return status;
    }
  };

  const getVariant = () => {
    if (status === 'GOING' || status === 'PRESENT') return 'success';
    if (status === 'NOT_GOING' || status === 'ABSENT') return 'danger';
    return 'neutral';
  };

  return (
    <div className={`status-pill pill-${getVariant()}`}>
      {getLabel()}
    </div>
  );
};

export default StatusPill;
