import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import FormField from '../../components/forms/FormField';
import Button from '../../components/common/Button';
import Breadcrumb from '../../components/common/Breadcrumb';
import Toast from '../../components/common/Toast';
import { createJob } from '../../services/jobsApi';

const initialForm = {
  title: '',
  companyName: '',
  location: '',
  employmentType: 'Full-time',
  salaryMin: '',
  salaryMax: '',
  experienceRequired: '',
  educationRequirement: '',
  category: '',
  skillsText: '',
  description: '',
  benefitsText: '',
};

export default function CreateJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submitJob(status) {
    setError('');
    if (!form.title || !form.companyName || !form.location || !form.description) {
      setError('Job title, company, location, and description are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createJob({
        title: form.title,
        companyName: form.companyName,
        location: form.location,
        employmentType: form.employmentType,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
        experienceRequired: form.experienceRequired || null,
        educationRequirement: form.educationRequirement || null,
        category: form.category || null,
        description: form.description,
        skills: form.skillsText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        benefits: form.benefitsText
          .split('\n')
          .map((b) => b.trim())
          .filter(Boolean),
        status,
      });
      setShowToast(true);
      setTimeout(() => navigate('/recruiter/jobs'), 900);
    } catch (err) {
      setError(err.message || 'Could not create this job posting.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <Breadcrumb items={[{ label: 'Jobs', to: '/recruiter/jobs' }, { label: 'Create Job' }]} />
      <h2 className="font-display text-xl font-semibold text-ink-900 mb-6">Create a New Job Posting</h2>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-5">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <Card>
        <form onSubmit={(e) => e.preventDefault()} className="grid sm:grid-cols-2 gap-5">
          <FormField label="Job Title" value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Senior Frontend Developer" required />
          <FormField label="Company" value={form.companyName} onChange={(e) => update('companyName', e.target.value)} placeholder="Your company name" required />
          <FormField label="Location" value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="Toronto, ON" required />
          <FormField label="Employment Type" as="select" value={form.employmentType} onChange={(e) => update('employmentType', e.target.value)} options={['Full-time', 'Part-time', 'Contract', 'Internship']} />
          <FormField label="Minimum Salary" type="number" value={form.salaryMin} onChange={(e) => update('salaryMin', e.target.value)} placeholder="90000" />
          <FormField label="Maximum Salary" type="number" value={form.salaryMax} onChange={(e) => update('salaryMax', e.target.value)} placeholder="110000" />
          <FormField label="Experience Required" value={form.experienceRequired} onChange={(e) => update('experienceRequired', e.target.value)} placeholder="3-5 yrs" />
          <FormField label="Category" value={form.category} onChange={(e) => update('category', e.target.value)} placeholder="Engineering" />
          <FormField label="Education Requirement" value={form.educationRequirement} onChange={(e) => update('educationRequirement', e.target.value)} placeholder="Bachelor's in Computer Science" className="sm:col-span-2" />
          <FormField label="Required Skills" value={form.skillsText} onChange={(e) => update('skillsText', e.target.value)} placeholder="React, TypeScript, REST APIs (comma-separated)" className="sm:col-span-2" />
          <FormField label="Job Description" as="textarea" value={form.description} onChange={(e) => update('description', e.target.value)} className="sm:col-span-2" placeholder="Describe the role, team, and expectations…" required />
          <FormField label="Benefits" as="textarea" value={form.benefitsText} onChange={(e) => update('benefitsText', e.target.value)} className="sm:col-span-2" placeholder={'One per line:\nHealth benefits\nRemote flexibility\nLearning budget'} />
          <div className="sm:col-span-2 flex gap-3">
            <Button type="button" onClick={() => submitJob('Open')} disabled={isSubmitting}>
              {isSubmitting ? 'Publishing…' : 'Publish Job'}
            </Button>
            <Button type="button" variant="outline" onClick={() => submitJob('Draft')} disabled={isSubmitting}>
              Save as Draft
            </Button>
          </div>
        </form>
      </Card>

      {showToast && <Toast message="Job posting created." onClose={() => setShowToast(false)} />}
    </div>
  );
}
