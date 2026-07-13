import React from 'react';
import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import Button from '../../components/common/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mb-6">
        <SearchX size={30} />
      </div>
      <p className="font-display text-6xl font-bold text-ink-900 mb-3">404</p>
      <h1 className="font-display text-xl font-semibold text-ink-900 mb-2">This page doesn't exist</h1>
      <p className="text-ink-500 mb-8 max-w-sm">The page you\u2019re looking for may have been moved or removed.</p>
      <Link to="/"><Button>Back to Home</Button></Link>
    </div>
  );
}
