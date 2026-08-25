import React from 'react';
import { RISK_BG_CLASSES } from '../../utils/constants';

export default function RiskBadge({ level, className = '' }) {
  const normalized = (level || 'LOW').toUpperCase();
  const badgeClass = RISK_BG_CLASSES[normalized] || RISK_BG_CLASSES.LOW;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeClass} ${className}`}
    >
      {normalized}
    </span>
  );
}
