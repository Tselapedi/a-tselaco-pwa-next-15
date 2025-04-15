import { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';

interface DriverDetails {
  id: string;
  name: string;
  vehicle: string;
}

interface TrackingMapProps {
  center: [number, number];
  driverLocation: [number, number];
  pickup: [number, number];
  destination: [number, number];
  path?: [number, number][];
  driverDetails: DriverDetails | null;
}

export default function TrackingMap({
  center,
  driverLocation,
  pickup,
  destination,
  path = [],
  driverDetails
}: TrackingMapProps) {
  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''}>
      <GoogleMap
        mapContainerStyle={{
          width: '100%',
          height: '100%',
          minHeight: '300px'
        }}
        center={{
          lat: center[0],
          lng: center[1]
        }}
        zoom={14}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          streetViewControl: false,
          fullscreenControl: false
        }}
      >
        {/* Driver Marker */}
        <Marker
          position={{
            lat: driverLocation[0],
            lng: driverLocation[1]
          }}
          icon={{
            url: '/assets/car-marker.svg',
            scaledSize: new window.google.maps.Size(40, 40)
          }}
        />

        {/* Pickup Marker */}
        <Marker
          position={{
            lat: pickup[0],
            lng: pickup[1]
          }}
          icon={{
            url: '/assets/pickup-marker.svg',
            scaledSize: new window.google.maps.Size(40, 40)
          }}
          label={{
            text: 'P',
            color: '#ffffff',
            className: 'bg-primary-500'
          }}
        />

        {/* Destination Marker */}
        <Marker
          position={{
            lat: destination[0],
            lng: destination[1]
          }}
          icon={{
            url: '/assets/destination-marker.svg',
            scaledSize: new window.google.maps.Size(40, 40)
          }}
          label={{
            text: 'D',
            color: '#ffffff',
            className: 'bg-secondary-500'
          }}
        />

        {/* Route Path */}
        {path.length > 0 && (
          <Polyline
            path={path.map(([lat, lng]) => ({ lat, lng }))}
            options={{
              strokeColor: '#14b8a6', // secondary-500
              strokeWeight: 4,
              strokeOpacity: 0.8
            }}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
}