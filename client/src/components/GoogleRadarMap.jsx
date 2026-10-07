import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Navigation, ShieldCheck, MapPin, Wrench, Phone, Key, ExternalLink } from 'lucide-react';

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

export default function GoogleRadarMap({
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
            <div className="p-1.5 text-slate-900 text-xs">
              <div className="font-bold flex items-center gap-1 text-red-600">
                📍 You are here
              </div>
              <div className="text-[10px] text-slate-600 font-mono mt-0.5">
                {userLat.toFixed(4)}, {userLng.toFixed(4)}
              </div>
            </div>
          </InfoWindow>
        )}

        {/* Nearby Verified Responders Pins */}
        {responders.map((r) => {
          const isFemale = r.is_female;
          const isTow = r.specialization === 'tow_truck';
          const pinColor = isFemale ? '#EC4899' : isTow ? '#F59E0B' : '#3B82F6';

          return (
            <Marker
              key={r.id}
              position={{
                lat: Number(r.current_lat || 28.6139),
                lng: Number(r.current_lng || 77.2090)
              }}
              title={`${r.full_name} (${r.specialization})`}
              onClick={() => {
                setSelectedResponder(r);
                setShowUserPopup(false);
              }}
              icon={{
                path: 'M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2zm0 12c-4 0-8 2-8 6v2h16v-2c0-4-4-6-8-6z',
                fillColor: pinColor,
                fillOpacity: 1,
                strokeWeight: 1.5,
                strokeColor: '#FFFFFF',
                scale: 1.3,
                anchor: { x: 12, y: 20 }
              }}
            />
          );
        })}

        {selectedResponder && (
          <InfoWindow
            position={{
              lat: Number(selectedResponder.current_lat || 28.6139),
              lng: Number(selectedResponder.current_lng || 77.2090)
            }}
            onCloseClick={() => setSelectedResponder(null)}
          >
            <div className="p-2 text-slate-900 text-xs max-w-xs">
              <div className="font-bold text-sm flex items-center gap-1 text-slate-950">
                {selectedResponder.full_name}
              </div>
              <div className="text-[11px] text-slate-600 capitalize mt-0.5">
                {selectedResponder.specialization?.replace('_', ' ')}
              </div>
              <div className="flex items-center gap-2 mt-1 font-semibold text-[11px]">
                <span className="text-amber-600 font-bold">★ {selectedResponder.rating}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-700">{selectedResponder.total_rescues} Rescues</span>
                {selectedResponder.is_verified && (
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.2 rounded font-bold">
                    Verified
                  </span>
                )}
              </div>
              {selectedResponder.vehicle && (
                <div className="text-[10px] text-slate-500 mt-1">
                  🚗 {selectedResponder.vehicle}
                </div>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
