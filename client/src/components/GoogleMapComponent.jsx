import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import { Navigation, Clock, MapPin, ExternalLink, Key } from 'lucide-react';

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

export default function GoogleMapComponent({
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
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 rounded-3xl text-slate-400 text-xs">
        <Navigation className="w-6 h-6 animate-spin text-blue-400 mb-2" />
        Loading Google Maps Navigation...
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden">
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
        {/* User Breakdown Marker (Red) */}
        <Marker
          position={{ lat: userLat, lng: userLng }}
          title="Breakdown Location"
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

        {/* Responder Moving Marker (Blue) */}
        <Marker
          position={currentRespPos}
          title={`${responderName} (${specialization})`}
          onClick={() => setActiveMarker('responder')}
          icon={{
            path: 'M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2zm0 12c-4 0-8 2-8 6v2h16v-2c0-4-4-6-8-6z',
            fillColor: '#3B82F6',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#FFFFFF',
            scale: 1.4,
            anchor: { x: 12, y: 20 }
          }}
        />

        {/* Polyline Route */}
        <Polyline
          path={[
            { lat: userLat, lng: userLng },
            currentRespPos
          ]}
          options={{
            strokeColor: '#3B82F6',
            strokeOpacity: 0.85,
            strokeWeight: 4,
            geodesic: true
          }}
        />

        {activeMarker === 'user' && (
          <InfoWindow
            position={{ lat: userLat, lng: userLng }}
            onCloseClick={() => setActiveMarker(null)}
          >
            <div className="p-1 text-slate-900 font-bold text-xs">
              📍 Your Emergency Location
            </div>
          </InfoWindow>
        )}

        {activeMarker === 'responder' && (
          <InfoWindow
            position={currentRespPos}
            onCloseClick={() => setActiveMarker(null)}
          >
            <div className="p-1 text-slate-900 font-bold text-xs">
              🛠️ {responderName} ({specialization})
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
