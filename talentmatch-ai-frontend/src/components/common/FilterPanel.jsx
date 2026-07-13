import React from 'react';

export default function FilterPanel({ filters, values, onChange }) {
  return (
    <div className="flex flex-wrap gap-3">
      {filters.map((f) => (
        <select
          key={f.key}
          value={values[f.key] || ''}
          onChange={(e) => onChange(f.key, e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-ink-300 bg-white text-sm text-ink-700 focus:border-primary-600 outline-none"
        >
          <option value="">{f.label}</option>
          {f.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ))}
    </div>
  );
}
