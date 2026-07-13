import React from 'react';

export default function ProgressBar({ value, className = '', colorClass = 'bg-primary-600' }) {
  return (
    <div className={`w-full h-2 rounded-full bg-slate-100 overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full ${colorClass} transition-all duration-500`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
