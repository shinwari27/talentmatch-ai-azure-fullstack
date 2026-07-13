import React from 'react';
import { Target, Users, Rocket } from 'lucide-react';
import Card from '../../components/common/Card';

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="font-display text-4xl font-bold text-ink-900 mb-5">Rethinking how hiring teams find great candidates</h1>
        <p className="text-ink-500 text-lg">
          TalentMatch AI was built on a simple idea: recruiters shouldn\u2019t have to read hundreds of resumes to find
          twenty good candidates. AI should do the reading — people should do the deciding.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-20">
        <Card>
          <Target size={22} className="text-primary-600 mb-3" />
          <h3 className="font-display font-semibold mb-2">Our Mission</h3>
          <p className="text-sm text-ink-500">Remove the manual, repetitive parts of resume screening so hiring decisions are faster and fairer.</p>
        </Card>
        <Card>
          <Users size={22} className="text-primary-600 mb-3" />
          <h3 className="font-display font-semibold mb-2">Who We Serve</h3>
          <p className="text-sm text-ink-500">Recruiters, hiring managers, and candidates who want transparency in the matching process.</p>
        </Card>
        <Card>
          <Rocket size={22} className="text-primary-600 mb-3" />
          <h3 className="font-display font-semibold mb-2">Built on Azure</h3>
          <p className="text-sm text-ink-500">Enterprise cloud architecture with AI Document Intelligence, secure storage, and role-based access.</p>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900 mb-4">Why we built TalentMatch AI</h2>
          <p className="text-ink-500 leading-relaxed mb-4">
            Recruitment teams routinely receive hundreds of applications for a single opening. Manual screening is
            slow, inconsistent, and prone to bias — and candidates rarely learn why they weren\u2019t selected.
          </p>
          <p className="text-ink-500 leading-relaxed">
            TalentMatch AI automatically extracts structured data from every resume, scores candidates against job
            requirements with a transparent weighted model, and gives both recruiters and candidates a clear picture
            of the fit.
          </p>
        </div>
        <Card className="bg-ink-900 text-white border-none">
          <p className="font-display font-semibold text-lg mb-4">By the numbers</p>
          <div className="grid grid-cols-2 gap-6">
            <div><p className="text-2xl font-display font-bold text-teal-400">4,200+</p><p className="text-xs text-slate-400">Candidates screened</p></div>
            <div><p className="text-2xl font-display font-bold text-teal-400">640+</p><p className="text-xs text-slate-400">Jobs matched</p></div>
            <div><p className="text-2xl font-display font-bold text-teal-400">312</p><p className="text-xs text-slate-400">Recruiter accounts</p></div>
            <div><p className="text-2xl font-display font-bold text-teal-400">99.9%</p><p className="text-xs text-slate-400">Uptime</p></div>
          </div>
        </Card>
      </div>
    </div>
  );
}
