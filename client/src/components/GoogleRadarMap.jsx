import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Navigation, ShieldCheck, MapPin, Wrench, Phone, Key, ExternalLink, Layers } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '1rem'
};

const darkRadarStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0F172A' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0F172A' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#64748B' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#CBD5E1' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748B' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#131F37' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1E293B' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#141D2E' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#334155' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1E293B' }]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1E293B' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0A0F1D' }]
  }
];

function GoogleRadarKeyPrompt({ onSwitchToLeaflet, onSaveKey }) {
  const [keyInput, setKeyInput] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    if (keyInput.trim() && onSaveKey) {
      onSaveKey(keyInput.trim());
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-blue-500/20 text-white space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
        <Key className="w-7 h-7" />
      </div>
      <div className="max-w-md">
        <h3 className="font-bold text-base text-white">Google Maps Radar Key Required</h3>
        <p className="text-xs text-slate-400 mt-1">
          To display Google Maps Satellite/Dark Road view, enter a valid Google Maps API Key below, or switch instantly to OpenStreetMap Radar.
        </p>
      </div>

      <form onSubmit={handleSave} className="w-full max-w-sm flex items-center gap-2">
        <input
          type="text"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          placeholder="Paste AIzaSy... key"
          className="flex-1 bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={!keyInput.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20"
        >
          Activate
        </button>
      </form>

      {onSwitchToLeaflet && (
        <button
          type="button"
          onClick={onSwitchToLeaflet}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 transition-colors"
        >
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          Switch to Free OpenStreetMap Radar
        </button>
      )}
    </div>
  );
}

function GoogleRadarMapInner({
  apiKey,
  userLat = 28.6139,
  userLng = 77.2090,
  responders = []
}) {
  const [map, setMap] = useState(null);
  const [selectedResponder, setSelectedResponder] = useState(null);
  const [showUserPopup, setShowUserPopup] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-radar-script',
    googleMapsApiKey: apiKey || ''
  });

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (loadError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-900 rounded-2xl border border-red-500/30 text-white">
        <MapPin className="w-8 h-8 text-red-400 mb-2" />
        <h3 className="font-bold text-xs">Google Maps Loading Error</h3>
        <p className="text-[11px] text-slate-400 max-w-xs mt-1">
          {loadError.message || 'Check your Google Maps API key or billing configuration.'}
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 rounded-2xl text-slate-400 text-xs">
        <Navigation className="w-6 h-6 animate-spin text-blue-400 mb-2" />
        Initializing Google Maps Radar...
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={{ lat: userLat, lng: userLng }}
        zoom={13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: darkRadarStyle,
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true
        }}
      >
        {/* User GPS Pin (Red Beacon) */}
        <Marker
          position={{ lat: userLat, lng: userLng }}
          title="Your Location"
          onClick={() => {
            setShowUserPopup(true);
            setSelectedResponder(null);
          }}
          icon={{
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
            fillColor: '#EF4444',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#FFFFFF',
            scale: 1.4,
            anchor: { x: 12, y: 22 }
          }}
        />

        {showUserPopup && (
          <InfoWindow
            position={{ lat: userLat, lng: userLng }}
            onCloseClick={() => setShowUserPopup(false)}
          >
            <div className="p-1 text-slate-900">
              <h4 className="font-bold text-xs">📍 Your GPS Location</h4>
              <p className="text-[11px] text-slate-600">
                {userLat.toFixed(4)}, {userLng.toFixed(4)}
              </p>
            </div>
          </InfoWindow>
        )}

        {/* Live Verified Responders */}
        {responders.map((resp) => (
          <Marker
            key={resp.id}
            position={{
              lat: Number(resp.current_lat) || 28.6139,
              lng: Number(resp.current_lng) || 77.2090
            }}
            title={resp.full_name}
            onClick={() => {
              setSelectedResponder(resp);
              setShowUserPopup(false);
            }}
            icon={{
              path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
              fillColor: resp.is_female ? '#EC4899' : '#3B82F6',
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#FFFFFF',
              scale: 1.3,
              anchor: { x: 12, y: 22 }
            }}
          />
        ))}

        {selectedResponder && (
          <InfoWindow
            position={{
              lat: Number(selectedResponder.current_lat) || 28.6139,
              lng: Number(selectedResponder.current_lng) || 77.2090
            }}
            onCloseClick={() => setSelectedResponder(null)}
          >
            <div className="p-1.5 text-slate-900 max-w-[200px]">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                <span>{selectedResponder.full_name}</span>
                {selectedResponder.is_verified && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1 rounded">
                    ✓ Verified
                  </span>
                )}
              </div>
              <p className="text-[10px] text-blue-600 font-semibold uppercase mt-0.5">
                {selectedResponder.specialization?.replace('_', ' ')}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-600 mt-1 pt-1 border-t border-slate-200">
                <span>⭐ {selectedResponder.rating}</span>
                <span>{selectedResponder.total_rescues} Rescues</span>
              </div>
              {selectedResponder.phone && (
                <div className="mt-1 text-[10px] text-slate-500">
                  📞 {selectedResponder.phone}
                </div>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

export default function GoogleRadarMap({
  apiKey,
  userLat = 28.6139,
  userLng = 77.2090,
  responders = [],
  onSwitchToLeaflet,
  onSaveKey
}) {
  if (!apiKey || apiKey.trim() === '') {
    return (
      <GoogleRadarKeyPrompt
        onSwitchToLeaflet={onSwitchToLeaflet}
        onSaveKey={onSaveKey}
      />
    );
  }

  return (
    <GoogleRadarMapInner
      apiKey={apiKey}
      userLat={userLat}
      userLng={userLng}
      responders={responders}
    />
  );
}
