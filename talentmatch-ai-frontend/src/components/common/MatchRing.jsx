import React from 'react';
import { scoreColor } from '../../utils/formatters';

/**
 * MatchRing — the product's signature visual element.
 * Every job card, candidate card, and detail page surfaces the AI match
 * percentage through this ring so the score is always the same shape,
 * color language, and size ratio wherever it appears.
 */
export default function MatchRing({ score, size = 56, strokeWidth = 5, showLabel = true }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const { ring, text } = scoreColor(score);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E2E8F0" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} stroke={ring} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      {showLabel && (
        <span className={`absolute font-display font-semibold ${text}`} style={{ fontSize: size / 3.6 }}>
          {score}%
        </span>
      )}
    </div>
  );
}
