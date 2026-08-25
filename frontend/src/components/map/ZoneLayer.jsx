import React from 'react';
import { GeoJSON } from 'react-leaflet';
import { getZoneStyle, formatProbability } from '../../utils/mapUtils';
import { useFloodStore } from '../../store/floodStore';

export default function ZoneLayer({ zones }) {
  const setSelectedZone = useFloodStore((state) => state.setSelectedZone);

  if (!zones) return null;

  const onEachFeature = (feature, layer) => {
    const p = feature.properties || {};

    layer.on({
      click: () => {
        setSelectedZone(feature);
      },
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({
          weight: 3,
          color: '#ffffff',
          fillOpacity: 0.75,
        });
      },
      mouseout: (e) => {
        const l = e.target;
        l.setStyle(getZoneStyle(feature));
      },
    });

    const popupHtml = `
      <div style="padding: 12px; min-width: 180px;">
        <h4 style="font-weight: 700; font-size: 14px; margin-bottom: 6px; color: #f8fafc;">
          ${p.zoneName || 'Chennai Zone'}
        </h4>
        <div style="font-size: 12px; color: #94a3b8; display: flex; flex-direction: column; gap: 4px;">
          <div><strong style="color: #cbd5e1;">Ward No:</strong> ${p.wardNumber || 'N/A'}</div>
          <div><strong style="color: #cbd5e1;">Risk Level:</strong> <span style="color: ${p.riskLevel === 'CRITICAL' ? '#ef4444' : p.riskLevel === 'HIGH' ? '#f97316' : '#10b981'}; font-weight: bold;">${p.riskLevel || 'LOW'}</span></div>
          <div><strong style="color: #cbd5e1;">Flood Probability:</strong> ${formatProbability(p.floodProbability)}</div>
          <div><strong style="color: #cbd5e1;">Avg Elevation:</strong> ${p.avgElevationM || 5.0} m</div>
        </div>
      </div>
    `;
    layer.bindPopup(popupHtml);
  };

  return <GeoJSON data={zones} style={getZoneStyle} onEachFeature={onEachFeature} />;
}
