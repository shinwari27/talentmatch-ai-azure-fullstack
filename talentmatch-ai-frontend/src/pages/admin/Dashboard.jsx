import React, { useEffect, useState } from 'react';
import { Users, Briefcase, UserCog, UserRound, ShieldCheck, AlertCircle } from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getDashboard } from '../../services/dashboardAnalyticsApi';
import { formatDate } from '../../utils/formatters';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((err) => setError(err.message || 'Could not load the dashboard.'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingSpinner label="Loading platform overview…" />;
  if (error) {
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
        <AlertCircle size={16} /> {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-900">Platform Overview</h2>
        <p className="text-sm text-ink-500 mt-1">System-wide metrics across TalentMatch AI.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Total Users" value={data.totalUsers} icon={Users} accent="primary" />
        <StatCard label="Recruiters" value={data.recruiters} icon={UserCog} accent="teal" />
        <StatCard label="Candidates" value={data.candidates} icon={UserRound} accent="amber" />
        <StatCard label="Jobs" value={data.totalJobs} icon={Briefcase} accent="primary" />
      </div>

      <Card padding="p-0">
        <h3 className="font-display font-semibold text-ink-900 px-6 pt-6 mb-2">Recent Audit Activity</h3>
        {data.recentAuditLogs.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No audit activity yet"
            description="Sensitive actions (like suspending a user) will appear here once they happen."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {data.recentAuditLogs.map((log, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4">
                <p className="text-sm text-ink-900">
                  <strong className="font-medium">{log.actorName}</strong> — {log.action}
                </p>
                <span className="text-xs text-ink-500">{formatDate(log.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
