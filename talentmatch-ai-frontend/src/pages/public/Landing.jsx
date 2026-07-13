import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ScanSearch, Gauge, BarChart3, ShieldCheck, UploadCloud, Sparkles,
  ChevronDown, Quote,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import MatchRing from '../../components/common/MatchRing';

const features = [
  { icon: ScanSearch, title: 'AI Resume Parsing', desc: 'Automatically extract skills, education, experience, and certifications from any resume format.' },
  { icon: Gauge, title: 'Intelligent Matching', desc: 'A weighted scoring engine ranks candidates against job requirements in seconds, not days.' },
  { icon: BarChart3, title: 'Recruiter Analytics', desc: 'Track application trends, skill distribution, and hiring funnels from one dashboard.' },
  { icon: ShieldCheck, title: 'Secure by Design', desc: 'Role-based access control and enterprise-grade cloud security on Microsoft Azure.' },
];

const steps = [
  { title: 'Post a job', desc: 'Recruiters describe the role and required skills in a guided form.' },
  { title: 'Candidates apply', desc: 'Applicants upload a resume — no lengthy forms to fill out.' },
  { title: 'AI scores the fit', desc: 'Each application is parsed and matched against the job requirements automatically.' },
  { title: 'Review top matches', desc: 'Recruiters see a ranked shortlist with match percentage and skill gaps.' },
];

const stats = [
  { value: '4,200+', label: 'Candidates screened' },
  { value: '640+', label: 'Jobs matched' },
  { value: '68%', label: 'Faster time-to-shortlist' },
  { value: '99.9%', label: 'Platform uptime' },
];

const testimonials = [
  { quote: 'We cut our resume screening time from days to minutes without losing quality candidates.', name: 'Michael Chen', role: 'Talent Lead, Northbridge Technologies' },
  { quote: 'The skill-gap breakdown gives our recruiters context no spreadsheet ever could.', name: 'Fatima Noor', role: 'HR Director, Azuria Systems' },
  { quote: 'As a candidate, I finally understood why I wasn\u2019t getting interviews — and fixed it.', name: 'Amina Yousafzai', role: 'Frontend Developer' },
];

const faqs = [
  { q: 'How does the AI calculate a match score?', a: 'We compare extracted resume data — skills, experience, education, and certifications — against the job\u2019s requirements using a weighted scoring model, then surface exactly which requirements are met or missing.' },
  { q: 'What resume formats are supported?', a: 'PDF and DOCX resumes are supported. Files are parsed automatically after upload.' },
  { q: 'Can recruiters customize the matching weights?', a: 'Yes. Administrators can tune how heavily skills, experience, and education factor into the overall score.' },
  { q: 'Is my data secure?', a: 'TalentMatch AI runs on Microsoft Azure with encrypted storage, Key Vault-managed secrets, and role-based access control.' },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 py-5">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between text-left gap-4">
        <span className="font-medium text-ink-900">{q}</span>
        <ChevronDown size={18} className={`text-ink-500 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="mt-3 text-sm text-ink-500 leading-relaxed">{a}</p>}
    </div>
  );
}

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/60 to-white">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-24 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-medium mb-6">
              <Sparkles size={14} /> AI-Powered Resume Screening
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-ink-900 leading-tight mb-6">
              Find the right candidate,<br /> not just a resume that ranks first.
            </h1>
            <p className="text-ink-500 text-lg mb-8 max-w-lg">
              TalentMatch AI parses every resume, scores every candidate against your job requirements,
              and shows recruiters exactly why someone is a fit — in seconds.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register"><Button size="lg" icon={ArrowRight}>Get Started</Button></Link>
              <Link to="/login"><Button size="lg" variant="outline">Login</Button></Link>
            </div>
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <p className="font-display font-semibold">Top Candidate Match</p>
              <span className="text-xs text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full font-medium">Live scoring</span>
            </div>
            <div className="p-6 space-y-4">
              {[
                { name: 'Bilal Ahmed', role: 'Cloud Solutions Architect', score: 91 },
                { name: 'Amina Yousafzai', role: 'Senior Frontend Developer', score: 88 },
                { name: 'Daniyal Raza', role: 'Senior Frontend Developer', score: 79 },
              ].map((c) => (
                <div key={c.name} className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold">
                      {c.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink-900">{c.name}</p>
                      <p className="text-xs text-ink-500">{c.role}</p>
                    </div>
                  </div>
                  <MatchRing score={c.score} size={44} strokeWidth={4} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-display text-3xl font-bold text-primary-600">{s.value}</p>
              <p className="text-sm text-ink-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-display text-3xl font-bold text-ink-900 mb-4">Everything a modern hiring team needs</h2>
          <p className="text-ink-500">From resume upload to final shortlist, TalentMatch AI automates the parts of hiring that don\u2019t need a human — so recruiters can focus on the parts that do.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <Card key={f.title} hoverable>
              <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
                <f.icon size={20} />
              </div>
              <h3 className="font-display font-semibold text-ink-900 mb-2">{f.title}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-display text-3xl font-bold text-ink-900 mb-4">How it works</h2>
            <p className="text-ink-500">Four steps stand between a job posting and a ranked shortlist of qualified candidates.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={s.title} className="relative">
                <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-display font-semibold mb-4">
                  {i + 1}
                </div>
                <h3 className="font-display font-semibold text-ink-900 mb-2">{s.title}</h3>
                <p className="text-sm text-ink-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <h2 className="font-display text-3xl font-bold text-ink-900 mb-6">Built for recruiters, candidates, and administrators alike</h2>
          <ul className="space-y-4">
            {[
              'Recruiters spend less time reading resumes and more time interviewing.',
              'Candidates get transparent feedback on why they matched — or didn\u2019t.',
              'Administrators get full visibility into platform health and hiring trends.',
            ].map((b) => (
              <li key={b} className="flex items-start gap-3 text-ink-700">
                <span className="w-6 h-6 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                  <UploadCloud size={13} />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>
        <Card className="bg-ink-900 text-white border-none">
          <p className="text-sm text-slate-400 mb-2">Resume Score</p>
          <div className="flex items-center gap-6">
            <MatchRing score={82} size={90} strokeWidth={7} />
            <div>
              <p className="font-display font-semibold text-lg">Strong profile match</p>
              <p className="text-sm text-slate-400">3 of 4 required skills detected. Add "GraphQL" to improve your score.</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Testimonials */}
      <section className="bg-primary-50/40 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <h2 className="font-display text-3xl font-bold text-ink-900 mb-14 text-center">Trusted by hiring teams and candidates</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name}>
                <Quote size={22} className="text-primary-300 mb-3" />
                <p className="text-ink-700 mb-5 leading-relaxed">{t.quote}</p>
                <p className="font-medium text-ink-900 text-sm">{t.name}</p>
                <p className="text-xs text-ink-500">{t.role}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-24">
        <h2 className="font-display text-3xl font-bold text-ink-900 mb-10 text-center">Frequently asked questions</h2>
        <div>
          {faqs.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-primary-600 to-teal-500">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center text-white">
          <h2 className="font-display text-3xl font-bold mb-4">Ready to hire smarter?</h2>
          <p className="text-primary-50 mb-8">Create a free account and post your first job in minutes.</p>
          <Link to="/register">
            <Button size="lg" className="!bg-white !text-primary-700 hover:!bg-primary-50">Get Started Free</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
