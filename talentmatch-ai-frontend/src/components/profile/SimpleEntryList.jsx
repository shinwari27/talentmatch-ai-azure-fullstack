import React, { useEffect, useState } from 'react';
import { Trash2, AlertCircle, ShieldCheck, ShieldQuestion } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import FormField from '../forms/FormField';
import LoadingSpinner from '../common/LoadingSpinner';
import { confidenceLabel } from '../../utils/formatters';

/**
 * One component drives all four candidate sub-resource tabs (Education,
 * Experience, Certifications, Projects). Education and Experience can also
 * carry a VerificationStatus + ConfidenceScore (set when a row was created
 * by resume parsing rather than typed by hand) — when present, this shows
 * a "Pending Review" badge and a Verify button; manually-entered rows have
 * no ConfidenceScore and just show as normal.
 */
export default function SimpleEntryList({ api, fields, renderSummary, addLabel, emptyText }) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    api
      .list()
      .then(setItems)
      .catch((err) => setError(err.message || 'Could not load this section.'))
      .finally(() => setIsLoading(false));
  }, [api]);

  async function handleAdd(e) {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      const created = await api.create(formData);
      setItems([created, ...items]);
      setFormData({});
      setShowForm(false);
    } catch (err) {
      setError(err.message || 'Could not save this entry.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.remove(id);
      setItems(items.filter((i) => i.Id !== id));
    } catch (err) {
      setError(err.message || 'Could not delete this entry.');
    }
  }

  async function handleVerify(id) {
    try {
      const updated = await api.verify(id);
      setItems(items.map((i) => (i.Id === id ? updated : i)));
    } catch (err) {
      setError(err.message || 'Could not verify this entry.');
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

      {items.length === 0 && !showForm && (
        <p className="text-sm text-ink-500">{emptyText}</p>
      )}

      {items.map((item) => (
        <div key={item.Id} className="p-4 rounded-xl border border-slate-100 flex items-start justify-between gap-3">
          <div className="flex-1">
            {renderSummary(item)}
            {item.VerificationStatus === 'Pending' && (
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-amber-50 text-amber-700 flex items-center gap-1">
                  <ShieldQuestion size={12} /> Pending Review
                  {item.ConfidenceScore != null ? ` · ${confidenceLabel(item.ConfidenceScore)} confidence` : ''}
                </Badge>
                <button
                  onClick={() => handleVerify(item.Id)}
                  className="text-xs text-teal-600 font-medium hover:underline flex items-center gap-1"
                >
                  <ShieldCheck size={12} /> Mark as Verified
                </button>
              </div>
            )}
          </div>
          <button onClick={() => handleDelete(item.Id)} className="text-ink-500 hover:text-red-600 shrink-0" aria-label="Delete entry">
            <Trash2 size={16} />
          </button>
        </div>
      ))}

      {showForm ? (
        <form onSubmit={handleAdd} className="p-4 rounded-xl border border-primary-200 bg-primary-50/30 space-y-3">
          {fields.map((f) => (
            <FormField
              key={f.key}
              label={f.label}
              type={f.type || 'text'}
              as={f.as}
              placeholder={f.placeholder}
              value={formData[f.key] || ''}
              onChange={(e) => setFormData((d) => ({ ...d, [f.key]: e.target.value }))}
            />
          ))}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isSaving}>{isSaving ? 'Saving…' : 'Save'}</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>{addLabel}</Button>
      )}
    </div>
  );
}
