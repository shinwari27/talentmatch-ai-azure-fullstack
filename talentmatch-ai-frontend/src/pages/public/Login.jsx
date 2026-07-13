import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import Button from '../../components/common/Button';
import FormField from '../../components/forms/FormField';
import { useAuth } from '../../hooks/useAuth';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      navigate(`/${user.role.toLowerCase()}`);
    } catch (err) {
      // err.message is the backend's own error text (e.g. "Invalid email or
      // password.") — surfaced directly rather than a generic fallback,
      // since the backend already writes these to be user-facing.
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary-700 to-teal-600 text-white p-12">
        <Link to="/" className="flex items-center gap-2 font-display font-semibold text-lg">
          <span className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center"><Sparkles size={16} /></span>
          TalentMatch AI
        </Link>
        <div>
          <h2 className="font-display text-3xl font-bold mb-4 leading-snug">Welcome back to smarter hiring.</h2>
          <p className="text-primary-50 max-w-sm">Sign in to review your matches, manage job postings, or oversee the platform — depending on your role.</p>
        </div>
        <p className="text-xs text-primary-100">© 2026 TalentMatch AI</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="lg:hidden flex items-center gap-2 font-display font-semibold text-lg mb-10">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-teal-500 flex items-center justify-center text-white"><Sparkles size={16} /></span>
            TalentMatch AI
          </Link>

          <h1 className="font-display text-2xl font-bold text-ink-900 mb-1">Sign in to your account</h1>
          <p className="text-sm text-ink-500 mb-8">Enter your details to access your dashboard.</p>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <FormField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <FormField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-ink-700">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded border-ink-300" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-primary-600 font-medium hover:underline">Forgot password?</Link>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Signing in…</span>
              ) : 'Login'}
            </Button>
          </form>

          <p className="text-sm text-ink-500 text-center mt-8">
            Don't have an account? <Link to="/register" className="text-primary-600 font-medium hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
