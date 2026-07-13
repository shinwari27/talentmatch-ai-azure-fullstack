import React from 'react';

export default function LoadingSpinner({ size = 32, label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-ink-500">
      <div
        className="rounded-full border-4 border-slate-200 border-t-primary-600 animate-spin"
        style={{ width: size, height: size }}
        role="status"
        aria-label={label}
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}
