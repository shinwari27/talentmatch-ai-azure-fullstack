import React from 'react';

export default function Card({ children, className = '', hoverable = false, padding = 'p-6' }) {
  return (
    <div className={`card ${padding} ${hoverable ? 'transition-shadow duration-200 hover:shadow-hover' : ''} ${className}`}>
      {children}
    </div>
  );
}
