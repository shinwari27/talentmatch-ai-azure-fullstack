import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import Card from '../../components/common/Card';
import FormField from '../../components/forms/FormField';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';

export default function Contact() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <div className="text-center max-w-xl mx-auto mb-14">
        <h1 className="font-display text-4xl font-bold text-ink-900 mb-4">Get in touch</h1>
        <p className="text-ink-500 text-lg">Questions about TalentMatch AI? Our team typically replies within one business day.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="space-y-6 md:col-span-1">
          {[
            { icon: Mail, label: 'Email', value: 'hello@talentmatch.ai' },
            { icon: Phone, label: 'Phone', value: '+1 (416) 555-0142' },
            { icon: MapPin, label: 'Office', value: 'Mississauga, ON, Canada' },
          ].map((c) => (
            <div key={c.label} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                <c.icon size={18} />
              </div>
              <div>
                <p className="text-xs text-ink-500">{c.label}</p>
                <p className="text-sm font-medium text-ink-900">{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        <Card className="md:col-span-2">
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-5">
            <FormField label="Full Name" placeholder="Jane Doe" required />
            <FormField label="Email" type="email" placeholder="jane@company.com" required />
            <FormField label="Subject" className="sm:col-span-2" placeholder="How can we help?" required />
            <FormField label="Message" as="textarea" className="sm:col-span-2" placeholder="Tell us more…" required />
            <div className="sm:col-span-2">
              <Button type="submit">Send Message</Button>
            </div>
          </form>
        </Card>
      </div>

      {sent && <Toast message="Your message has been sent." onClose={() => setSent(false)} />}
    </div>
  );
}
