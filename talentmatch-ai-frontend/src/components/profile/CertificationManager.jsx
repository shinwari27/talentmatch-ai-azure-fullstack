import React, { useEffect, useState } from 'react';
import { X, AlertCircle, Plus } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import FormField from '../forms/FormField';
import LoadingSpinner from '../common/LoadingSpinner';
import { certificationsApi } from '../../services/skillsLanguagesApi';

/**
 * Certifications sit between Skills (a pure tag against a master list) and
 * Education (a full record with its own fields) — normalized against a
 * shared CertificationsCatalog like Skills, but candidates can optionally
 * attach an issuer and dates, which Skills don't need. Neither TagManager
 * nor SimpleEntryList fit this shape cleanly, so this is its own component.
 */
export default function CertificationManager() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', issuedBy: '', issueDate: '', expiryDate: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    certificationsApi
      .list()
      .then(setItems)
      .catch((err) => setError(err.message || 'Could not load certifications.'))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setIsSaving(true);
    setError('');
    try {
      await certificationsApi.add(form.name, {
        issuedBy: form.issuedBy || undefined,
        issueDate: form.issueDate || undefined,
        expiryDate: form.expiryDate || undefined,
      });
      const refreshed = await certificationsApi.list();
      setItems(refreshed);
      setForm({ name: '', issuedBy: '', issueDate: '', expiryDate: '' });
      setShowForm(false);
    } catch (err) {
      setError(err.message || 'Could not add this certification.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRemove(certificationId) {
    try {
      await certificationsApi.remove(certificationId);
      setItems(items.filter((i) => i.CertificationId !== certificationId));
    } catch (err) {
      setError(err.message || 'Could not remove this certification.');
    }
  }

  if (isLoading) return <LoadingSpinner label="Loading…" />;

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {items.map((cert) => (
          <Badge key={cert.CertificationId} className="bg-teal-50 text-teal-700 flex items-center gap-1.5">
            {cert.Name}{cert.IssuedBy ? ` — ${cert.IssuedBy}` : ''}
            <button onClick={() => handleRemove(cert.CertificationId)} aria-label={`Remove ${cert.Name}`}>
              <X size={12} />
            </button>
          </Badge>
        ))}
        {items.length === 0 && !showForm && <span className="text-sm text-ink-500">None added yet.</span>}
      </div>

      {showForm ? (
        <form onSubmit={handleAdd} className="p-4 rounded-xl border border-primary-200 bg-primary-50/30 space-y-3 max-w-sm">
          <FormField label="Certification Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="AZ-104" required />
          <FormField label="Issued By" value={form.issuedBy} onChange={(e) => setForm((f) => ({ ...f, issuedBy: e.target.value }))} placeholder="Microsoft" />
          <FormField label="Issue Date" type="date" value={form.issueDate} onChange={(e) => setForm((f) => ({ ...f, issueDate: e.target.value }))} />
          <FormField label="Expiry Date" type="date" value={form.expiryDate} onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))} />
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isSaving}>{isSaving ? 'Saving…' : 'Save'}</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" size="sm" icon={Plus} onClick={() => setShowForm(true)}>Add Certification</Button>
      )}
    </div>
  );
}
