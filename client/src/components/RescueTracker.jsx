import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Clock, ShieldCheck, MapPin } from 'lucide-react';

// Custom Map center updater
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

// Custom Leaflet Icons using SVGs
const travelerIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `<div style="background-color: #EF4444; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(239,68,68,0.8); animation: pulse 1.5s infinite;"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

const responderIcon = L.divIcon({
  className: 'custom-resp-marker',
  html: `<div style="background-color: #3B82F6; width: 26px; height: 26px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(59,130,246,0.8); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">🔧</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13]
});

export default function RescueTracker({
  userLat = 28.6139,
  userLng = 77.2090,
  responderLat = 28.6250,
  responderLng = 77.2180,
  responderName = 'Verified Responder',
  specialization = 'Tyre Specialist',
  initialEta = 8,
  initialDistance = 2.4,
  status = 'dispatched'
}) {
  const [currentRespPos, setCurrentRespPos] = useState([responderLat, responderLng]);
  const [eta, setEta] = useState(initialEta);
  const [distance, setDistance] = useState(initialDistance);

  // Simulate progressive responder movement along route
  useEffect(() => {
    if (status !== 'dispatched' && status !== 'en_route') return;

    const interval = setInterval(() => {
      setCurrentRespPos(([prevLat, prevLng]) => {
        // Step 10% closer to userLat, userLng
        const stepLat = prevLat + (userLat - prevLat) * 0.08;
        const stepLng = prevLng + (userLng - prevLng) * 0.08;

        setEta((prev) => Math.max(1, prev - 0.2));
        setDistance((prev) => Math.max(0.2, (prev - 0.1).toFixed(1)));

        return [stepLat, stepLng];
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [userLat, userLng, status]);

  const centerLat = (userLat + currentRespPos[0]) / 2;
  const centerLng = (userLng + currentRespPos[1]) / 2;

  return (
    <div className="relative w-full h-[360px] sm:h-[420px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Live Map */}
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={14}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <MapRecenter center={[centerLat, centerLng]} />
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* User Pin */}
        <Marker position={[userLat, userLng]} icon={travelerIcon}>
          <Popup>
            <div className="text-slate-900 font-bold text-xs p-1">
              📍 Your Emergency Location
            </div>
          </Popup>
        </Marker>

        {/* Responder Pin */}
        <Marker position={currentRespPos} icon={responderIcon}>
          <Popup>
            <div className="text-slate-900 font-bold text-xs p-1">
              🛠️ {responderName} ({specialization})
            </div>
          </Popup>
        </Marker>

        {/* Polyline connection */}
        <Polyline
          positions={[
            [userLat, userLng],
            currentRespPos
          ]}
          color="#3B82F6"
          weight={4}
          dashArray="8, 8"
          opacity={0.8}
        />
      </MapContainer>

      {/* Floating Live Telemetry Overlay */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap gap-2 justify-between items-center pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 pointer-events-auto">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
            <Navigation className="w-4 h-4 animate-spin text-blue-400" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Live Navigation</div>
            <div className="text-sm font-black text-white">
              {responderName} is En Route
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-4 pointer-events-auto">
          <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Live ETA</div>
            <div className="text-sm font-black text-emerald-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {Math.ceil(eta)} mins
            </div>
          </div>
          <div className="h-6 w-px bg-slate-700" />
          <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Distance</div>
            <div className="text-sm font-black text-blue-400">
              {distance} km
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
