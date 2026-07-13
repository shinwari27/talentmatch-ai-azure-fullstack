import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { notificationsApi } from '../../services/adminNotificationsApi';

export default function DashboardTopbar({ onMenuClick, title }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    notificationsApi
      .list()
      .then((items) => setUnreadCount(items.filter((n) => !n.IsRead).length))
      .catch(() => {}); // silent — a failed badge count shouldn't disrupt the whole header
  }, []);

  const notificationsPath = user?.role ? `/${user.role.toLowerCase()}/notifications` : '#';

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-100 h-16 flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-3">
        <button className="lg:hidden text-ink-700" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={22} />
        </button>
        <h1 className="font-display font-semibold text-lg text-ink-900">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center relative">
          <Search size={16} className="absolute left-3 text-ink-500" />
          <input
            placeholder="Quick search…"
            className="pl-9 pr-4 py-2 w-56 rounded-lg border border-ink-300 text-sm outline-none focus:border-primary-600"
          />
        </div>
        <Link to={notificationsPath} className="relative text-ink-700 hover:text-primary-600" aria-label="Notifications">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
          )}
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold">
            {user?.avatar}
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-sm font-medium text-ink-900">{user?.fullName}</p>
            <p className="text-xs text-ink-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
