import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import { Navigation, Clock, MapPin, ExternalLink, Key, Layers } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '1.5rem'
};

// Sleek dark road style for Google Maps
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#131B2E' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#131B2E' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#74829E' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#D4DCED' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#74829E' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#18243C' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#24324D' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1A253A' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#3A4D73' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1F2C45' }]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#24324D' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0B111D' }]
  }
];

function GoogleMapKeyPrompt({ onSwitchToLeaflet, onSaveKey }) {
  const [keyInput, setKeyInput] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    if (keyInput.trim() && onSaveKey) {
      onSaveKey(keyInput.trim());
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-blue-500/20 text-white space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
        <Key className="w-7 h-7" />
      </div>
      <div className="max-w-md">
        <h3 className="font-bold text-base text-white">Google Maps API Key Required</h3>
        <p className="text-xs text-slate-400 mt-1">
          To display Google Maps Live Route Tracking, enter a valid Google Maps API Key below, or switch instantly to OpenStreetMap Radar.
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

function GoogleMapInner({
  apiKey,
  userLat = 28.6139,
  userLng = 77.2090,
  responderLat = 28.6250,
  responderLng = 77.2180,
  responderName = 'Verified Responder',
  specialization = 'Tyre Specialist',
  status = 'dispatched'
}) {
  const [map, setMap] = useState(null);
  const [currentRespPos, setCurrentRespPos] = useState({ lat: responderLat, lng: responderLng });
  const [activeMarker, setActiveMarker] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || ''
  });

  // Animated moving responder simulation
  useEffect(() => {
    if (status !== 'dispatched' && status !== 'en_route') return;

    const interval = setInterval(() => {
      setCurrentRespPos((prev) => {
        const stepLat = prev.lat + (userLat - prev.lat) * 0.08;
        const stepLng = prev.lng + (userLng - prev.lng) * 0.08;
        return { lat: stepLat, lng: stepLng };
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [userLat, userLng, status]);

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const center = {
    lat: (userLat + currentRespPos.lat) / 2,
    lng: (userLng + currentRespPos.lng) / 2
  };

  if (loadError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-900 rounded-3xl border border-red-500/30 text-white">
        <MapPin className="w-10 h-10 text-red-400 mb-2" />
        <h3 className="font-bold text-sm">Google Maps API Error</h3>
        <p className="text-xs text-slate-400 max-w-sm mt-1">
          {loadError.message || 'Invalid Google Maps API key or billing not enabled. Falling back to radar map.'}
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 rounded-3xl text-slate-400 text-sm">
        <Navigation className="w-8 h-8 animate-spin text-blue-400 mb-3" />
        Loading Google Maps Live Route...
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={14}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: darkMapStyle,
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true
        }}
      >
        {/* Route Line */}
        <Polyline
          path={[
            { lat: userLat, lng: userLng },
            { lat: currentRespPos.lat, lng: currentRespPos.lng }
          ]}
          options={{
            strokeColor: '#3B82F6',
            strokeOpacity: 0.8,
            strokeWeight: 4,
            geodesic: true
          }}
        />

        {/* User Marker (Red Beacon) */}
        <Marker
          position={{ lat: userLat, lng: userLng }}
          title="Your Emergency Location"
          onClick={() => setActiveMarker('user')}
          icon={{
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
            fillColor: '#EF4444',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#FFFFFF',
            scale: 1.5,
            anchor: { x: 12, y: 22 }
          }}
        />

        {/* Responder Marker (Blue Van/Wrench) */}
        <Marker
          position={{ lat: currentRespPos.lat, lng: currentRespPos.lng }}
          title={responderName}
          onClick={() => setActiveMarker('responder')}
          icon={{
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
            fillColor: '#3B82F6',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#FFFFFF',
            scale: 1.5,
            anchor: { x: 12, y: 22 }
          }}
        />

        {/* User InfoWindow */}
        {activeMarker === 'user' && (
          <InfoWindow
            position={{ lat: userLat, lng: userLng }}
            onCloseClick={() => setActiveMarker(null)}
          >
            <div className="p-1 text-slate-900">
              <h4 className="font-bold text-xs">📍 Your GPS Location</h4>
              <p className="text-[11px] text-slate-600">Breakdown Incident Point</p>
            </div>
          </InfoWindow>
        )}

        {/* Responder InfoWindow */}
        {activeMarker === 'responder' && (
          <InfoWindow
            position={{ lat: currentRespPos.lat, lng: currentRespPos.lng }}
            onCloseClick={() => setActiveMarker(null)}
          >
            <div className="p-1 text-slate-900">
              <h4 className="font-bold text-xs">{responderName}</h4>
              <p className="text-[11px] text-blue-600 font-semibold">{specialization}</p>
              <p className="text-[10px] text-slate-500">Live en route via GPS</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

export default function GoogleMapComponent({
  apiKey,
  userLat = 28.6139,
  userLng = 77.2090,
  responderLat = 28.6250,
  responderLng = 77.2180,
  responderName = 'Verified Responder',
  specialization = 'Tyre Specialist',
  status = 'dispatched',
  onSwitchToLeaflet,
  onSaveKey
}) {
  if (!apiKey || apiKey.trim() === '') {
    return (
      <GoogleMapKeyPrompt
        onSwitchToLeaflet={onSwitchToLeaflet}
        onSaveKey={onSaveKey}
      />
    );
  }

  return (
    <GoogleMapInner
      apiKey={apiKey}
      userLat={userLat}
      userLng={userLng}
      responderLat={responderLat}
      responderLng={responderLng}
      responderName={responderName}
      specialization={specialization}
      status={status}
    />
  );
}
