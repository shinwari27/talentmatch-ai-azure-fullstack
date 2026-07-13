import React, { useState } from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import SearchBar from '../../components/common/SearchBar';
import DataTable from '../../components/tables/DataTable';
import { jobs } from '../../constants/mockData';
import { statusBadgeStyle } from '../../utils/formatters';

export default function AdminJobs() {
  const [query, setQuery] = useState('');
  const filtered = jobs.filter((j) => `${j.title} ${j.company}`.toLowerCase().includes(query.toLowerCase()));

  const columns = [
    { key: 'title', header: 'Job Title', render: (r) => <span className="font-medium text-ink-900">{r.title}</span> },
    { key: 'company', header: 'Company' },
    { key: 'location', header: 'Location' },
    { key: 'applicants', header: 'Applicants' },
    { key: 'status', header: 'Status', render: (r) => <Badge className={statusBadgeStyle(r.status)}>{r.status}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-900">Jobs</h2>
        <p className="text-sm text-ink-500 mt-1">All job postings across the platform.</p>
      </div>

      <Card padding="p-0">
        <div className="p-5 border-b border-slate-100">
          <SearchBar value={query} onChange={setQuery} placeholder="Search jobs or companies…" className="max-w-sm" />
        </div>
        <div className="p-2">
          <DataTable columns={columns} data={filtered} />
        </div>
      </Card>
    </div>
  );
}
