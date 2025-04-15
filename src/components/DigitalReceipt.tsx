import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { DigitalReceipt as DigitalReceiptType, getRewardPoints } from '@/lib/api';

interface DigitalReceiptProps {
  receipt: DigitalReceiptType;
  onShare?: () => void;
  onDownload?: () => void;
}

export default function DigitalReceipt({ receipt, onShare, onDownload }: DigitalReceiptProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [rewardsEarned, setRewardsEarned] = useState<number>(0);
  const [showRewardsDetails, setShowRewardsDetails] = useState(false);

  useEffect(() => {
    generateQRCode();
    fetchRewardsDetails();
  }, [receipt]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const calculateTotal = () => {
    const baseAmount = receipt.amount;
    const surgeAmount = receipt.surgeMultiplier ? (receipt.amount * (receipt.surgeMultiplier - 1)) : 0;
    const discount = receipt.couponDiscount || 0;
    return baseAmount + surgeAmount - discount;
  };

  const generateQRCode = async () => {
    try {
      const receiptData = {
        id: receipt.id,
        rideId: receipt.rideId,
        amount: calculateTotal(),
        currency: receipt.currency,
        timestamp: receipt.timestamp,
        paymentMethod: receipt.paymentMethod
      };
      
      const qrUrl = await QRCode.toDataURL(JSON.stringify(receiptData));
      setQrCodeUrl(qrUrl);
    } catch (err) {
      console.error('Failed to generate QR code:', err);
    }
  };

  const fetchRewardsDetails = async () => {
    try {
      const response = await getRewardPoints();
      // Calculate rewards earned for this ride (example: 1 point per currency unit spent)
      const pointsEarned = Math.floor(calculateTotal());
      setRewardsEarned(pointsEarned);
    } catch (err) {
      console.error('Failed to fetch rewards:', err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <div className="border-b pb-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Digital Receipt</h2>
        <p className="text-gray-500 text-sm">{formatDate(receipt.timestamp)}</p>
      </div>

      <div className="space-y-4">
        {/* QR Code */}
        {qrCodeUrl && (
          <div className="flex justify-center mb-4">
            <div className="p-2 border rounded-lg">
              <img src={qrCodeUrl} alt="Receipt QR Code" className="w-48 h-48" />
              <p className="text-center text-sm text-gray-500 mt-2">
                Scan to verify receipt
              </p>
            </div>
          </div>
        )}

        {/* Rewards Section */}
        <div className={`p-4 rounded-lg ${showRewardsDetails ? 'bg-primary-50' : 'bg-gray-50'}`}>
          <button 
            onClick={() => setShowRewardsDetails(!showRewardsDetails)}
            className="w-full flex items-center justify-between"
          >
            <div>
              <h3 className="font-semibold text-gray-700">Rewards Earned</h3>
              <p className="text-primary-600 font-medium">+{rewardsEarned} points</p>
            </div>
            <svg 
              className={`w-5 h-5 transform transition-transform ${showRewardsDetails ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showRewardsDetails && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-sm text-gray-600">
                You earned {rewardsEarned} points for this ride! Points are calculated based on your fare amount.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Use your points for discounts on future rides or exclusive perks.
              </p>
            </div>
          )}
        </div>

        {/* Ride Details */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Ride Details</h3>
          <p className="text-gray-600">Receipt ID: {receipt.id}</p>
          <p className="text-gray-600">Ride ID: {receipt.rideId}</p>
        </div>

        {/* Payment Breakdown */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Payment Breakdown</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Fare</span>
              <span>{receipt.currency} {receipt.amount.toFixed(2)}</span>
            </div>

            {receipt.surgeMultiplier && receipt.surgeMultiplier > 1 && (
              <div className="flex justify-between text-amber-600">
                <span>Surge Price ({((receipt.surgeMultiplier - 1) * 100).toFixed(0)}%)</span>
                <span>+ {receipt.currency} {(receipt.amount * (receipt.surgeMultiplier - 1)).toFixed(2)}</span>
              </div>
            )}

            {receipt.couponDiscount && receipt.couponDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount {receipt.couponCode && `(${receipt.couponCode})`}</span>
                <span>- {receipt.currency} {receipt.couponDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{receipt.currency} {calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Split Payment Details */}
        {receipt.splitPayments && receipt.splitPayments.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Split Payment Details</h3>
            <div className="space-y-2">
              {receipt.splitPayments.map((split, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-600">{split.email}</span>
                  <div>
                    <span>{receipt.currency} {split.amount.toFixed(2)}</span>
                    <span className={`ml-2 text-sm ${
                      split.status === 'paid' ? 'text-green-600' :
                      split.status === 'declined' ? 'text-red-600' :
                      'text-amber-600'
                    }`}>
                      {split.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Method */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Payment Method</h3>
          <p className="text-gray-600 capitalize">{receipt.paymentMethod}</p>
        </div>

        {/* Status */}
        <div className={`text-center py-2 rounded-lg ${
          receipt.status === 'paid' ? 'bg-green-50 text-green-700' :
          receipt.status === 'failed' ? 'bg-red-50 text-red-700' :
          'bg-amber-50 text-amber-700'
        }`}>
          Payment Status: <span className="font-semibold capitalize">{receipt.status}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          {onShare && (
            <button
              onClick={onShare}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <span>Share</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
            </button>
          )}
          
          {onDownload && (
            <button
              onClick={onDownload}
              className="flex-1 py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center justify-center gap-2"
            >
              <span>Download</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}