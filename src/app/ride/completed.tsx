'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getRideDetails, getRidePayment, getDigitalReceipt, processWalletPayment } from '@/lib/api';
import type { RideDetails, DigitalReceipt as DigitalReceiptType } from '@/lib/api';
import { PaymentDetails } from '@/types';
import PaymentModal from '@/components/PaymentModal';
import CardPaymentProcessor from '@/components/CardPaymentProcessor';
import DigitalReceipt from '@/components/DigitalReceipt';
import RatingForm from '@/components/RatingForm';
import WalletBalance from '@/components/WalletBalance';

export default function CompletedRidePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rideId = searchParams.get('rideId');

  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isProcessingCard, setProcessingCard] = useState(false);
  const [isWalletModalOpen, setWalletModalOpen] = useState(false);
  const [receipt, setReceipt] = useState<DigitalReceiptType | null>(null);
  const [rideDetails, setRideDetails] = useState<RideDetails | null>(null);
  const [currentPaymentDetails, setCurrentPaymentDetails] = useState<PaymentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!rideId) {
      router.push('/');
      return;
    }

    const loadRideAndPayment = async () => {
      try {
        const [rideResponse, paymentResponse] = await Promise.all([
          getRideDetails(rideId),
          getRidePayment(rideId)
        ]);

        setRideDetails(rideResponse.data);

        if (paymentResponse.data.status === 'completed') {
          const receiptResponse = await getDigitalReceipt(rideId);
          setReceipt(receiptResponse.data);
        } else if (paymentResponse.data.status === 'pending') {
          setPaymentModalOpen(true);
        }
      } catch (err) {
        setError('Failed to load ride details');
      }
    };

    loadRideAndPayment();
  }, [rideId]);

  const handlePaymentSubmit = async (paymentDetails: PaymentDetails) => {
    setCurrentPaymentDetails(paymentDetails);
    setPaymentModalOpen(false);

    switch (paymentDetails.method) {
      case 'card':
        setProcessingCard(true);
        break;
      
      case 'wallet':
        try {
          const response = await processWalletPayment(rideId!, paymentDetails);
          if (response.data.success && response.data.receipt) {
            setReceipt(response.data.receipt);
          } else {
            setError(response.data.message || 'Wallet payment failed');
            setPaymentModalOpen(true);
          }
        } catch (err) {
          setError('Failed to process wallet payment');
          setPaymentModalOpen(true);
        }
        break;

      case 'split':
        // Handle split payments - the modal will handle sending invites
        break;

      case 'cash':
        // Mark as paid immediately for cash payments
        try {
          const receiptResponse = await getDigitalReceipt(rideId!);
          setReceipt(receiptResponse.data);
        } catch (err) {
          setError('Failed to load receipt');
        }
        break;
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      const receiptResponse = await getDigitalReceipt(rideId!);
      setReceipt(receiptResponse.data);
      setProcessingCard(false);
    } catch (err) {
      setError('Failed to load receipt');
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
    setProcessingCard(false);
    setPaymentModalOpen(true);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Ride Receipt',
          text: `Receipt for ride ${rideId}`,
          url: window.location.href
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  const handleDownload = () => {
    window.open(`/api/receipts/${rideId}/download`, '_blank');
  };

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {receipt ? (
        <div className="space-y-6">
          <DigitalReceipt
            receipt={receipt}
            onShare={handleShare}
            onDownload={handleDownload}
          />
          {rideDetails?.driver && (
            <RatingForm
              rideId={rideId!}
              driverName={rideDetails.driver.name}
            />
          )}
        </div>
      ) : isProcessingCard && currentPaymentDetails ? (
        <CardPaymentProcessor
          rideId={rideId!}
          paymentDetails={currentPaymentDetails}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      )}

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSubmit={handlePaymentSubmit}
        amount={receipt?.amount || 0}
        currency={receipt?.currency || 'USD'}
        surgeMultiplier={receipt?.surgeMultiplier}
      />

      {isWalletModalOpen && (
        <WalletBalance onClose={() => setWalletModalOpen(false)} />
      )}
    </div>
  );
}