import { useEffect, useState } from 'react';
import { initiateCardPayment, checkPaymentStatus } from '@/lib/api';
import { PaymentDetails } from '@/types';

interface CardPaymentProcessorProps {
  rideId: string;
  paymentDetails: PaymentDetails;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export default function CardPaymentProcessor({
  rideId,
  paymentDetails,
  onSuccess,
  onError
}: CardPaymentProcessorProps) {
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        const response = await initiateCardPayment(rideId, paymentDetails);
        setTransactionId(response.data.transactionId);
        
        // Open payment gateway in a new window
        const paymentWindow = window.open(response.data.paymentUrl, 'payment', 'width=500,height=600');
        
        // Start polling for payment status
        if (paymentWindow && response.data.transactionId) {
          pollPaymentStatus(response.data.transactionId);
        }
      } catch (err) {
        onError('Failed to initialize payment');
      }
    };

    initializePayment();
  }, [rideId, paymentDetails]);

  const pollPaymentStatus = async (txId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    const interval = 5000; // 5 seconds

    const checkStatus = async () => {
      try {
        const response = await checkPaymentStatus(rideId, txId);
        
        if (response.data.status === 'success') {
          onSuccess();
          return;
        } else if (response.data.status === 'failed') {
          onError('Payment failed. Please try again.');
          return;
        }

        // Continue polling if still pending
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, interval);
        } else {
          onError('Payment timed out. Please try again.');
        }
      } catch (err) {
        onError('Error checking payment status');
      }
    };

    checkStatus();
  };

  return (
    <div className="fixed inset-0 bg-white z-50">
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
        <p className="text-gray-600 text-center">
          {isRedirecting
            ? 'Redirecting to secure payment gateway...'
            : 'Please complete the payment in the opened window'}
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Do not close this window while payment is being processed
        </p>
      </div>
    </div>
  );
}