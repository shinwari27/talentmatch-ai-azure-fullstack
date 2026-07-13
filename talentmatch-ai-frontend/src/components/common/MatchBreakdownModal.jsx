import React from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import Modal from './Modal';
import Badge from './Badge';
import ProgressBar from './ProgressBar';

const CATEGORY_LABELS = {
  skills: 'Skills',
  experience: 'Experience',
  education: 'Education',
  certifications: 'Certifications',
  projects: 'Projects',
  languages: 'Languages',
};

const ALL_CATEGORIES = ['skills', 'experience', 'education', 'certifications', 'projects', 'languages'];

/**
 * Shows exactly why a match score is what it is — the per-category
 * breakdown, which categories didn't apply (and why that's not a bug),
 * and a plain-language matched/missing reasons list. This is the
 * transparency layer for the whole matching engine; without it, a score
 * like "17%" looks arbitrary even though the calculation behind it is
 * fully explainable.
 */
export default function MatchBreakdownModal({ open, onClose, breakdown, jobTitle }) {
  if (!breakdown) return null;

  const scoredCategories = new Set(breakdown.breakdown?.map((b) => b.category) || []);
  const skippedCategories = ALL_CATEGORIES.filter((c) => !scoredCategories.has(c));

  return (
    <Modal open={open} onClose={onClose} title={`Match Breakdown${jobTitle ? ` — ${jobTitle}` : ''}`}>
      <div className="space-y-5">
        <div className="text-center py-2">
          <p className="font-display text-3xl font-bold text-primary-600">{breakdown.overallScore}%</p>
          <p className="text-sm text-ink-500">Overall Match</p>
        </div>

        <div className="space-y-3">
          {breakdown.breakdown?.map((cat) => (
            <div key={cat.category}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium text-ink-900">{CATEGORY_LABELS[cat.category]}</span>
                <span className="text-ink-500">{cat.score}% · weighted {cat.weightPercent}%</span>
              </div>
              <ProgressBar value={cat.score} />
            </div>
          ))}
        </div>

        {skippedCategories.length > 0 && (
          <div className="flex items-start gap-2 bg-slate-50 rounded-lg px-3 py-2.5 text-xs text-ink-500">
            <Info size={14} className="mt-0.5 shrink-0" />
            <span>
              <strong className="text-ink-700">Not scored:</strong> {skippedCategories.map((c) => CATEGORY_LABELS[c]).join(', ')}.
              This job didn't specify a requirement for these, so they're excluded rather than counted as a failing score —
              the remaining categories' weights scale up to fill the difference.
            </span>
          </div>
        )}

        {breakdown.reasons?.length > 0 && (
          <div>
            <p className="text-sm font-medium text-ink-900 mb-2">Why this score</p>
            <div className="flex flex-wrap gap-2">
              {breakdown.reasons.map((r, i) => (
                <Badge
                  key={i}
                  className={`flex items-center gap-1 ${r.met ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-600'}`}
                >
                  {r.met ? <CheckCircle2 size={12} /> : <XCircle size={12} />} {r.label}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
