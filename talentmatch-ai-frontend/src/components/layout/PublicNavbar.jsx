import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles } from 'lucide-react';
import Button from '../common/Button';

const links = [
  { label: 'Features', to: '/features' },
  { label: 'How it Works', to: '/#how-it-works' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-semibold text-lg text-ink-900">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-teal-500 flex items-center justify-center text-white">
            <Sparkles size={16} />
          </span>
          TalentMatch <span className="text-primary-600">AI</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-700">
          {links.map((l) => (
            <Link key={l.label} to={l.to} className="hover:text-primary-600 transition-colors">{l.label}</Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
          <Link to="/register"><Button variant="primary" size="sm">Get Started</Button></Link>
        </div>

        <button className="md:hidden text-ink-900" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-100 px-6 py-4 flex flex-col gap-4 bg-white">
          {links.map((l) => (
            <Link key={l.label} to={l.to} onClick={() => setOpen(false)} className="text-sm font-medium text-ink-700">{l.label}</Link>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            <Link to="/login" onClick={() => setOpen(false)}><Button variant="outline" className="w-full">Login</Button></Link>
            <Link to="/register" onClick={() => setOpen(false)}><Button variant="primary" className="w-full">Get Started</Button></Link>
          </div>
        </div>
      )}
    </header>
  );
}
