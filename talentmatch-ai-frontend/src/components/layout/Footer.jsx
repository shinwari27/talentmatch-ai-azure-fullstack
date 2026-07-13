import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Linkedin, Twitter, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-ink-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2">
          <div className="flex items-center gap-2 font-display font-semibold text-lg text-white mb-3">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-teal-500 flex items-center justify-center">
              <Sparkles size={16} />
            </span>
            TalentMatch AI
          </div>
          <p className="text-sm text-slate-400 max-w-xs">AI-powered resume screening and intelligent job matching, built for modern recruiting teams.</p>
          <div className="flex gap-3 mt-5">
            <a href="#" aria-label="LinkedIn" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10"><Linkedin size={16} /></a>
            <a href="#" aria-label="Twitter" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10"><Twitter size={16} /></a>
            <a href="#" aria-label="GitHub" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10"><Github size={16} /></a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-medium mb-3 text-sm">Product</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/features" className="hover:text-white">Features</Link></li>
            <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
            <li><Link to="/about" className="hover:text-white">About</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-medium mb-3 text-sm">Company</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-medium mb-3 text-sm">Account</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/login" className="hover:text-white">Login</Link></li>
            <li><Link to="/register" className="hover:text-white">Register</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-slate-500 space-y-1">
        <p>© 2026 TalentMatch AI. All rights reserved.</p>
        <p>Developed by Hikmat Shinwari — DevOps Engineer</p>
      </div>
    </footer>
  );
}
