import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, AlertCircle, Info } from 'lucide-react';
import Card from '../../components/common/Card';
import FileUpload from '../../components/common/FileUpload';
import Button from '../../components/common/Button';
import ProgressBar from '../../components/common/ProgressBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import MatchRing from '../../components/common/MatchRing';
import { uploadResume } from '../../services/resumeApi';
import { getMyProfile } from '../../services/profileApi';

function ConfidenceBadge({ label, confidenceLabel, className }) {
  return (
    <Badge className={className}>
      {label}{confidenceLabel ? ` · ${confidenceLabel}` : ''}
    </Badge>
  );
}

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | processing | done
  const [error, setError] = useState('');
  const [resumeScore, setResumeScore] = useState(null);
  const [summary, setSummary] = useState(null);
  const [parsingNote, setParsingNote] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    getMyProfile()
      .then((p) => {
        if (p.ResumeScore != null) {
          setResumeScore(p.ResumeScore);
          setStatus('done');
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingProfile(false));
  }, []);

  async function handleUpload() {
    setStatus('processing');
    setError('');
    try {
      const result = await uploadResume(file);
      setResumeScore(result.resumeScore);
      setSummary(result.extractedSummary);
      setParsingNote(result.parsingError || '');
      setStatus('done');
    } catch (err) {
      setError(err.message || 'Could not upload your resume.');
      setStatus('idle');
    }
  }

  if (isLoadingProfile) return <LoadingSpinner label="Loading…" />;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-900">Resume</h2>
        <p className="text-sm text-ink-500 mt-1">Upload your resume so we can score it and match you to relevant jobs.</p>
      </div>

      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg px-4 py-3 text-sm">
        <Info size={16} className="mt-0.5 shrink-0" />
        Resume text is extracted with Azure AI Document Intelligence, then matched against skill/certification/language
        dictionaries and pattern-matched for education and experience — not a resume-understanding AI model.
        Dictionary matches (skills, certifications, languages) show a flat confidence since a match is simply
        found-or-not; Education and Experience show genuinely variable confidence based on how much structure
        was detected. <strong>High-confidence Education and Experience entries are verified automatically</strong> —
        lower-confidence ones are marked "Pending Review" so you can check them before they count toward your match score.
      </div>

      <Card>
        <FileUpload file={file} onFileSelected={(f) => { setFile(f); setError(''); }} />

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mt-4">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {file && status !== 'processing' && (
          <div className="mt-5 flex items-center justify-between">
            <p className="text-sm text-ink-500">{(file.size / 1024).toFixed(0)} KB · Ready to upload</p>
            <Button onClick={handleUpload}>Upload Resume</Button>
          </div>
        )}
        {status === 'processing' && (
          <div className="mt-5">
            <p className="text-sm text-ink-500 mb-2 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" /> Uploading and analyzing…
            </p>
            <ProgressBar value={70} />
          </div>
        )}
      </Card>

      {status === 'done' && resumeScore != null && (
        <Card>
          <div className="flex items-center gap-2 text-teal-700 mb-5">
            <CheckCircle2 size={18} />
            <p className="font-medium text-sm">Resume uploaded successfully.</p>
          </div>

          <div className="flex items-center gap-6 mb-6 pb-6 border-b border-slate-100">
            <MatchRing score={resumeScore} size={80} strokeWidth={6} />
            <div>
              <p className="font-display font-semibold text-ink-900">Completeness Score: {resumeScore}%</p>
              <p className="text-sm text-ink-500">
                Reflects how much structured information we could confidently pull out — not a measure of how
                strong a candidate you are.
              </p>
            </div>
          </div>

          {parsingNote && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg px-4 py-3 text-sm mb-5">
              <AlertCircle size={16} /> {parsingNote}
            </div>
          )}

          {summary && (
            <div className="grid sm:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-ink-500 mb-2">Contact Info Found</p>
                <div className="flex flex-wrap gap-2">
                  <Badge className={summary.emailFound ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-ink-500'}>Email {summary.emailFound ? '✓' : '✗'}</Badge>
                  <Badge className={summary.phoneFound ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-ink-500'}>Phone {summary.phoneFound ? '✓' : '✗'}</Badge>
                  <Badge className={summary.linkedInFound ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-ink-500'}>LinkedIn {summary.linkedInFound ? '✓' : '✗'}</Badge>
                  <Badge className={summary.githubFound ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-ink-500'}>GitHub {summary.githubFound ? '✓' : '✗'}</Badge>
                </div>
              </div>

              <div>
                <p className="text-ink-500 mb-2">Skills Added</p>
                <div className="flex flex-wrap gap-2">
                  {summary.skillsAdded.length ? (
                    summary.skillsAdded.map((s) => <ConfidenceBadge key={s.name} label={s.name} confidenceLabel={s.confidenceLabel} className="bg-primary-50 text-primary-700" />)
                  ) : <span className="text-ink-500">None detected</span>}
                </div>
              </div>

              <div>
                <p className="text-ink-500 mb-2">Certifications Added</p>
                <div className="flex flex-wrap gap-2">
                  {summary.certificationsAdded.length ? (
                    summary.certificationsAdded.map((c) => <ConfidenceBadge key={c.name} label={c.name} confidenceLabel={c.confidenceLabel} className="bg-teal-50 text-teal-700" />)
                  ) : <span className="text-ink-500">None detected</span>}
                </div>
              </div>

              <div>
                <p className="text-ink-500 mb-2">Languages Added</p>
                <div className="flex flex-wrap gap-2">
                  {summary.languagesAdded.length ? (
                    summary.languagesAdded.map((l) => <ConfidenceBadge key={l.name} label={l.name} confidenceLabel={l.confidenceLabel} className="bg-slate-100 text-ink-700" />)
                  ) : <span className="text-ink-500">None detected</span>}
                </div>
              </div>

              {summary.educationAdded.length > 0 && (
                <div className="sm:col-span-2">
                  <p className="text-ink-500 mb-2">Education Added</p>
                  <div className="flex flex-wrap gap-2">
                    {summary.educationAdded.map((e) => (
                      <ConfidenceBadge
                        key={e.degree}
                        label={`${e.degree} — ${e.institution || 'institution not detected'}${e.autoVerified ? ' ✓' : ' (Pending Review)'}`}
                        confidenceLabel={e.confidenceLabel}
                        className={e.autoVerified ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'}
                      />
                    ))}
                  </div>
                </div>
              )}

              {summary.experienceAdded.length > 0 && (
                <div className="sm:col-span-2">
                  <p className="text-ink-500 mb-2">Experience Added</p>
                  <div className="flex flex-wrap gap-2">
                    {summary.experienceAdded.map((e) => (
                      <ConfidenceBadge
                        key={`${e.jobTitle}-${e.companyName}`}
                        label={`${e.jobTitle} at ${e.companyName}${e.autoVerified ? ' ✓' : ' (Pending Review)'}`}
                        confidenceLabel={e.confidenceLabel}
                        className={e.autoVerified ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'}
                      />
                    ))}
                  </div>
                </div>
              )}

              {summary.projectsAdded?.length > 0 && (
                <div className="sm:col-span-2">
                  <p className="text-ink-500 mb-2">Projects Added</p>
                  <div className="flex flex-wrap gap-2">
                    {summary.projectsAdded.map((p) => <Badge key={p.title} className="bg-primary-50 text-primary-700">{p.title}</Badge>)}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
