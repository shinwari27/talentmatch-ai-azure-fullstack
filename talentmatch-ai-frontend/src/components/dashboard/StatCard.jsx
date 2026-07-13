import React from 'react';
import Card from '../common/Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({ label, value, icon: Icon, trend, trendUp = true, accent = 'primary' }) {
  const accentMap = {
    primary: 'bg-primary-50 text-primary-600',
    teal: 'bg-teal-50 text-teal-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };
  return (
    <Card hoverable className="flex items-start justify-between">
      <div>
        <p className="text-sm text-ink-500 mb-1.5">{label}</p>
        <p className="text-2xl font-display font-semibold text-ink-900">{value}</p>
        {trend && (
          <p className={`mt-2 flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-teal-600' : 'text-red-600'}`}>
            {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trend}
          </p>
        )}
      </div>
      {Icon && (
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accentMap[accent]}`}>
          <Icon size={20} />
        </div>
      )}
    </Card>
  );
}
