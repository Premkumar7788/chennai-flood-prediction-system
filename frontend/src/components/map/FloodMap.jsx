import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { CHENNAI_CENTER, DEFAULT_ZOOM } from '../../utils/constants';
import ZoneLayer from './ZoneLayer';
import FloodLegend from './FloodLegend';

export default function FloodMap({ zones, fullScreen = false }) {
  return (
    <div className={`relative w-full ${fullScreen ? 'h-full' : 'h-80 rounded-xl overflow-hidden border border-slate-800'}`}>
      <MapContainer
        center={CHENNAI_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors & CartoDB'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <ZoneLayer zones={zones} />
      </MapContainer>

      <div className="absolute bottom-4 right-4 z-[1000] pointer-events-auto">
        <FloodLegend />
      </div>
    </div>
  );
}
