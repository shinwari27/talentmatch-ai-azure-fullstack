import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import Card from '../common/Card';
import FormField from '../forms/FormField';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { getMyProfile, updateMyProfile, changePassword } from '../../services/profileApi';

const tabs = ['Profile', 'Password', 'Preferences', 'Notifications'];

export default function SettingsPanel() {
  const { user } = useAuth();
  const [tab, setTab] = useState('Profile');

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const isRecruiter = user?.role?.toLowerCase() === 'recruiter';

  useEffect(() => {
    getMyProfile()
      .then((p) => {
        setProfile(p);
        setForm(
          isRecruiter
            ? { fullName: p.FullName, companyName: p.CompanyName || '' }
            : { fullName: p.FullName, title: p.Title || '', location: p.Location || '', bio: p.Bio || '' }
        );
      })
      .catch((err) => setError(err.message || 'Could not load your profile.'))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSaveProfile(e) {
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

  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSaved(false);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (passwordForm.newPassword.length < 8 || !/\d/.test(passwordForm.newPassword)) {
      setPasswordError('New password must be at least 8 characters and include a number.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordSaved(true);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.message || 'Could not update your password.');
    } finally {
      setIsChangingPassword(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-900">Settings</h2>
        <p className="text-sm text-ink-500 mt-1">Manage your account profile, security, and preferences.</p>
      </div>

      <div className="flex gap-1 border-b border-slate-100 pb-px overflow-x-auto">
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
        {tab === 'Profile' && (
          isLoading ? <LoadingSpinner label="Loading…" /> : (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  <AlertCircle size={16} /> {error}
                </div>
              )}
              <FormField label="Full Name" value={form.fullName || ''} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
              <FormField label="Email" type="email" value={profile?.Email || ''} disabled />
              {isRecruiter ? (
                <FormField label="Company Name" value={form.companyName || ''} onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))} />
              ) : (
                <>
                  <FormField label="Title" value={form.title || ''} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
                  <FormField label="Location" value={form.location || ''} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
                </>
              )}
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving…' : 'Save Changes'}</Button>
                {saved && <span className="text-sm text-teal-600">Saved.</span>}
              </div>
            </form>
          )
        )}

        {tab === 'Password' && (
          <form onSubmit={handleChangePassword} className="space-y-5">
            {passwordError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                <AlertCircle size={16} /> {passwordError}
              </div>
            )}
            <FormField
              label="Current Password" type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
            />
            <FormField
              label="New Password" type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
            />
            <FormField
              label="Confirm New Password" type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
            />
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={isChangingPassword}>{isChangingPassword ? 'Updating…' : 'Update Password'}</Button>
              {passwordSaved && <span className="text-sm text-teal-600">Password updated.</span>}
            </div>
          </form>
        )}

        {tab === 'Preferences' && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg px-4 py-3 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              These preferences are display-only for now — there's no backend storage for them yet.
            </div>
            <FormField label="Theme" as="select" options={['Light', 'Dark', 'System']} />
            <FormField label="Language" as="select" options={['English', 'French', 'Pashto', 'Urdu']} />
            <Button disabled>Save Preferences</Button>
          </div>
        )}

        {tab === 'Notifications' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg px-4 py-3 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              These toggles are display-only for now — there's no backend storage for them yet.
            </div>
            {['Email notifications', 'Application status updates', 'New job matches', 'Weekly summary'].map((n) => (
              <label key={n} className="flex items-center justify-between py-2">
                <span className="text-sm text-ink-700">{n}</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-ink-300" />
              </label>
            ))}
            <Button disabled>Save Preferences</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
