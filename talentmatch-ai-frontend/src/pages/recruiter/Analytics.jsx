import React, { useEffect, useState } from 'react';
import { Users, Briefcase, Award, AlertCircle, Target } from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import TrendLineChart from '../../components/charts/TrendLineChart';
import BarChartPanel from '../../components/charts/BarChartPanel';
import DonutChartPanel from '../../components/charts/DonutChartPanel';
import MatchRing from '../../components/common/MatchRing';
import { getAnalytics, getDashboard } from '../../services/dashboardAnalyticsApi';

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getAnalytics(), getDashboard()])
      .then(([a, d]) => {
        setAnalytics(a);
        setDashboard(d);
      })
      .catch((err) => setError(err.message || 'Could not load analytics.'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingSpinner label="Loading analytics…" />;
  if (error) {
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
        <AlertCircle size={16} /> {error}
      </div>
    );
  }

  // The chart components expect lowercase {name, value} — the backend
  // returns {Name, Value} for these two, so they're remapped here rather
  // than changing the shared chart components' expectations.
  const skillData = analytics.skillDistribution.map((d) => ({ name: d.Name, value: d.Value }));
  const experienceData = analytics.experienceDistribution.map((d) => ({ name: d.Name, value: d.Value }));
  const topSkill = analytics.skillDistribution[0]?.Name || 'No data yet';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-900">Analytics</h2>
        <p className="text-sm text-ink-500 mt-1">Hiring performance across all your job postings.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Applicants" value={dashboard.totalApplicants} icon={Users} accent="primary" />
        <StatCard label="Jobs" value={dashboard.totalJobs} icon={Briefcase} accent="teal" />
        <StatCard label="Top Skill" value={topSkill} icon={Award} accent="primary" />
        <StatCard
          label="Avg Match Score"
          value={analytics.matchStatistics.overall.avgScore != null ? `${analytics.matchStatistics.overall.avgScore}%` : 'No scores yet'}
          icon={Target}
          accent="teal"
        />
      </div>

      <div>
        <h3 className="font-display font-semibold text-ink-900 mb-4">Match Statistics</h3>
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <p className="text-sm font-medium text-ink-700 mb-4">Score Distribution</p>
            {analytics.matchStatistics.overall.totalScored === 0 ? (
              <EmptyState title="No scored applications yet" description="This fills in once candidates apply and get matched." />
            ) : (
              <BarChartPanel data={analytics.matchStatistics.distribution} dataKey="value" xKey="bucket" />
            )}
          </Card>

          <Card padding="p-0">
            <p className="text-sm font-medium text-ink-700 px-6 pt-6 mb-2">By Job</p>
            {analytics.matchStatistics.perJob.length === 0 ? (
              <div className="px-6 pb-6"><EmptyState title="No jobs yet" description="Create a job posting to see per-job match stats here." /></div>
            ) : (
              <div className="divide-y divide-slate-100">
                {analytics.matchStatistics.perJob.map((j) => (
                  <div key={j.jobId} className="flex items-center justify-between px-6 py-3.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-900 truncate">{j.title}</p>
                      <p className="text-xs text-ink-500">{j.applicantCount} applicant{j.applicantCount !== 1 ? 's' : ''}</p>
                    </div>
                    {j.avgScore != null ? (
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-ink-500">avg</p>
                          <MatchRing score={j.avgScore} size={34} strokeWidth={3} />
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-ink-500">top</p>
                          <MatchRing score={j.topScore} size={34} strokeWidth={3} />
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-ink-500 shrink-0">Not scored yet</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-display font-semibold text-ink-900 mb-4">Applications Per Month</h3>
          {analytics.applicationTrend.length === 0 ? (
            <EmptyState title="Not enough data yet" description="This fills in once you have applications over time." />
          ) : (
            <TrendLineChart data={analytics.applicationTrend} dataKey="Applications" xKey="Month" />
          )}
        </Card>
        <Card>
          <h3 className="font-display font-semibold text-ink-900 mb-4">Hiring Funnel</h3>
          <BarChartPanel data={analytics.hiringFunnel} dataKey="value" xKey="stage" />
        </Card>
        <Card>
          <h3 className="font-display font-semibold text-ink-900 mb-4">Skill Distribution</h3>
          {skillData.length === 0 ? (
            <EmptyState title="No skill data yet" description="This fills in once candidates with listed skills apply." />
          ) : (
            <DonutChartPanel data={skillData} />
          )}
        </Card>
        <Card>
          <h3 className="font-display font-semibold text-ink-900 mb-4">Experience Distribution</h3>
          <p className="text-xs text-ink-500 mb-3">
            Based on the experience level requested by the jobs applicants applied to — not a computed
            years-of-experience value for each candidate.
          </p>
          {experienceData.length === 0 ? (
            <EmptyState title="No data yet" description="This fills in once applications come in." />
          ) : (
            <DonutChartPanel data={experienceData} />
          )}
        </Card>
      </div>
    </div>
  );
}
