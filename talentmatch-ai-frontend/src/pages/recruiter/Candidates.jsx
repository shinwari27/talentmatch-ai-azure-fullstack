import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, AlertCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import MatchRing from '../../components/common/MatchRing';
import MatchBreakdownModal from '../../components/common/MatchBreakdownModal';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { listCandidates } from '../../services/candidatesApi';
import { getInitials, statusBadgeStyle } from '../../utils/formatters';

export default function Candidates() {
  const [query, setQuery] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsLoading(true);
      listCandidates({ search: query })
        .then(setCandidates)
        .catch((err) => setError(err.message || 'Could not load candidates.'))
        .finally(() => setIsLoading(false));
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-900">Candidates</h2>
        <p className="text-sm text-ink-500 mt-1">Everyone who has applied to one of your job postings.</p>
      </div>

      <Card>
        <SearchBar value={query} onChange={setQuery} placeholder="Search by name or title…" />
      </Card>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner label="Loading candidates…" />
      ) : candidates.length === 0 ? (
        <EmptyState title="No candidates yet" description="Once someone applies to one of your jobs, they'll show up here." />
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {candidates.map((c) => (
            <Card key={c.ApplicationId} hoverable className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold shrink-0">
                {getInitials(c.FullName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-ink-900">{c.FullName}</h3>
                  {c.MatchScore != null ? (
                    <button onClick={() => setSelectedCandidate(c)} className="hover:opacity-70 transition-opacity" title="View score breakdown">
                      <MatchRing score={c.MatchScore} size={42} strokeWidth={4} />
                    </button>
                  ) : (
                    <span className="text-xs text-ink-500">Not scored</span>
                  )}
                </div>
                <p className="text-sm text-ink-500 mb-1">{c.Title || 'No title set'}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-ink-500 mb-3">
                  {c.Location && <span className="flex items-center gap-1"><MapPin size={12} /> {c.Location}</span>}
                  <Badge className={statusBadgeStyle(c.ApplicationStatus)}>{c.ApplicationStatus}</Badge>
                </div>
                <p className="text-xs text-ink-500 mb-3">Applied for: {c.AppliedForJobTitle}</p>
                <Link to={`/recruiter/candidates/${c.CandidateId}?applicationId=${c.ApplicationId}`}>
                  <Button size="sm" variant="outline">View Profile</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      <MatchBreakdownModal
        open={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        breakdown={selectedCandidate?.MatchBreakdown}
        jobTitle={selectedCandidate?.AppliedForJobTitle}
      />
    </div>
  );
}
