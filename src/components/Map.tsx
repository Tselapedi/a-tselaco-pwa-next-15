import { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, Polygon } from '@react-google-maps/api';
import type { Zone } from '@/lib/api';
import type { Location } from '@/types';

interface MapProps {
  center: [number, number];
  zoom?: number;
  zones?: Zone[];
  pickup: Location | null;
  destination: Location | null;
  onLocationSelect: (type: 'pickup' | 'destination', location: Location) => void;
}

const containerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '400px'
};

const mapStyles = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'transit',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }]
  }
];

export default function Map({ 
  center, 
  zoom = 15, 
  zones = [],
  pickup,
  destination,
  onLocationSelect 
}: MapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const handleMapClick = async (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;

    const geocoder = new google.maps.Geocoder();
    const latLng = { lat: e.latLng.lat(), lng: e.latLng.lng() };

    try {
      const result = await geocoder.geocode({ location: latLng });
      const address = result.results[0]?.formatted_address || '';

      // If no pickup is set, set pickup first
      if (!pickup) {
        onLocationSelect('pickup', { ...latLng, address });
      } else if (!destination) {
        onLocationSelect('destination', { ...latLng, address });
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
    }
  };

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={{ lat: center[0], lng: center[1] }}
        zoom={zoom}
        options={{
          styles: mapStyles,
          disableDefaultUI: true,
          zoomControl: true,
          streetViewControl: false,
          fullscreenControl: false
        }}
        onClick={handleMapClick}
        onLoad={map => setMap(map)}
      >
        {/* Service Zones */}
        {zones.map((zone, index) => (
          <Polygon
            key={zone.id}
            paths={zone.coordinates}
            options={{
              fillColor: zone.isActive ? '#f43f5e' : '#94a3b8', // primary-500 for active, gray-400 for inactive
              fillOpacity: 0.2,
              strokeColor: zone.isActive ? '#e11d48' : '#64748b', // primary-600 for active, gray-500 for inactive
              strokeWeight: 2
            }}
          />
        ))}

        {/* Pickup Marker */}
        {pickup && (
          <Marker
            position={{ lat: pickup.lat, lng: pickup.lng }}
            icon={{
              url: '/assets/pickup-marker.svg',
              scaledSize: new window.google.maps.Size(40, 40)
            }}
            label={{
              text: 'P',
              color: '#ffffff',
              fontWeight: 'bold',
              className: 'bg-primary-500'
            }}
          />
        )}

        {/* Destination Marker */}
        {destination && (
          <Marker
            position={{ lat: destination.lat, lng: destination.lng }}
            icon={{
              url: '/assets/destination-marker.svg',
              scaledSize: new window.google.maps.Size(40, 40)
            }}
            label={{
              text: 'D',
              color: '#ffffff',
              fontWeight: 'bold',
              className: 'bg-secondary-500'
            }}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
}