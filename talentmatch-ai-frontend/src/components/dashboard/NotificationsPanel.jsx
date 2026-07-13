import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, AlertCircle } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import LoadingSpinner from '../common/LoadingSpinner';
import { notificationsApi } from '../../services/adminNotificationsApi';
import { formatDate } from '../../utils/formatters';

const dot = { success: 'bg-teal-500', info: 'bg-primary-600', warning: 'bg-amber-500', error: 'bg-red-500' };

export default function NotificationsPanel() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    notificationsApi
      .list()
      .then(setItems)
      .catch((err) => setError(err.message || 'Could not load notifications.'))
      .finally(() => setIsLoading(false));
  }, []);

  const unread = items.filter((n) => !n.IsRead).length;

  async function markAllRead() {
    try {
      await notificationsApi.markAllRead();
      setItems(items.map((n) => ({ ...n, IsRead: true })));
    } catch (err) {
      setError(err.message || 'Could not update notifications.');
    }
  }

  async function markOneRead(id) {
    try {
      await notificationsApi.markRead(id);
      setItems(items.map((n) => (n.Id === id ? { ...n, IsRead: true } : n)));
    } catch {
      // Not critical enough to interrupt the user with an error banner for
      // a single notification click — it just stays unread visually, which
      // is a safe, low-consequence failure mode.
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink-900">Notifications</h2>
          <p className="text-sm text-ink-500 mt-1">{unread} unread notification{unread !== 1 ? 's' : ''}</p>
        </div>
        <Button variant="outline" size="sm" icon={CheckCheck} onClick={markAllRead}>Mark All Read</Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <Card padding="p-0">
        {isLoading ? (
          <LoadingSpinner label="Loading notifications…" />
        ) : items.length === 0 ? (
          <EmptyState icon={Bell} title="You're all caught up" description="New notifications will show up here." />
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((n) => (
              <button
                key={n.Id}
                onClick={() => markOneRead(n.Id)}
                className={`w-full text-left flex items-start gap-3 px-6 py-4 hover:bg-slate-50/60 transition-colors ${!n.IsRead ? 'bg-primary-50/30' : ''}`}
              >
                <span className={`w-2 h-2 rounded-full mt-2 shrink-0 ${dot[n.Type] || dot.info}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-900">{n.Title}</p>
                  <p className="text-sm text-ink-500">{n.Message}</p>
                </div>
                <span className="text-xs text-ink-500 whitespace-nowrap">{formatDate(n.CreatedAt)}</span>
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
