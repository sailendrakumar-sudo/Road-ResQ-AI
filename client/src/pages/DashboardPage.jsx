import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Shield, MapPin, Wrench, Navigation, Clock, Phone, Sparkles, ChevronRight, Activity, Battery, Car, Layers, Key, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import SafeModeToggle from '../components/SafeModeToggle';
import GoogleRadarMap from '../components/GoogleRadarMap';
import { getRespondersApi } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const responderMarkerIcon = L.divIcon({
  className: 'custom-resp-radar-marker',
  html: `<div style="background-color: #3B82F6; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; display:flex; align-items:center; justify-content:center; color:white; font-size:10px;">🔧</div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const userMarkerIcon = L.divIcon({
  className: 'custom-user-radar-marker',
  html: `<div style="background-color: #EF4444; width: 18px; height: 18px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(239,68,68,0.8);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

export default function DashboardPage() {
  const { user, coords, activeEmergency, activeRescue, isSafeMode } = useApp();
  const [responders, setResponders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Google Maps Key & Provider Selection
  const envKey = localStorage.getItem('resq_google_maps_key') || import.meta.env.VITE_GOOGLE_MAPS_KEY || '';
  const [googleKey, setGoogleKey] = useState(envKey);
  const [mapEngine, setMapEngine] = useState(() => (envKey ? 'google' : 'leaflet'));
  const [showKeyModal, setShowKeyModal] = useState(false);

  useEffect(() => {
    getRespondersApi()
      .then((data) => {
        if (data.responders) setResponders(data.responders);
      })
      .catch((err) => console.warn('Responders radar error:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome & Emergency Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Traveler Radar Control
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Network Live
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Traveler'}
          </h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-red-400" />
            Current GPS: <span className="font-mono text-slate-300">{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span> (High Accuracy Lock)
          </p>
        </div>

        {/* Big Report Emergency Action Button */}
        <Link
          id="dashboard-report-emergency-btn"
          to="/emergency/report"
          className="px-6 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-sm tracking-wide shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-3 transform hover:scale-102"
        >
          <AlertTriangle className="w-5 h-5 text-amber-200 animate-bounce" />
          REPORT STRANDED BREAKDOWN
        </Link>
      </div>

      {/* Active Rescue In-Progress Card (If any active rescue exists) */}
      {activeRescue && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/40 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider inline-flex items-center gap-1.5 mb-2">
                <Navigation className="w-3.5 h-3.5 animate-spin" />
                Active Rescue Dispatched
              </span>
              <h2 className="text-xl font-bold text-white">
                {activeEmergency?.ai_diagnosis?.diagnosis || 'Roadside Assistance En-Route'}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Rescue ID: <span className="font-mono text-amber-400 font-semibold">{activeRescue.id}</span> • Status: <span className="font-semibold capitalize text-emerald-400">{activeRescue.status}</span>
              </p>
            </div>
            <Link
              to={`/emergency/tracking/${activeRescue.id}`}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30"
            >
              Open Live GPS Tracker
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Women Safe Mode Widget */}
      <div className="max-w-xl">
        <SafeModeToggle />
      </div>

      {/* Grid: Live Radar Map & Nearby Verified Responders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Radar (7 cols) - Uses Google Maps */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Live Roadside Network Radar
              </h2>
              <p className="text-xs text-slate-400">
                Active mechanics, tow trucks, and medical trauma units in your radius
              </p>
            </div>

            {/* Provider Switcher Pill */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-800/90 border border-slate-700 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => {
                    if (!googleKey) {
                      setShowKeyModal(true);
                    } else {
                      setMapEngine('google');
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
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
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    mapEngine === 'leaflet'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Radar / OSM
                </button>
              </div>

              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">
                {responders.length} Online
              </span>
            </div>
          </div>

          {/* Interactive Map Box */}
          <div className="relative h-[360px] rounded-2xl overflow-hidden border border-slate-800">
            {mapEngine === 'google' ? (
              <GoogleRadarMap
                apiKey={googleKey}
                userLat={coords.lat}
                userLng={coords.lng}
                responders={responders}
                onSwitchToLeaflet={() => setMapEngine('leaflet')}
                onSaveKey={(k) => {
                  setGoogleKey(k);
                  localStorage.setItem('resq_google_maps_key', k);
                }}
              />
            ) : (
              <MapContainer
                center={[coords.lat, coords.lng]}
                zoom={13}
                scrollWheelZoom={false}
                className="w-full h-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {/* User Pin */}
                <Marker position={[coords.lat, coords.lng]} icon={userMarkerIcon}>
                  <Popup>
                    <div className="text-slate-900 font-bold text-xs">
                      📍 You are here
                    </div>
                  </Popup>
                </Marker>

                {/* Responders Pins */}
                {responders.map((r) => (
                  <Marker
                    key={r.id}
                    position={[Number(r.current_lat || 28.6139), Number(r.current_lng || 77.2090)]}
                    icon={responderMarkerIcon}
                  >
                    <Popup>
                      <div className="text-slate-900 font-bold text-xs p-1">
                        <div>🛠️ {r.full_name}</div>
                        <div className="text-[11px] text-slate-600 capitalize">{r.specialization?.replace('_', ' ')}</div>
                        <div className="text-[11px] text-amber-600 font-bold">★ {r.rating} ({r.total_rescues} rescues)</div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}

            {/* Prompt modal if Google Maps selected but no key entered */}
            {showKeyModal && (
              <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
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
                          setMapEngine('google');
                          setShowKeyModal(false);
                        }
                      }}
                      className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs"
                    >
                      Activate Google Maps
                    </button>
                    <button
                      onClick={() => {
                        setShowKeyModal(false);
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
        </div>

        {/* Active Responders List (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              Verified On-Call Fleet
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              AI pre-verifies credentials, insurance, and customer satisfaction.
            </p>

            <div className="space-y-3">
              {responders.slice(0, 4).map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3 hover:border-slate-600 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      r.is_female ? 'bg-pink-500/20 text-pink-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {r.specialization === 'tow_truck' ? '🚛' : r.specialization === 'battery_technician' ? '⚡' : '🔧'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        {r.full_name}
                        {r.is_verified && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 capitalize">
                        {r.specialization?.replace('_', ' ')} • <span className="text-amber-400 font-semibold">★ {r.rating}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Online
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Support Phone Card */}
          <div className="mt-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Highway Emergency Line</div>
                <div className="text-[11px] text-slate-400">Direct National Helpline 112</div>
              </div>
            </div>
            <a
              href="tel:112"
              className="text-xs font-bold text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20"
            >
              Call 112
            </a>
          </div>
        </div>
      </div>

      {/* Floating Key Modal if Google Maps clicked without key */}
      {showKeyModal && (
        <div className="fixed inset-0 z-[1200] bg-slate-955/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Key className="w-5 h-5 text-amber-400" />
              Connect Google Maps API Key
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter your Google Maps JavaScript API key below to enable Google Maps Radar, or keep using OpenStreetMap.
            </p>
            <input
              type="text"
              value={googleKey}
              onChange={(e) => setGoogleKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (googleKey) {
                    localStorage.setItem('resq_google_maps_key', googleKey);
                    setMapEngine('google');
                    setShowKeyModal(false);
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs shadow-lg shadow-blue-600/30"
              >
                Apply & Activate
              </button>
              <button
                onClick={() => {
                  setShowKeyModal(false);
                  setMapEngine('leaflet');
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs border border-slate-700"
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
