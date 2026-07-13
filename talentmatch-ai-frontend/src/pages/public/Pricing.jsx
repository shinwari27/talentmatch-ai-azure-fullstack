import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const plans = [
  { name: 'Starter', price: '$0', period: 'forever', desc: 'For candidates exploring opportunities.', features: ['Unlimited job applications', 'Resume scoring', 'Application tracking'], cta: 'Get Started', highlighted: false },
  { name: 'Recruiter', price: '$79', period: '/month', desc: 'For growing hiring teams.', features: ['Up to 10 active job postings', 'AI candidate ranking', 'Recruiter analytics dashboard', 'Email support'], cta: 'Start Free Trial', highlighted: true },
  { name: 'Enterprise', price: 'Custom', period: '', desc: 'For organizations at scale.', features: ['Unlimited job postings', 'Custom matching weights', 'Admin & audit controls', 'Dedicated support'], cta: 'Contact Sales', highlighted: false },
];

export default function Pricing() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="font-display text-4xl font-bold text-ink-900 mb-5">Simple, transparent pricing</h1>
        <p className="text-ink-500 text-lg">Start free as a candidate. Scale up when you\u2019re ready to hire.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6 items-stretch">
        {plans.map((p) => (
          <Card key={p.name} className={`flex flex-col ${p.highlighted ? 'border-2 border-primary-600 shadow-hover' : ''}`}>
            {p.highlighted && <span className="self-start mb-3 text-xs font-medium bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full">Most Popular</span>}
            <h3 className="font-display font-semibold text-lg text-ink-900">{p.name}</h3>
            <p className="text-sm text-ink-500 mb-4">{p.desc}</p>
            <div className="mb-6">
              <span className="font-display text-3xl font-bold text-ink-900">{p.price}</span>
              <span className="text-ink-500 text-sm"> {p.period}</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-ink-700">
                  <Check size={16} className="text-teal-600 mt-0.5 shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link to="/register">
              <Button variant={p.highlighted ? 'primary' : 'outline'} className="w-full">{p.cta}</Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
