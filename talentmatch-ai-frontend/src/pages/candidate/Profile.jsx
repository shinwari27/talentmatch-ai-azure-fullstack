import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import FormField from '../../components/forms/FormField';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SimpleEntryList from '../../components/profile/SimpleEntryList';
import CertificationManager from '../../components/profile/CertificationManager';
import TagManager from '../../components/profile/TagManager';
import { getMyProfile, updateMyProfile } from '../../services/profileApi';
import { educationApi, experienceApi, projectApi } from '../../services/candidateDetailsApi';
import { skillsApi, languagesApi } from '../../services/skillsLanguagesApi';
import { getInitials } from '../../utils/formatters';

const tabs = ['Personal', 'Education', 'Experience', 'Skills', 'Projects', 'Certifications', 'Languages'];

export default function Profile() {
  const [tab, setTab] = useState('Personal');
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ fullName: '', title: '', location: '', phone: '', linkedInUrl: '', githubUrl: '', bio: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getMyProfile()
      .then((p) => {
        setProfile(p);
        setForm({ fullName: p.FullName, title: p.Title || '', location: p.Location || '', phone: p.Phone || '', linkedInUrl: p.LinkedInUrl || '', githubUrl: p.GithubUrl || '', bio: p.Bio || '' });
      })
      .catch((err) => setError(err.message || 'Could not load your profile.'))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSaved(false);
    try {
      const updated = await updateMyProfile(form);
      setProfile(updated);
      setSaved(true);
    } catch (err) {
      setError(err.message || 'Could not save your changes.');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <LoadingSpinner label="Loading your profile…" />;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary-600 text-white flex items-center justify-center text-xl font-semibold">
          {getInitials(profile?.FullName)}
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-ink-900">{profile?.FullName}</h2>
          <p className="text-sm text-ink-500">{profile?.Title || 'No title set'} · {profile?.Location || 'No location set'}</p>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-slate-100 pb-px">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === t ? 'border-primary-600 text-primary-700' : 'border-transparent text-ink-500 hover:text-ink-900'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <Card>
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-5">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {tab === 'Personal' && (
          <form onSubmit={handleSave} className="grid sm:grid-cols-2 gap-5">
            <FormField label="Full Name" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
            <FormField label="Email" type="email" value={profile?.Email || ''} disabled />
            <FormField label="Location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
            <FormField label="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+1 416-555-0142" />
            <FormField label="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            <FormField label="LinkedIn URL" value={form.linkedInUrl} onChange={(e) => setForm((f) => ({ ...f, linkedInUrl: e.target.value }))} placeholder="https://linkedin.com/in/…" />
            <FormField label="GitHub URL" value={form.githubUrl} onChange={(e) => setForm((f) => ({ ...f, githubUrl: e.target.value }))} placeholder="https://github.com/…" />
            <FormField label="Bio" as="textarea" className="sm:col-span-2" value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} placeholder="Tell recruiters a bit about yourself…" />
            <div className="sm:col-span-2 flex items-center gap-3">
              <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving…' : 'Save Changes'}</Button>
              {saved && <span className="text-sm text-teal-600">Saved.</span>}
            </div>
          </form>
        )}

        {tab === 'Education' && (
          <SimpleEntryList
            api={educationApi}
            addLabel="+ Add Education"
            emptyText="No education entries yet."
            fields={[
              { key: 'Institution', label: 'Institution', placeholder: 'George Brown College' },
              { key: 'Degree', label: 'Degree', placeholder: 'Postgraduate Certificate' },
              { key: 'FieldOfStudy', label: 'Field of Study', placeholder: 'Cloud Computing' },
              { key: 'StartDate', label: 'Start Date', type: 'date' },
              { key: 'EndDate', label: 'End Date', type: 'date' },
            ]}
            renderSummary={(item) => (
              <>
                <p className="font-medium text-ink-900">{item.Degree}{item.FieldOfStudy ? ` — ${item.FieldOfStudy}` : ''}</p>
                <p className="text-sm text-ink-500">{item.Institution}</p>
              </>
            )}
          />
        )}

        {tab === 'Experience' && (
          <SimpleEntryList
            api={experienceApi}
            addLabel="+ Add Experience"
            emptyText="No experience entries yet."
            fields={[
              { key: 'JobTitle', label: 'Job Title', placeholder: 'Frontend Developer' },
              { key: 'CompanyName', label: 'Company', placeholder: 'ProTech IT Solutions' },
              { key: 'StartDate', label: 'Start Date', type: 'date' },
              { key: 'EndDate', label: 'End Date', type: 'date' },
              { key: 'Description', label: 'Description', as: 'textarea', placeholder: 'What did you work on?' },
            ]}
            renderSummary={(item) => (
              <>
                <p className="font-medium text-ink-900">{item.JobTitle}</p>
                <p className="text-sm text-ink-500">{item.CompanyName}</p>
                {item.Description && <p className="text-sm text-ink-700 mt-1">{item.Description}</p>}
              </>
            )}
          />
        )}

        {tab === 'Skills' && (
          <TagManager api={skillsApi} idKey="SkillId" nameKey="Name" badgeClassName="bg-primary-50 text-primary-700" placeholder="e.g. React" />
        )}

        {tab === 'Projects' && (
          <SimpleEntryList
            api={projectApi}
            addLabel="+ Add Project"
            emptyText="No projects added yet."
            fields={[
              { key: 'Title', label: 'Title', placeholder: 'Multi-Tier E-Commerce Web Application' },
              { key: 'Description', label: 'Description', as: 'textarea', placeholder: 'What did you build?' },
              { key: 'Url', label: 'URL', placeholder: 'https://github.com/…' },
            ]}
            renderSummary={(item) => (
              <>
                <p className="font-medium text-ink-900">{item.Title}</p>
                {item.Description && <p className="text-sm text-ink-500">{item.Description}</p>}
              </>
            )}
          />
        )}

        {tab === 'Certifications' && <CertificationManager />}

        {tab === 'Languages' && (
          <TagManager api={languagesApi} idKey="LanguageId" nameKey="Name" badgeClassName="bg-slate-100 text-ink-700" placeholder="e.g. Pashto" />
        )}
      </Card>
    </div>
  );
}
