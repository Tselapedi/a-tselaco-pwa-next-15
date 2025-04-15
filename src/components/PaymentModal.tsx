import { useState } from 'react';
import { PaymentMethod, PaymentDetails } from '@/types';
import { applyCoupon } from '@/lib/api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payment: PaymentDetails) => void;
  amount: number;
  currency: string;
  surgeMultiplier?: number;
}

export default function PaymentModal({
  isOpen,
  onClose,
  onSubmit,
  amount,
  currency,
  surgeMultiplier = 1
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('cash');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isCouponValid, setIsCouponValid] = useState(false);
  const [splitEmails, setSplitEmails] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const paymentMethods = [
    { id: 'cash' as PaymentMethod, name: 'Cash', icon: '💵' },
    { id: 'card' as PaymentMethod, name: 'Credit Card', icon: '💳' },
    { id: 'wallet' as PaymentMethod, name: 'E-Wallet', icon: '👝' },
    { id: 'split' as PaymentMethod, name: 'Split Payment', icon: '👥' },
  ];

  const finalAmount = (amount * surgeMultiplier) - couponDiscount;

  const handleSplitAdd = () => {
    setSplitEmails([...splitEmails, '']);
  };

  const handleSplitEmailChange = (index: number, value: string) => {
    const newEmails = [...splitEmails];
    newEmails[index] = value;
    setSplitEmails(newEmails);
  };

  const handleSplitRemove = (index: number) => {
    setSplitEmails(splitEmails.filter((_, i) => i !== index));
  };

  const handleCouponApply = async () => {
    if (!couponCode) return;
    setIsProcessing(true);
    setError('');
    
    try {
      const response = await applyCoupon(couponCode);
      if (response.data.valid) {
        setCouponDiscount(response.data.discount || 0);
        setIsCouponValid(true);
      } else {
        setError(response.data.message);
        setCouponDiscount(0);
        setIsCouponValid(false);
      }
    } catch (err) {
      setError('Failed to apply coupon');
      setCouponDiscount(0);
      setIsCouponValid(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = () => {
    const paymentDetails: PaymentDetails = {
      method: selectedMethod,
      amount: finalAmount,
      couponCode: isCouponValid ? couponCode : undefined,
      couponDiscount: couponDiscount,
      surgeMultiplier,
    };

    if (selectedMethod === 'split' && splitEmails.length > 0) {
      const splitAmount = finalAmount / (splitEmails.length + 1);
      paymentDetails.splitWith = splitEmails.map(email => ({
        email,
        amount: splitAmount,
        status: 'pending'
      }));
    }

    onSubmit(paymentDetails);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
          
          <div className="mb-6">
            <div className="text-2xl font-bold text-primary-600 mb-1">
              {currency} {finalAmount.toFixed(2)}
            </div>
            {surgeMultiplier > 1 && (
              <div className="text-sm text-amber-600 mb-2">
                Surge pricing {((surgeMultiplier - 1) * 100).toFixed(0)}% applied
              </div>
            )}
            <div className="text-sm text-gray-500">Total amount to pay</div>
          </div>

          {/* Coupon Code Section */}
          <div className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                className="flex-1 px-3 py-2 border rounded-lg"
                disabled={isCouponValid || isProcessing}
              />
              <button
                onClick={handleCouponApply}
                disabled={!couponCode || isProcessing || isCouponValid}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
              >
                Apply
              </button>
            </div>
            {error && <div className="text-sm text-red-500 mt-1">{error}</div>}
            {isCouponValid && (
              <div className="text-sm text-green-500 mt-1">
                Coupon applied! Discount: {currency} {couponDiscount.toFixed(2)}
              </div>
            )}
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full p-4 rounded-lg border transition-all ${
                  selectedMethod === method.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{method.icon}</span>
                  <span className="font-medium">{method.name}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Split Payment Section */}
          {selectedMethod === 'split' && (
            <div className="mt-4 space-y-3">
              <div className="text-sm text-gray-600">
                Add emails to split the payment with:
              </div>
              {splitEmails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleSplitEmailChange(index, e.target.value)}
                    placeholder="Enter email"
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                  <button
                    onClick={() => handleSplitRemove(index)}
                    className="px-3 py-2 text-red-500 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={handleSplitAdd}
                className="w-full py-2 px-4 border border-dashed border-primary-500 text-primary-500 rounded-lg hover:bg-primary-50"
              >
                + Add Person
              </button>
              {splitEmails.length > 0 && (
                <div className="text-sm text-gray-600">
                  Each person will pay: {currency} {(finalAmount / (splitEmails.length + 1)).toFixed(2)}
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedMethod === 'split' && splitEmails.length === 0}
              className="flex-1 py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}