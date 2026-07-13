import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MailCheck } from 'lucide-react';
import Button from '../../components/common/Button';
import FormField from '../../components/forms/FormField';

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-6 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 font-display font-semibold text-lg mb-8 justify-center">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-teal-500 flex items-center justify-center text-white"><Sparkles size={16} /></span>
          TalentMatch AI
        </Link>

        <div className="card p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4">
                <MailCheck size={26} />
              </div>
              <h1 className="font-display text-xl font-bold text-ink-900 mb-2">Check your email</h1>
              <p className="text-sm text-ink-500 mb-6">We\u2019ve sent password reset instructions to your inbox.</p>
              <Link to="/login"><Button variant="outline" className="w-full">Back to Login</Button></Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-ink-900 mb-1">Forgot your password?</h1>
              <p className="text-sm text-ink-500 mb-6">Enter your email and we\u2019ll send you a link to reset it.</p>
              <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4">
                <FormField label="Email" type="email" placeholder="you@company.com" required />
                <Button type="submit" className="w-full" size="lg">Send Reset Link</Button>
              </form>
              <p className="text-sm text-ink-500 text-center mt-6">
                Remember your password? <Link to="/login" className="text-primary-600 font-medium hover:underline">Login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
