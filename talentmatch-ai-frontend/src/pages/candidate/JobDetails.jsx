import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Briefcase, DollarSign, GraduationCap, CheckCircle2, AlertCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Breadcrumb from '../../components/common/Breadcrumb';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getJob, applyToJob } from '../../services/jobsApi';
import { getInitials, formatSalaryRange } from '../../utils/formatters';

export default function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getJob(id)
      .then(setJob)
      .catch((err) => setLoadError(err.message || 'Could not load this job.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  async function handleApply() {
    setIsApplying(true);
    setApplyError('');
    try {
      await applyToJob(id);
      setApplied(true);
      setConfirmOpen(false);
      setShowToast(true);
    } catch (err) {
      // Most likely a 409 "already applied" or a 400 "job no longer open" —
      // both are real backend messages, shown as-is rather than a generic one.
      setApplyError(err.message || 'Could not submit your application.');
    } finally {
      setIsApplying(false);
    }
  }

  if (isLoading) return <LoadingSpinner label="Loading job…" />;

  if (loadError || !job) {
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm max-w-2xl">
        <AlertCircle size={16} /> {loadError || 'Job not found.'}
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <Breadcrumb items={[{ label: 'Browse Jobs', to: '/candidate/jobs' }, { label: job.Title }]} />

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary-600 text-white flex items-center justify-center font-semibold">
              {getInitials(job.CompanyName)}
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-ink-900">{job.Title}</h1>
              <p className="text-ink-500 text-sm">{job.CompanyName}</p>
            </div>
          </div>
          <Button onClick={() => setConfirmOpen(true)} disabled={applied || job.Status !== 'Open'}>
            {applied ? 'Applied ✓' : job.Status !== 'Open' ? 'Closed' : 'Apply Now'}
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 text-sm">
          <div className="flex items-center gap-2 text-ink-700"><MapPin size={15} className="text-primary-600" /> {job.Location}</div>
          {job.ExperienceRequired && (
            <div className="flex items-center gap-2 text-ink-700"><Briefcase size={15} className="text-primary-600" /> {job.ExperienceRequired}</div>
          )}
          <div className="flex items-center gap-2 text-ink-700"><DollarSign size={15} className="text-primary-600" /> {formatSalaryRange(job.SalaryMin, job.SalaryMax)}</div>
          {job.EducationRequirement && (
            <div className="flex items-center gap-2 text-ink-700"><GraduationCap size={15} className="text-primary-600" /> {job.EducationRequirement}</div>
          )}
        </div>
      </Card>

      {applyError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-6">
          <AlertCircle size={16} /> {applyError}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <h3 className="font-display font-semibold text-ink-900 mb-3">Job Description</h3>
            <p className="text-sm text-ink-700 leading-relaxed">{job.Description}</p>
          </Card>

          {job.Responsibilities?.length > 0 && (
            <Card>
              <h3 className="font-display font-semibold text-ink-900 mb-3">Responsibilities</h3>
              <ul className="space-y-2">
                {job.Responsibilities.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-sm text-ink-700">
                    <CheckCircle2 size={15} className="text-teal-600 mt-0.5 shrink-0" /> {r}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {job.Benefits?.length > 0 && (
            <Card>
              <h3 className="font-display font-semibold text-ink-900 mb-3">Benefits</h3>
              <div className="flex flex-wrap gap-2">
                {job.Benefits.map((b) => <Badge key={b} className="bg-teal-50 text-teal-700">{b}</Badge>)}
              </div>
            </Card>
          )}
        </div>

        <Card className="h-fit">
          <h3 className="font-display font-semibold text-ink-900 mb-3">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {job.skills?.length ? (
              job.skills.map((s) => <Badge key={s.SkillId} className="bg-primary-50 text-primary-700">{s.Name}</Badge>)
            ) : (
              <span className="text-sm text-ink-500">No specific skills listed.</span>
            )}
          </div>
        </Card>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm Application"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={isApplying}>Cancel</Button>
            <Button onClick={handleApply} disabled={isApplying}>
              {isApplying ? 'Submitting…' : 'Confirm & Apply'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-700">
          You're about to apply for <strong>{job.Title}</strong> at <strong>{job.CompanyName}</strong>. You can track
          this application under My Applications.
        </p>
      </Modal>

      {showToast && <Toast message="Application submitted successfully." onClose={() => setShowToast(false)} />}
    </div>
  );
}
