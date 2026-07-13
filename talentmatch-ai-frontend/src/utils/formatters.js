export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatSalaryRange(min, max) {
  const fmt = (n) => `$${Number(n).toLocaleString()}`;
  if (min != null && max != null) return `${fmt(min)} - ${fmt(max)}`;
  if (min != null) return `${fmt(min)}+`;
  if (max != null) return `Up to ${fmt(max)}`;
  return 'Not specified';
}

export function confidenceLabel(score) {
  if (score == null) return null;
  if (score >= 80) return 'High';
  if (score >= 50) return 'Medium';
  return 'Low';
}

export function scoreColor(score) {
  if (score >= 85) return { ring: '#2563EB', text: 'text-primary-600', bg: 'bg-primary-50' };
  if (score >= 70) return { ring: '#14B8A6', text: 'text-teal-600', bg: 'bg-teal-50' };
  if (score >= 50) return { ring: '#F59E0B', text: 'text-amber-600', bg: 'bg-amber-50' };
  return { ring: '#DC2626', text: 'text-red-600', bg: 'bg-red-50' };
}

export function statusBadgeStyle(status) {
  const map = {
    Applied: 'bg-slate-100 text-ink-700',
    'Under Review': 'bg-amber-50 text-amber-700',
    Interview: 'bg-primary-50 text-primary-700',
    Offer: 'bg-teal-50 text-teal-700',
    Rejected: 'bg-red-50 text-red-700',
    Open: 'bg-teal-50 text-teal-700',
    Closed: 'bg-slate-100 text-ink-500',
    Active: 'bg-teal-50 text-teal-700',
    Suspended: 'bg-red-50 text-red-700',
  };
  return map[status] || 'bg-slate-100 text-ink-700';
}
