import { RISK_COLORS } from './constants';

export function getZoneStyle(feature) {
  const risk = (feature?.properties?.riskLevel || 'LOW').toUpperCase();
  const color = RISK_COLORS[risk] || RISK_COLORS.LOW;

  return {
    fillColor: color,
    weight: 2,
    opacity: 0.8,
    color: '#0f172a',
    fillOpacity: risk === 'CRITICAL' ? 0.65 : risk === 'HIGH' ? 0.5 : 0.35,
  };
}

export function formatProbability(prob) {
  if (prob === undefined || prob === null) return 'N/A';
  return `${(prob * 100).toFixed(1)}%`;
}

export function getRecommendedAction(riskLevel) {
  switch ((riskLevel || '').toUpperCase()) {
    case 'CRITICAL':
      return 'Immediate Evacuation to high ground. Alert disaster response team.';
    case 'HIGH':
      return 'Prepare emergency kits, avoid low-lying underpasses and waterlogged arterial roads.';
    case 'MODERATE':
      return 'Monitor municipal rainfall updates and stay alert for localized flash waterlogging.';
    default:
      return 'Normal monitoring. Maintain stormwater drain clearance.';
  }
}
