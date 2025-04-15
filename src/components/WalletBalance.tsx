import { useState, useEffect } from 'react';
import { getWalletBalance, topUpWallet, WalletDetails } from '@/lib/api';

interface WalletBalanceProps {
  onClose?: () => void;
}

export default function WalletBalance({ onClose }: WalletBalanceProps) {
  const [walletDetails, setWalletDetails] = useState<WalletDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadWalletDetails();
  }, []);

  const loadWalletDetails = async () => {
    try {
      const response = await getWalletBalance();
      setWalletDetails(response.data);
    } catch (err) {
      setError('Failed to load wallet details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopUp = async () => {
    if (!topUpAmount || isNaN(Number(topUpAmount))) {
      setError('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await topUpWallet(Number(topUpAmount));
      const paymentWindow = window.open(response.data.paymentUrl, 'payment', 'width=500,height=600');
      
      // Add message to inform user
      if (paymentWindow) {
        setError('Please complete the payment in the opened window');
      } else {
        setError('Please enable pop-ups to complete the payment');
      }
    } catch (err) {
      setError('Failed to process top-up');
    } finally {
      setIsProcessing(false);
    }
  };

  const presetAmounts = [10, 20, 50, 100];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Wallet Balance</h2>
        {onClose && (
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {walletDetails && (
        <>
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-1">Available Balance</p>
            <p className="text-3xl font-bold text-primary-600">
              {walletDetails.currency} {walletDetails.balance.toFixed(2)}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Top Up Wallet</h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {presetAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTopUpAmount(amount.toString())}
                  className={`py-2 px-4 rounded-lg border transition-colors ${
                    topUpAmount === amount.toString()
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  {walletDetails.currency} {amount}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                placeholder="Enter amount"
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                onClick={handleTopUp}
                disabled={isProcessing || !topUpAmount}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Top Up'}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium mb-3">Recent Transactions</h3>
            {walletDetails.transactions.length > 0 ? (
              walletDetails.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(tx.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <p className={tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                    {tx.type === 'credit' ? '+' : '-'} {walletDetails.currency} {tx.amount.toFixed(2)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent transactions</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}