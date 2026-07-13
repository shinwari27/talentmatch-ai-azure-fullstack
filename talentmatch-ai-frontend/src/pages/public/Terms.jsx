import React from 'react';

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="font-display text-3xl font-bold text-ink-900 mb-6">Terms of Service</h1>
      <p className="text-ink-500 mb-4 text-sm">Last updated: July 2026</p>
      <div className="space-y-6 text-ink-700 leading-relaxed text-sm">
        <p>By creating an account on TalentMatch AI, you agree to use the platform for lawful recruitment and job-seeking
        purposes only.</p>
        <h2 className="font-display font-semibold text-lg text-ink-900 pt-4">Account Responsibilities</h2>
        <p>Users are responsible for the accuracy of the information and documents they submit, including resumes and
        job postings.</p>
        <h2 className="font-display font-semibold text-lg text-ink-900 pt-4">Acceptable Use</h2>
        <p>Recruiters may not use candidate data for purposes outside legitimate hiring activity on the platform.</p>
        <h2 className="font-display font-semibold text-lg text-ink-900 pt-4">Termination</h2>
        <p>TalentMatch AI reserves the right to suspend accounts that violate these terms or engage in fraudulent activity.</p>
      </div>
    </div>
  );
}
