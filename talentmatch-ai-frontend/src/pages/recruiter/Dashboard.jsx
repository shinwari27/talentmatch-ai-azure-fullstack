import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, Gauge, ArrowRight, Plus, AlertCircle } from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import MatchRing from '../../components/common/MatchRing';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getDashboard } from '../../services/dashboardAnalyticsApi';
import { getInitials } from '../../utils/formatters';

export default function RecruiterDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((err) => setError(err.message || 'Could not load your dashboard.'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingSpinner label="Loading your dashboard…" />;
  if (error) {
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
        <AlertCircle size={16} /> {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink-900">Recruiting overview</h2>
          <p className="text-sm text-ink-500 mt-1">Here's how your open roles are performing.</p>
        </div>
        <Link to="/recruiter/jobs/create"><Button icon={Plus}>Create Job</Button></Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Total Jobs" value={data.totalJobs} icon={Briefcase} accent="primary" />
        <StatCard label="Open Jobs" value={data.openJobs} icon={Gauge} accent="teal" />
        <StatCard label="Closed Jobs" value={data.closedJobs} icon={Gauge} accent="amber" />
        <StatCard label="Total Applicants" value={data.totalApplicants} icon={Users} accent="primary" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" padding="p-0">
          <div className="flex items-center justify-between px-6 pt-6 mb-2">
            <h3 className="font-display font-semibold text-ink-900">Active Job Postings</h3>
            <Link to="/recruiter/jobs" className="text-sm text-primary-600 font-medium flex items-center gap-1 hover:underline">
              Manage all <ArrowRight size={14} />
            </Link>
          </div>
          {data.activeJobs.length === 0 ? (
            <p className="text-sm text-ink-500 px-6 pb-6">No open jobs right now.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.activeJobs.map((j) => (
                <div key={j.Id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-ink-900">{j.Title}</p>
                    <p className="text-xs text-ink-500">{j.Location} · {j.ApplicantCount} applicant{j.ApplicantCount !== 1 ? 's' : ''}</p>
                  </div>
                  <Badge className="bg-teal-50 text-teal-700">{j.Status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-display font-semibold text-ink-900 mb-5">Top Ranked Candidates</h3>
          {data.topCandidates.length === 0 ? (
            <p className="text-sm text-ink-500">No applicants yet.</p>
          ) : (
            <div className="space-y-4">
              {data.topCandidates.map((c) => (
                <div key={c.CandidateId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                      {getInitials(c.FullName)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-900 truncate">{c.FullName}</p>
                      <p className="text-xs text-ink-500 truncate">{c.AppliedForJobTitle}</p>
                    </div>
                  </div>
                  {c.MatchScore != null ? (
                    <MatchRing score={c.MatchScore} size={36} strokeWidth={4} />
                  ) : (
                    <span className="text-xs text-ink-500 shrink-0">Not scored</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
