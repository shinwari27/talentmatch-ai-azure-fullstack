import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, CalendarCheck, FileText, ArrowRight, AlertCircle, Lightbulb } from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../hooks/useAuth';
import { getDashboard } from '../../services/dashboardAnalyticsApi';
import { listOpenJobs } from '../../services/jobsApi';
import { listMyApplications } from '../../services/applicationsApi';
import { statusBadgeStyle, getInitials, formatDate } from '../../utils/formatters';

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [recommendedSkills, setRecommendedSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getDashboard(), listOpenJobs({ page: 1 }), listMyApplications()])
      .then(([dashboard, jobsResult, applications]) => {
        setData(dashboard);
        setRecentJobs(jobsResult.jobs.slice(0, 3));

        // Aggregate missing skills across every application that's been
        // scored — this reuses the match breakdowns already computed and
        // stored on apply, rather than running a new calculation just for
        // the dashboard. A skill missing from more of your applications
        // shows up as a stronger recommendation.
        const skillCounts = {};
        applications.forEach((app) => {
          (app.MatchBreakdown?.missingSkills || []).forEach((skill) => {
            skillCounts[skill] = (skillCounts[skill] || 0) + 1;
          });
        });
        const sorted = Object.entries(skillCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([skill, count]) => ({ skill, count }));
        setRecommendedSkills(sorted);
      })
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
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-900">Welcome back, {user?.fullName?.split(' ')[0]} 👋</h2>
        <p className="text-sm text-ink-500 mt-1">Here's what's happening with your job search today.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Applications" value={data.totalApplications} icon={ClipboardList} accent="primary" />
        <StatCard label="Interviews" value={data.interviewCount} icon={CalendarCheck} accent="teal" />
        <StatCard label="Offers" value={data.offerCount} icon={CalendarCheck} accent="amber" />
        <StatCard label="Resume Score" value={data.resumeScore != null ? `${data.resumeScore}%` : 'Not uploaded'} icon={FileText} accent="primary" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-semibold text-ink-900">Recently Posted Jobs</h3>
            <Link to="/candidate/jobs" className="text-sm text-primary-600 font-medium flex items-center gap-1 hover:underline">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {recentJobs.length === 0 ? (
            <EmptyState title="No open jobs right now" description="Check back soon for new postings." />
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <Link key={job.Id} to={`/candidate/jobs/${job.Id}`} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                      {getInitials(job.CompanyName)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-900 truncate">{job.Title}</p>
                      <p className="text-xs text-ink-500">{job.CompanyName} · {job.Location}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-display font-semibold text-ink-900 mb-5">Recent Applications</h3>
          {data.recentApplications.length === 0 ? (
            <p className="text-sm text-ink-500">No applications yet.</p>
          ) : (
            <div className="space-y-4">
              {data.recentApplications.map((a) => (
                <div key={a.Id} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-900 truncate">{a.JobTitle}</p>
                    <p className="text-xs text-ink-500">{a.CompanyName} · {formatDate(a.AppliedAt)}</p>
                  </div>
                  <Badge className={statusBadgeStyle(a.Status)}>{a.Status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {recommendedSkills.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={18} className="text-amber-500" />
            <h3 className="font-display font-semibold text-ink-900">Improve Your Match</h3>
          </div>
          <p className="text-sm text-ink-500 mb-4">
            These skills came up as missing across your applications — adding them to your Profile could raise your match score.
          </p>
          <div className="flex flex-wrap gap-2">
            {recommendedSkills.map(({ skill, count }) => (
              <Badge key={skill} className="bg-amber-50 text-amber-700">
                {skill} {count > 1 ? `(${count} jobs)` : ''}
              </Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
