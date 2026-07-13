import React, { useEffect, useState } from 'react';
import { Ban, CheckCircle2, AlertCircle } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import SearchBar from '../common/SearchBar';
import DataTable from '../tables/DataTable';
import Pagination from '../common/Pagination';
import LoadingSpinner from '../common/LoadingSpinner';
import { adminUsersApi } from '../../services/adminNotificationsApi';
import { statusBadgeStyle, formatDate, getInitials } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

export default function UserManagementTable({ roleFilter, title }) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  function load() {
    setIsLoading(true);
    adminUsersApi
      .list({ role: roleFilter, search: query, page })
      .then((result) => {
        setUsers(result.users);
        setTotal(result.total);
      })
      .catch((err) => setError(err.message || 'Could not load users.'))
      .finally(() => setIsLoading(false));
  }

  useEffect(load, [roleFilter, query, page]);

  async function toggleStatus(u) {
    setError('');
    const newStatus = u.Status === 'Active' ? 'Suspended' : 'Active';
    try {
      await adminUsersApi.setStatus(u.Id, newStatus);
      setUsers(users.map((row) => (row.Id === u.Id ? { ...row, Status: newStatus } : row)));
    } catch (err) {
      // Covers the backend's own guard against an admin suspending themselves
      setError(err.message || 'Could not update this user.');
    }
  }

  const columns = [
    { key: 'name', header: 'Name', render: (r) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-semibold">
          {getInitials(r.FullName)}
        </div>
        <div>
          <p className="font-medium text-ink-900">{r.FullName}</p>
          <p className="text-xs text-ink-500">{r.Email}</p>
        </div>
      </div>
    ) },
    ...(roleFilter ? [] : [{ key: 'role', header: 'Role', render: (r) => r.Role }]),
    { key: 'status', header: 'Status', render: (r) => <Badge className={statusBadgeStyle(r.Status)}>{r.Status}</Badge> },
    { key: 'joined', header: 'Joined', render: (r) => formatDate(r.CreatedAt) },
    { key: 'actions', header: '', render: (r) => (
      <button
        onClick={() => toggleStatus(r)}
        disabled={r.Id === currentUser?.id}
        title={r.Id === currentUser?.id ? "You can't suspend your own account" : undefined}
        className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed ${
          r.Status === 'Active' ? 'text-red-600 hover:bg-red-50' : 'text-teal-600 hover:bg-teal-50'
        }`}
      >
        {r.Status === 'Active' ? <><Ban size={13} /> Suspend</> : <><CheckCircle2 size={13} /> Reactivate</>}
      </button>
    ) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-900">{title}</h2>
        <p className="text-sm text-ink-500 mt-1">{total} total</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <Card padding="p-0">
        <div className="p-5 border-b border-slate-100">
          <SearchBar value={query} onChange={(v) => { setQuery(v); setPage(1); }} placeholder="Search by name or email…" className="max-w-sm" />
        </div>
        {isLoading ? (
          <LoadingSpinner label="Loading users…" />
        ) : (
          <div className="p-2"><DataTable columns={columns} data={users.map((u) => ({ ...u, id: u.Id }))} /></div>
        )}
      </Card>

      <Pagination page={page} totalPages={Math.max(1, Math.ceil(total / 20))} onChange={setPage} />
    </div>
  );
}
