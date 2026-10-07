import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Clock, ShieldCheck, MapPin, ExternalLink, Key, Layers } from 'lucide-react';
import GoogleMapComponent from './GoogleMapComponent';

// Custom Map center updater for Leaflet
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

// Custom Leaflet Icons
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
  const envGoogleKey = localStorage.getItem('resq_google_maps_key') || import.meta.env.VITE_GOOGLE_MAPS_KEY || '';
  const [googleKey, setGoogleKey] = useState(envGoogleKey);
  const [mapEngine, setMapEngine] = useState(() => (envGoogleKey ? 'google' : 'leaflet'));
  const [currentRespPos, setCurrentRespPos] = useState([responderLat, responderLng]);
  const [eta, setEta] = useState(initialEta);
  const [distance, setDistance] = useState(initialDistance);
  const [showKeyInput, setShowKeyInput] = useState(false);

  // Simulate progressive responder movement along route
  useEffect(() => {
    if (status !== 'dispatched' && status !== 'en_route') return;

    const interval = setInterval(() => {
      setCurrentRespPos(([prevLat, prevLng]) => {
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

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${responderLat},${responderLng}&destination=${userLat},${userLng}&travelmode=driving`;

  return (
    <div className="relative w-full h-[380px] sm:h-[440px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Map Engine View */}
      {mapEngine === 'google' ? (
        <GoogleMapComponent
          apiKey={googleKey}
          userLat={userLat}
          userLng={userLng}
          responderLat={responderLat}
          responderLng={responderLng}
          responderName={responderName}
          specialization={specialization}
          status={status}
          onSwitchToLeaflet={() => setMapEngine('leaflet')}
          onSaveKey={(k) => {
            setGoogleKey(k);
            localStorage.setItem('resq_google_maps_key', k);
          }}
        />
      ) : (
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

          <Marker position={[userLat, userLng]} icon={travelerIcon}>
            <Popup>
              <div className="text-slate-900 font-bold text-xs p-1">
                📍 Your Emergency Location
              </div>
            </Popup>
          </Marker>

          <Marker position={currentRespPos} icon={responderIcon}>
            <Popup>
              <div className="text-slate-900 font-bold text-xs p-1">
                🛠️ {responderName} ({specialization})
              </div>
            </Popup>
          </Marker>

          <Polyline
            positions={[[userLat, userLng], currentRespPos]}
            color="#3B82F6"
            weight={4}
            dashArray="8, 8"
            opacity={0.8}
          />
        </MapContainer>
      )}

      {/* Floating Top Bar: Engine Switcher & Open in Google Maps */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap gap-2 justify-between items-center pointer-events-none">
        {/* Left: Live ETA / Distance */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-3 pointer-events-auto">
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
            <Navigation className="w-3.5 h-3.5 animate-spin text-blue-400" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">En Route</div>
            <div className="text-xs font-black text-white">
              {responderName}
            </div>
          </div>
          <div className="h-5 w-px bg-slate-700" />
          <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {Math.ceil(eta)}m
          </div>
          <div className="text-xs font-bold text-blue-400">
            {distance}km
          </div>
        </div>

        {/* Right: Map Provider Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Engine Selector */}
          <div className="flex items-center bg-slate-900/90 backdrop-blur-md border border-slate-700 p-1 rounded-2xl">
            <button
              onClick={() => {
                if (!googleKey) {
                  setShowKeyInput(true);
                } else {
                  setMapEngine('google');
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                mapEngine === 'google'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <img
                src="https://www.gstatic.com/images/branding/product/1x/maps_64dp.png"
                alt="Google Maps"
                className="w-3.5 h-3.5 object-contain"
              />
              Google Maps
            </button>
            <button
              onClick={() => setMapEngine('leaflet')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                mapEngine === 'leaflet'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Radar / OSM
            </button>
          </div>

          {/* Open Google Maps Live Navigation Link */}
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noreferrer"
            className="p-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 transition-all shadow-xl"
            title="Open in Google Maps Navigation"
          >
            <ExternalLink className="w-4 h-4 text-emerald-400" />
          </a>
        </div>
      </div>

      {/* Floating Key Modal / Prompt if Google Maps clicked without key */}
      {showKeyInput && (
        <div className="absolute inset-0 z-[1100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl text-white space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Key className="w-4 h-4 text-amber-400" />
              Connect Google Maps API Key
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter your Google Maps JavaScript API key (or save in <code className="text-amber-300">client/.env</code> as <code className="text-white">VITE_GOOGLE_MAPS_KEY</code>).
            </p>
            <input
              type="text"
              value={googleKey}
              onChange={(e) => setGoogleKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (googleKey) {
                    localStorage.setItem('resq_google_maps_key', googleKey);
                    setMapEngine('google');
                    setShowKeyInput(false);
                  }
                }}
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs"
              >
                Apply & Activate
              </button>
              <button
                onClick={() => {
                  setShowKeyInput(false);
                  setMapEngine('leaflet');
                }}
                className="py-2 px-3 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs"
              >
                Use Radar Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
