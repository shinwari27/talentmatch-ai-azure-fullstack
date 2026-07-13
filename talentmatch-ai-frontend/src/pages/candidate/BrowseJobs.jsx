import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, DollarSign, Wifi, AlertCircle } from 'lucide-react';
import SearchBar from '../../components/common/SearchBar';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { listOpenJobs } from '../../services/jobsApi';
import { getInitials, formatSalaryRange, formatDate } from '../../utils/formatters';

// Debounce delay before a typed search actually triggers a new API call —
// without this, every keystroke would fire its own request.
const SEARCH_DEBOUNCE_MS = 400;

export default function BrowseJobs() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsLoading(true);
      setError('');
      listOpenJobs({ search: query, page })
        .then((result) => {
          setJobs(result.jobs);
          setTotal(result.total);
          setPageSize(result.pageSize);
        })
        .catch((err) => setError(err.message || 'Could not load jobs.'))
        .finally(() => setIsLoading(false));
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [query, page]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-900">Browse Jobs</h2>
        <p className="text-sm text-ink-500 mt-1">{total} open role{total !== 1 ? 's' : ''} available.</p>
      </div>

      <Card>
        <SearchBar
          value={query}
          onChange={(v) => { setQuery(v); setPage(1); }}
          placeholder="Search job title or company…"
        />
      </Card>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner label="Loading jobs…" />
      ) : jobs.length === 0 ? (
        <EmptyState title="No jobs match your search" description="Try a different search term." />
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {jobs.map((job) => (
            <Card key={job.Id} hoverable className="flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary-600 text-white flex items-center justify-center text-sm font-semibold">
                    {getInitials(job.CompanyName)}
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-ink-900">{job.Title}</h3>
                    <p className="text-sm text-ink-500">{job.CompanyName}</p>
                  </div>
                </div>
                {job.IsRemote && <Badge className="bg-teal-50 text-teal-700"><Wifi size={12} className="mr-1" />Remote</Badge>}
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-ink-500 mb-4">
                <span className="flex items-center gap-1"><MapPin size={13} /> {job.Location}</span>
                {job.ExperienceRequired && <span className="flex items-center gap-1"><Briefcase size={13} /> {job.ExperienceRequired}</span>}
                <span className="flex items-center gap-1"><DollarSign size={13} /> {formatSalaryRange(job.SalaryMin, job.SalaryMax)}</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-5">
                {job.skills?.slice(0, 4).map((s) => (
                  <Badge key={s.SkillId} className="bg-slate-100 text-ink-700">{s.Name}</Badge>
                ))}
              </div>

              <div className="mt-auto flex items-center justify-between">
                <span className="text-xs text-ink-500">{formatDate(job.PostedAt)}</span>
                <Link to={`/candidate/jobs/${job.Id}`}><Button size="sm">View & Apply</Button></Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={Math.max(1, Math.ceil(total / pageSize))} onChange={setPage} />
    </div>
  );
}
