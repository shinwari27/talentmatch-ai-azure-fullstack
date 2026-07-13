import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center mb-4">
        <Icon size={26} className="text-primary-600" />
      </div>
      <h3 className="font-display font-semibold text-ink-900 text-lg mb-1">{title}</h3>
      {description && <p className="text-ink-500 text-sm max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
