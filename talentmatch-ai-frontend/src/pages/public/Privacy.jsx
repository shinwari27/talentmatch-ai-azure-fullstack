import React from 'react';

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20 prose-slate">
      <h1 className="font-display text-3xl font-bold text-ink-900 mb-6">Privacy Policy</h1>
      <p className="text-ink-500 mb-4 text-sm">Last updated: July 2026</p>
      <div className="space-y-6 text-ink-700 leading-relaxed text-sm">
        <p>TalentMatch AI collects resume data, profile information, and application activity solely to provide
        AI-powered matching and recruitment features. Data is stored securely on Microsoft Azure infrastructure
        with encryption at rest and in transit.</p>
        <h2 className="font-display font-semibold text-lg text-ink-900 pt-4">Information We Collect</h2>
        <p>Account details, uploaded resumes, extracted skills/education/experience data, and application history.</p>
        <h2 className="font-display font-semibold text-lg text-ink-900 pt-4">How We Use Your Data</h2>
        <p>To calculate match scores, present relevant job or candidate recommendations, and provide dashboard analytics
        to recruiters and administrators.</p>
        <h2 className="font-display font-semibold text-lg text-ink-900 pt-4">Your Rights</h2>
        <p>You may request access to, correction of, or deletion of your personal data at any time from your account settings.</p>
      </div>
    </div>
  );
}
