import React, { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import DataTable from '../../components/tables/DataTable';
import Badge from '../../components/common/Badge';
import MatchRing from '../../components/common/MatchRing';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MatchBreakdownModal from '../../components/common/MatchBreakdownModal';
import { listMyApplications, recalculateMyMatch } from '../../services/applicationsApi';
import { statusBadgeStyle, formatDate } from '../../utils/formatters';

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [recalculatingId, setRecalculatingId] = useState(null);

  useEffect(() => {
    listMyApplications()
      .then(setApplications)
      .catch((err) => setError(err.message || 'Could not load your applications.'))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleRecalculate(applicationId) {
    setRecalculatingId(applicationId);
    setError('');
    try {
      const updated = await recalculateMyMatch(applicationId);
      setApplications(applications.map((a) => (a.Id === applicationId ? { ...a, ...updated } : a)));
    } catch (err) {
      setError(err.message || 'Could not recalculate this score.');
    } finally {
      setRecalculatingId(null);
    }
  }

  const columns = [
    { key: 'job', header: 'Job', render: (r) => (
      <div>
        <p className="font-medium text-ink-900">{r.JobTitle}</p>
        <p className="text-xs text-ink-500">{r.CompanyName}</p>
      </div>
    ) },
    { key: 'appliedDate', header: 'Applied Date', render: (r) => formatDate(r.AppliedAt) },
    { key: 'status', header: 'Status', render: (r) => <Badge className={statusBadgeStyle(r.Status)}>{r.Status}</Badge> },
    { key: 'matchScore', header: 'Match Score', render: (r) =>
      r.MatchScore != null ? (
        <button onClick={() => setSelectedApp(r)} className="hover:opacity-70 transition-opacity" title="View score breakdown">
          <MatchRing score={r.MatchScore} size={40} strokeWidth={4} />
        </button>
      ) : (
        <span className="text-xs text-ink-500">Not yet scored</span>
      )
    },
    { key: 'missingSkills', header: 'Missing Skills', render: (r) => {
      const missing = r.MatchBreakdown?.missingSkills || [];
      if (missing.length === 0) return <span className="text-xs text-ink-500">—</span>;
      return (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {missing.slice(0, 3).map((s) => <Badge key={s} className="bg-red-50 text-red-600 text-xs">{s}</Badge>)}
          {missing.length > 3 && <span className="text-xs text-ink-500">+{missing.length - 3} more</span>}
        </div>
      );
    } },
    { key: 'recalculate', header: '', render: (r) => (
      <button
        onClick={() => handleRecalculate(r.Id)}
        disabled={recalculatingId === r.Id}
        className="p-2 text-ink-500 hover:text-primary-600 disabled:opacity-40"
        title="Recalculate my score (useful after updating your Profile)"
      >
        <RefreshCw size={15} className={recalculatingId === r.Id ? 'animate-spin' : ''} />
      </button>
    ) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-900">My Applications</h2>
        <p className="text-sm text-ink-500 mt-1">
          Track the status of every job you've applied to. Click a score to see why, or refresh it after updating your Profile.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <Card padding="p-0">
        {isLoading ? (
          <LoadingSpinner label="Loading your applications…" />
        ) : applications.length ? (
          <div className="p-2"><DataTable columns={columns} data={applications} /></div>
        ) : (
          <EmptyState title="No applications yet" description="Browse open jobs and apply to see them tracked here." />
        )}
      </Card>

      <MatchBreakdownModal
        open={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        breakdown={selectedApp?.MatchBreakdown}
        jobTitle={selectedApp?.JobTitle}
      />
    </div>
  );
}
