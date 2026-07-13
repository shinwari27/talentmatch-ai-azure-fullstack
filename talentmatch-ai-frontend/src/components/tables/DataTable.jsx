import React from 'react';

export default function DataTable({ columns, data, emptyMessage = 'No records found.' }) {
  if (!data.length) {
    return <div className="text-center py-12 text-ink-500 text-sm">{emptyMessage}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-ink-500">
            {columns.map((col) => (
              <th key={col.key} className="py-3 px-4 font-medium whitespace-nowrap">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="py-3.5 px-4 align-middle whitespace-nowrap">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
