import React from 'react';

const baseInput =
  'w-full px-3.5 py-2.5 rounded-lg border border-ink-300 bg-white text-sm text-ink-900 placeholder:text-ink-500 focus:border-primary-600 focus:ring-1 focus:ring-primary-600 outline-none transition-colors';

export default function FormField({ label, type = 'text', as = 'input', options = [], required, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="block text-sm font-medium text-ink-700 mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </span>
      )}
      {as === 'textarea' ? (
        <textarea rows={4} className={baseInput} required={required} {...props} />
      ) : as === 'select' ? (
        <select className={baseInput} required={required} {...props}>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input type={type} className={baseInput} required={required} {...props} />
      )}
    </label>
  );
}
