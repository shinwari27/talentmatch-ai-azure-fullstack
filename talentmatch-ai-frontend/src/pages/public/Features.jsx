import React from 'react';
import { ScanSearch, Gauge, BarChart3, ShieldCheck, Bell, FileText, Users, Briefcase } from 'lucide-react';
import Card from '../../components/common/Card';

const groups = [
  {
    title: 'For Candidates',
    items: [
      { icon: FileText, title: 'Resume Upload & Scoring', desc: 'Upload a PDF or DOCX resume and get an instant AI-generated resume score.' },
      { icon: ScanSearch, title: 'Smart Job Recommendations', desc: 'See jobs ranked by how well your profile fits, not just keyword matches.' },
      { icon: Bell, title: 'Application Tracking', desc: 'Follow every application\u2019s status from submitted to interview to offer.' },
    ],
  },
  {
    title: 'For Recruiters',
    items: [
      { icon: Briefcase, title: 'Job Management', desc: 'Create, edit, and close job postings with structured requirement fields.' },
      { icon: Users, title: 'Ranked Candidate Lists', desc: 'Every applicant is scored and ranked automatically against the job requirements.' },
      { icon: BarChart3, title: 'Recruiter Analytics', desc: 'Visualize application trends, skill gaps, and hiring funnel performance.' },
    ],
  },
  {
    title: 'For Administrators',
    items: [
      { icon: ShieldCheck, title: 'Role-Based Access Control', desc: 'Manage users, recruiters, and permissions from a single console.' },
      { icon: Gauge, title: 'System Monitoring', desc: 'Track platform health, storage usage, and audit logs in real time.' },
    ],
  },
];

export default function Features() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="font-display text-4xl font-bold text-ink-900 mb-5">Every feature, built around one goal</h1>
        <p className="text-ink-500 text-lg">Getting the right candidate in front of the right recruiter, faster.</p>
      </div>

      <div className="space-y-16">
        {groups.map((g) => (
          <div key={g.title}>
            <h2 className="font-display text-xl font-semibold text-ink-900 mb-6">{g.title}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {g.items.map((f) => (
                <Card key={f.title} hoverable>
                  <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
                    <f.icon size={20} />
                  </div>
                  <h3 className="font-display font-semibold text-ink-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-ink-500 leading-relaxed">{f.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
