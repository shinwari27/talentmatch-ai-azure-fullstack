import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, UserRound, Briefcase, AlertCircle, Loader2 } from 'lucide-react';
import Button from '../../components/common/Button';
import FormField from '../../components/forms/FormField';
import { useAuth } from '../../hooks/useAuth';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('candidate');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side checks that mirror the backend's own validation rules
    // (src/middleware/validators.js) — catching them here saves a round
    // trip, but the backend re-checks everything regardless, so this is
    // a UX nicety, not the actual security boundary.
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8 || !/\d/.test(password)) {
      setError('Password must be at least 8 characters and include a number.');
      return;
    }
    if (role === 'recruiter' && !companyName.trim()) {
      setError('Company name is required for recruiter accounts.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Backend expects the role capitalized exactly ('Candidate' /
      // 'Recruiter') — the lowercase value here is only for this page's
      // own toggle UI.
      const backendRole = role === 'candidate' ? 'Candidate' : 'Recruiter';
      const user = await register({
        fullName,
        email,
        password,
        role: backendRole,
        ...(role === 'recruiter' ? { companyName } : {}),
      });
      navigate(`/${user.role.toLowerCase()}`);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-6 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 font-display font-semibold text-lg mb-8 justify-center">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-teal-500 flex items-center justify-center text-white"><Sparkles size={16} /></span>
          TalentMatch AI
        </Link>

        <div className="card p-8">
          <h1 className="font-display text-2xl font-bold text-ink-900 mb-1">Create your account</h1>
          <p className="text-sm text-ink-500 mb-6">Join as a candidate or a recruiter — it takes less than a minute.</p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole('candidate')}
              className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-colors ${
                role === 'candidate' ? 'border-primary-600 bg-primary-50' : 'border-slate-200'
              }`}
            >
              <UserRound size={20} className={role === 'candidate' ? 'text-primary-600' : 'text-ink-500'} />
              <span className="text-sm font-medium">Candidate</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('recruiter')}
              className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-colors ${
                role === 'recruiter' ? 'border-primary-600 bg-primary-50' : 'border-slate-200'
              }`}
            >
              <Briefcase size={20} className={role === 'recruiter' ? 'text-primary-600' : 'text-ink-500'} />
              <span className="text-sm font-medium">Recruiter</span>
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Doe"
              required
            />
            <FormField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@company.com"
              required
            />
            {role === 'recruiter' && (
              <FormField
                label="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Inc."
                required
              />
            )}
            <FormField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters, with a number"
              required
            />
            <FormField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
            />
            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Creating account…</span>
              ) : 'Create Account'}
            </Button>
          </form>

          <p className="text-sm text-ink-500 text-center mt-6">
            Already have an account? <Link to="/login" className="text-primary-600 font-medium hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
