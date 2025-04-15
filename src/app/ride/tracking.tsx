'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import TrackingMap from '@/components/TrackingMap';
import TripProgress from '@/components/TripProgress';
import DriverInfoComponent from '@/components/DriverInfo';
import ConnectionStatus from '@/components/ConnectionStatus';
import { getRideDetails, type RideDetails as ApiRideDetails } from '@/lib/api';

const BASE_WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://tselacoo.xyz/ws';

export const setupWebSocket = (path: string): WebSocket => {
  const ws = new WebSocket(`${BASE_WS_URL}${path}`);
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'ping' }));
    }
  }, 30000);

  ws.onclose = () => {
    clearInterval(pingInterval);
  };

  return ws;
};

interface WebSocketEvent {
  type: 'DRIVER_LOCATION_UPDATE' | 'RIDE_STATUS_UPDATE' | 'DRIVER_ASSIGNED';
  payload: any;
}

interface Location {
  lat: number;
  lng: number;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  photo?: string;
  vehicle: {
    make: string;
    model: string;
    color: string;
    plate: string;
  };
  location: Location;
  rating: number;
}

interface RideDetails {
  id: string;
  status: 'pending' | 'accepted' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
  pickup: Location & { address: string };
  destination: Location & { address: string };
  driver?: Driver;
  estimatedArrival?: Date;
  fare: number;
}

const RETRY_DELAYS = [1000, 2000, 5000, 10000];

export default function TrackingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rideId = searchParams.get('rideId');

  const [ride, setRide] = useState<RideDetails | null>(null);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const initializeWebSocket = useCallback(() => {
    if (!rideId) return;

    const ws = setupWebSocket(`/rides/${rideId}/track`);

    ws.onopen = () => {
      setConnectionStatus('connected');
      setRetryCount(0);
    };

    ws.onclose = () => {
      setConnectionStatus('disconnected');
      const delay = RETRY_DELAYS[Math.min(retryCount, RETRY_DELAYS.length - 1)];
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        initializeWebSocket();
      }, delay);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Connection error. Retrying...');
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketEvent = JSON.parse(event.data);
        handleWebSocketEvent(data);
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    setWsConnection(ws);

    return () => {
      ws.close();
    };
  }, [rideId, retryCount]);

  const handleWebSocketEvent = useCallback((event: WebSocketEvent) => {
    switch (event.type) {
      case 'DRIVER_LOCATION_UPDATE':
        setRide(prev => prev ? {
          ...prev,
          driver: prev.driver ? {
            ...prev.driver,
            location: event.payload.location
          } : undefined
        } : null);
        break;

      case 'RIDE_STATUS_UPDATE':
        setRide(prev => prev ? {
          ...prev,
          status: event.payload.status,
          estimatedArrival: event.payload.estimatedArrival
        } : null);

        if (event.payload.status === 'completed') {
          router.push('/ride/completed');
        }
        break;

      case 'DRIVER_ASSIGNED':
        setRide(prev => prev ? {
          ...prev,
          driver: {
            ...event.payload.driver,
            location: event.payload.driver.location || { lat: 0, lng: 0 }
          }
        } : null);
        break;
    }
  }, [router]);

  useEffect(() => {
    const loadRideDetails = async () => {
      if (!rideId) {
        setError('No ride ID provided');
        return;
      }

      try {
        const response = await getRideDetails(rideId);
        // Transform API response to match our internal RideDetails type
        const transformedRide: RideDetails = {
          ...response.data,
          driver: response.data.driver ? {
            ...response.data.driver,
            location: { lat: 0, lng: 0 }, // Default location until we get an update
            vehicle: {
              make: response.data.driver.vehicle.model.split(' ')[0],
              model: response.data.driver.vehicle.model,
              color: 'Unknown',
              plate: response.data.driver.vehicle.plateNumber
            }
          } : undefined
        };
        setRide(transformedRide);
      } catch (err) {
        setError('Failed to load ride details');
        console.error('Error loading ride details:', err);
      }
    };

    loadRideDetails();
    initializeWebSocket();

    return () => {
      wsConnection?.close();
    };
  }, [rideId, initializeWebSocket]);

  if (!rideId) {
    return <div className="p-4 text-red-600">Invalid ride ID</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg m-4">
        <p className="text-red-700">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <ConnectionStatus status={connectionStatus} />
      
      <div className="flex-1 relative">
        <TrackingMap
          center={[ride.pickup.lat, ride.pickup.lng]}
          driverLocation={ride.driver ? [ride.driver.location.lat, ride.driver.location.lng] : [0, 0]}
          pickup={[ride.pickup.lat, ride.pickup.lng]}
          destination={[ride.destination.lat, ride.destination.lng]}
          driverDetails={ride.driver ? {
            id: ride.driver.id,
            name: ride.driver.name,
            vehicle: `${ride.driver.vehicle.make} ${ride.driver.vehicle.model}`
          } : null}
        />
      </div>

      {ride.driver && (
        <DriverInfoComponent
          details={{
            name: ride.driver.name,
            vehicleModel: `${ride.driver.vehicle.make} ${ride.driver.vehicle.model}`,
            plateNumber: ride.driver.vehicle.plate,
            rating: ride.driver.rating,
            photo: ride.driver.photo
          }}
        />
      )}

      <div className="bg-white shadow-lg p-4">
        <TripProgress
          details={{
            status: ride.status === 'in_progress' ? 'started' : 
                   ride.status === 'accepted' ? 'accepted' :
                   ride.status === 'arrived' ? 'arrived' : 'completed',
            eta: ride.estimatedArrival ? Math.round((new Date(ride.estimatedArrival).getTime() - Date.now()) / 60000) : undefined
          }}
        />
      </div>
    </div>
  );
}