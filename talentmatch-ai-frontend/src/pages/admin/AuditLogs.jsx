import React from 'react';
import { ShieldCheck } from 'lucide-react';
import Card from '../../components/common/Card';
import { auditLogs } from '../../constants/mockData';

export default function AuditLogs() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-900">Audit Logs</h2>
        <p className="text-sm text-ink-500 mt-1">A record of sensitive actions taken across the platform.</p>
      </div>

      <Card padding="p-0">
        <div className="divide-y divide-slate-100">
          {auditLogs.map((l) => (
            <div key={l.id} className="flex items-start gap-3 px-6 py-4">
              <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                <ShieldCheck size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink-900"><strong className="font-medium">{l.actor}</strong> {l.action}</p>
                <p className="text-xs text-ink-500 mt-0.5">{l.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
