import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, XCircle, RotateCcw, AlertCircle, Sparkles } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import DataTable from '../../components/tables/DataTable';
import Modal from '../../components/common/Modal';
import SearchBar from '../../components/common/SearchBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { listMyJobs, closeJob, reopenJob, deleteJob, rankCandidates } from '../../services/jobsApi';
import { statusBadgeStyle } from '../../utils/formatters';

export default function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [query, setQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [rankingJobId, setRankingJobId] = useState(null);
  const [rankMessage, setRankMessage] = useState('');

  function loadJobs() {
    setIsLoading(true);
    listMyJobs()
      .then(setJobs)
      .catch((err) => setError(err.message || 'Could not load your jobs.'))
      .finally(() => setIsLoading(false));
  }

  useEffect(loadJobs, []);

  const filtered = jobs.filter((j) => j.Title.toLowerCase().includes(query.toLowerCase()));

  async function handleToggleStatus(job) {
    setActionError('');
    try {
      const updated = job.Status === 'Open' ? await closeJob(job.Id) : await reopenJob(job.Id);
      setJobs(jobs.map((j) => (j.Id === job.Id ? updated : j)));
    } catch (err) {
      setActionError(err.message || 'Could not update this job.');
    }
  }

  async function handleDelete() {
    setActionError('');
    try {
      await deleteJob(deleteTarget.Id);
      setJobs(jobs.filter((j) => j.Id !== deleteTarget.Id));
      setDeleteTarget(null);
    } catch (err) {
      // A job with applications can't be hard-deleted (backend returns 409
      // for this) — surface that real reason rather than a generic failure.
      setActionError(err.message || 'Could not delete this job.');
      setDeleteTarget(null);
    }
  }

  async function handleRank(job) {
    setRankingJobId(job.Id);
    setActionError('');
    setRankMessage('');
    try {
      const results = await rankCandidates(job.Id);
      setRankMessage(`Ranked ${results.length} applicant${results.length !== 1 ? 's' : ''} for "${job.Title}".`);
    } catch (err) {
      // A job with zero applications returns a 404 from the backend —
      // surfaced as-is since it's a real, useful message ("nothing to rank
      // yet"), not a generic failure.
      setActionError(err.message || 'Could not rank candidates for this job.');
    } finally {
      setRankingJobId(null);
    }
  }

  const columns = [
    { key: 'title', header: 'Job Title', render: (r) => <span className="font-medium text-ink-900">{r.Title}</span> },
    { key: 'location', header: 'Location', render: (r) => r.Location },
    { key: 'status', header: 'Status', render: (r) => <Badge className={statusBadgeStyle(r.Status)}>{r.Status}</Badge> },
    { key: 'actions', header: '', render: (r) => (
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleRank(r)}
          disabled={rankingJobId === r.Id}
          className="p-2 text-ink-500 hover:text-primary-600 disabled:opacity-40"
          aria-label="Rank candidates"
          title="Recalculate match scores for all applicants"
        >
          <Sparkles size={15} />
        </button>
        <button className="p-2 text-ink-500 hover:text-primary-600" aria-label="Edit job"><Pencil size={15} /></button>
        {r.Status === 'Open' ? (
          <button onClick={() => handleToggleStatus(r)} className="p-2 text-ink-500 hover:text-amber-600" aria-label="Close job"><XCircle size={15} /></button>
        ) : (
          <button onClick={() => handleToggleStatus(r)} className="p-2 text-ink-500 hover:text-teal-600" aria-label="Reopen job"><RotateCcw size={15} /></button>
        )}
        <button onClick={() => setDeleteTarget(r)} className="p-2 text-ink-500 hover:text-red-600" aria-label="Delete job"><Trash2 size={15} /></button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink-900">Manage Jobs</h2>
          <p className="text-sm text-ink-500 mt-1">{jobs.length} total postings</p>
        </div>
        <Link to="/recruiter/jobs/create"><Button icon={Plus}>Create Job</Button></Link>
      </div>

      {(error || actionError) && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle size={16} /> {error || actionError}
        </div>
      )}

      {rankMessage && (
        <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 rounded-lg px-4 py-3 text-sm">
          <Sparkles size={16} /> {rankMessage}
        </div>
      )}

      <Card padding="p-0">
        <div className="p-5 border-b border-slate-100">
          <SearchBar value={query} onChange={setQuery} placeholder="Search jobs…" className="max-w-sm" />
        </div>
        {isLoading ? (
          <LoadingSpinner label="Loading your jobs…" />
        ) : filtered.length === 0 ? (
          <EmptyState title="No jobs yet" description="Create your first job posting to start receiving applications." />
        ) : (
          <div className="p-2"><DataTable columns={columns} data={filtered.map((j) => ({ ...j, id: j.Id }))} /></div>
        )}
      </Card>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Job Posting"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-ink-700">
          Are you sure you want to delete <strong>{deleteTarget?.Title}</strong>? Jobs with existing applications
          can't be deleted — close them instead to preserve application history.
        </p>
      </Modal>
    </div>
  );
}
