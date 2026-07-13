import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { GraduationCap, Briefcase, Award, Globe2, FolderGit2, AlertCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Breadcrumb from '../../components/common/Breadcrumb';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getCandidate } from '../../services/candidatesApi';
import { updateApplicationStatus } from '../../services/applicationsApi';
import { getInitials } from '../../utils/formatters';

export default function CandidateDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const applicationId = searchParams.get('applicationId');

  const [candidate, setCandidate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdateError, setStatusUpdateError] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    getCandidate(id)
      .then(setCandidate)
      .catch((err) => setError(err.message || 'Could not load this candidate.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  async function handleStatusChange(status) {
    if (!applicationId) return;
    setIsUpdatingStatus(true);
    setStatusUpdateError('');
    try {
      await updateApplicationStatus(applicationId, status);
    } catch (err) {
      setStatusUpdateError(err.message || 'Could not update this application.');
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  if (isLoading) return <LoadingSpinner label="Loading candidate…" />;

  if (error || !candidate) {
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm max-w-2xl">
        <AlertCircle size={16} /> {error || 'Candidate not found.'}
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <Breadcrumb items={[{ label: 'Candidates', to: '/recruiter/candidates' }, { label: candidate.FullName }]} />

      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-600 text-white flex items-center justify-center text-xl font-semibold">
            {getInitials(candidate.FullName)}
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-ink-900">{candidate.FullName}</h1>
            <p className="text-sm text-ink-500">{candidate.Title || 'No title set'} · {candidate.Location || 'No location set'}</p>
            {candidate.ResumeScore != null && (
              <p className="text-xs text-ink-500 mt-0.5">Resume score: {candidate.ResumeScore}%</p>
            )}
          </div>
        </div>
      </Card>

      {candidate.Bio && (
        <Card>
          <h3 className="font-display font-semibold text-ink-900 mb-2">About</h3>
          <p className="text-sm text-ink-700 leading-relaxed">{candidate.Bio}</p>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <p className="text-ink-500 text-sm mb-3 flex items-center gap-1.5"><Briefcase size={14} /> Skills</p>
          <div className="flex flex-wrap gap-2">
            {candidate.skills.length ? (
              candidate.skills.map((s) => (
                <Badge key={s.SkillId} className={s.IsMissingForTarget ? 'bg-red-50 text-red-600' : 'bg-teal-50 text-teal-700'}>
                  {s.Name}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-ink-500">No skills listed.</span>
            )}
          </div>
        </Card>

        <Card>
          <p className="text-ink-500 text-sm mb-3 flex items-center gap-1.5"><GraduationCap size={14} /> Education</p>
          {candidate.education.length ? (
            <div className="space-y-3">
              {candidate.education.map((e) => (
                <div key={e.Id}>
                  <p className="text-sm font-medium text-ink-900">{e.Degree}{e.FieldOfStudy ? ` — ${e.FieldOfStudy}` : ''}</p>
                  <p className="text-xs text-ink-500">{e.Institution}</p>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-sm text-ink-500">None listed.</span>
          )}
        </Card>

        <Card>
          <p className="text-ink-500 text-sm mb-3 flex items-center gap-1.5"><Briefcase size={14} /> Experience</p>
          {candidate.experience.length ? (
            <div className="space-y-3">
              {candidate.experience.map((e) => (
                <div key={e.Id}>
                  <p className="text-sm font-medium text-ink-900">{e.JobTitle}</p>
                  <p className="text-xs text-ink-500">{e.CompanyName}</p>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-sm text-ink-500">None listed.</span>
          )}
        </Card>

        <Card>
          <p className="text-ink-500 text-sm mb-3 flex items-center gap-1.5"><Award size={14} /> Certifications</p>
          <div className="flex flex-wrap gap-2">
            {candidate.certifications.length ? (
              candidate.certifications.map((c) => <Badge key={c.CertificationId} className="bg-primary-50 text-primary-700">{c.Name}</Badge>)
            ) : (
              <span className="text-sm text-ink-500">None listed.</span>
            )}
          </div>
        </Card>

        <Card>
          <p className="text-ink-500 text-sm mb-3 flex items-center gap-1.5"><FolderGit2 size={14} /> Projects</p>
          {candidate.projects.length ? (
            <div className="space-y-3">
              {candidate.projects.map((p) => (
                <div key={p.Id}>
                  <p className="text-sm font-medium text-ink-900">{p.Title}</p>
                  {p.Description && <p className="text-xs text-ink-500">{p.Description}</p>}
                </div>
              ))}
            </div>
          ) : (
            <span className="text-sm text-ink-500">None listed.</span>
          )}
        </Card>

        <Card>
          <p className="text-ink-500 text-sm mb-3 flex items-center gap-1.5"><Globe2 size={14} /> Languages</p>
          <div className="flex flex-wrap gap-2">
            {candidate.languages.length ? (
              candidate.languages.map((l) => <Badge key={l.LanguageId} className="bg-slate-100 text-ink-700">{l.Name}</Badge>)
            ) : (
              <span className="text-sm text-ink-500">None listed.</span>
            )}
          </div>
        </Card>
      </div>

      {applicationId ? (
        <div>
          {statusUpdateError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-3">
              <AlertCircle size={16} /> {statusUpdateError}
            </div>
          )}
          <div className="flex gap-3">
            <Button onClick={() => handleStatusChange('Interview')} disabled={isUpdatingStatus}>Move to Interview</Button>
            <Button variant="outline" onClick={() => handleStatusChange('Rejected')} disabled={isUpdatingStatus}>Reject Candidate</Button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-ink-500">
          Open this page from the Candidates list to change this person's application status.
        </p>
      )}
    </div>
  );
}
