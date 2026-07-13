import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const styles = {
  success: { icon: CheckCircle2, className: 'bg-teal-50 text-teal-700 border-teal-200' },
  error: { icon: AlertCircle, className: 'bg-red-50 text-red-700 border-red-200' },
  info: { icon: Info, className: 'bg-primary-50 text-primary-700 border-primary-200' },
};

export default function Toast({ message, type = 'success', onClose, duration = 3500 }) {
  const { icon: Icon, className } = styles[type] || styles.info;

  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 border rounded-xl px-4 py-3 shadow-hover bg-white ${className}`}>
      <Icon size={18} />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 text-ink-500 hover:text-ink-900" aria-label="Dismiss notification">
        <X size={16} />
      </button>
    </div>
  );
}
