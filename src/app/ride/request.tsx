'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getZones, findFareAndDistance, createRide, applyCoupon, Zone, FareResponse } from '@/lib/api';
import { Location, VehicleType, PaymentMethod, PaymentDetails } from '@/types';
import Map from '@/components/Map';
import RideOptions from '@/components/RideOptions';
import PaymentModal from '@/components/PaymentModal';
import BottomNav from '@/components/BottomNav';

interface RideFormState {
  pickup: Location | null;
  destination: Location | null;
  vehicleType: VehicleType;
  paymentMethod: PaymentMethod;
  couponCode?: string;
}

interface ErrorState {
  message: string;
  code?: string;
}

export default function RideRequestPage() {
  const router = useRouter();
  const [formState, setFormState] = useState<RideFormState>({
    pickup: null,
    destination: null,
    vehicleType: 'standard',
    paymentMethod: 'cash'
  });

  const [zones, setZones] = useState<Zone[]>([]);
  const [fareDetails, setFareDetails] = useState<FareResponse | null>(null);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    zones: false,
    fare: false,
    creation: false,
    coupon: false
  });
  const [error, setError] = useState<ErrorState | null>(null);

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    setLoadingStates(prev => ({ ...prev, zones: true }));
    try {
      const response = await getZones();
      setZones(response.data);
    } catch (err: any) {
      setError({
        message: 'Failed to load service zones',
        code: err.code
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, zones: false }));
    }
  };

  const handleLocationSelect = async (
    type: 'pickup' | 'destination',
    location: Location
  ) => {
    const newFormState = {
      ...formState,
      [type]: location
    };
    setFormState(newFormState);

    // Only calculate fare if both locations are set
    if (newFormState.pickup && newFormState.destination) {
      await calculateFare(newFormState);
    }
  };

  const calculateFare = async (data: RideFormState) => {
    if (!data.pickup || !data.destination) return;

    setLoadingStates(prev => ({ ...prev, fare: true }));
    setError(null);

    try {
      const response = await findFareAndDistance({
        pickup: data.pickup,
        destination: data.destination,
        vehicleType: data.vehicleType,
        paymentMethod: data.paymentMethod,
        couponCode: data.couponCode
      });
      setFareDetails(response.data);
    } catch (err: any) {
      setError({
        message: 'Failed to calculate fare',
        code: err.code
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, fare: false }));
    }
  };

  const handleVehicleSelect = async (type: VehicleType) => {
    const newFormState = {
      ...formState,
      vehicleType: type
    };
    setFormState(newFormState);

    if (newFormState.pickup && newFormState.destination) {
      await calculateFare(newFormState);
    }
  };

  const handlePaymentSelect = (paymentDetails: PaymentDetails) => {
    const newFormState = {
      ...formState,
      paymentMethod: paymentDetails.method,
      couponCode: paymentDetails.couponCode
    };
    setFormState(newFormState);
    setPaymentModalOpen(false);

    if (newFormState.pickup && newFormState.destination) {
      calculateFare(newFormState);
    }
  };

  const handleCreateRide = async () => {
    if (!formState.pickup || !formState.destination || !fareDetails) {
      setError({
        message: 'Please select both pickup and destination locations',
        code: 'VALIDATION_ERROR'
      });
      return;
    }

    setLoadingStates(prev => ({ ...prev, creation: true }));
    setError(null);

    try {
      const response = await createRide({
        pickup: formState.pickup,
        destination: formState.destination,
        vehicleType: formState.vehicleType,
        paymentMethod: formState.paymentMethod,
        couponCode: formState.couponCode
      });

      router.push(`/ride/tracking?rideId=${response.data.rideId}`);
    } catch (err: any) {
      setError({
        message: err.response?.data?.message || 'Failed to create ride',
        code: err.code
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, creation: false }));
    }
  };

  const ErrorMessage = ({ error }: { error: ErrorState }) => (
    <div className="fixed top-4 left-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 z-50">
      <p className="text-red-700">{error.message}</p>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {error && <ErrorMessage error={error} />}

      <div className="flex-1 relative">
        <Map
          center={formState.pickup ? [formState.pickup.lat, formState.pickup.lng] : [-1.2921, 36.8219]}
          zones={zones}
          pickup={formState.pickup}
          destination={formState.destination}
          onLocationSelect={handleLocationSelect}
        />
      </div>

      {fareDetails && (
        <>
          <RideOptions 
            onSelect={handleVehicleSelect}
            fareDetails={{
              fare: fareDetails.fare,
              distance: fareDetails.distance,
              duration: fareDetails.duration,
              currency: fareDetails.currency
            }}
            selected={formState.vehicleType}
          />
          <div className="p-4">
            <button
              onClick={() => setPaymentModalOpen(true)}
              className="w-full py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              Continue to Payment
            </button>
          </div>
        </>
      )}

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSubmit={handlePaymentSelect}
        amount={fareDetails?.fare || 0}
        currency={fareDetails?.currency || 'USD'}
        surgeMultiplier={fareDetails?.surgeMultiplier}
      />

      <BottomNav />
    </div>
  );
}