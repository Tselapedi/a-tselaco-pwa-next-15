import { useState } from 'react';
import { RewardPoints } from '@/lib/api';

interface RewardsCenterProps {
  points: RewardPoints;
  onRedeem: (points: number, purpose: string) => Promise<{ success: boolean }>;
}

export function RewardsCenter({ points, onRedeem }: RewardsCenterProps) {
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [selectedPoints, setSelectedPoints] = useState(0);

  const redeemOptions = [
    { points: 500, value: 5, description: '$5 ride credit' },
    { points: 1000, value: 12, description: '$12 ride credit' },
    { points: 2000, value: 25, description: '$25 ride credit' }
  ];

  const handleRedeem = async (points: number, description: string) => {
    try {
      setRedeeming(true);
      setRedeemError(null);
      const result = await onRedeem(points, description);
      if (!result.success) {
        setRedeemError('Failed to redeem points. Please try again.');
      }
    } catch (err) {
      setRedeemError('An error occurred while redeeming points.');
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Points Balance Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Current Balance</h2>
          <span className="text-2xl font-bold text-primary-600">
            {points.balance} pts
          </span>
        </div>
        {points.nextTier && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">
              {points.nextTier.pointsNeeded} more points until {points.nextTier.name}
            </p>
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-primary-500 rounded-full"
                style={{
                  width: `${(points.balance / (points.balance + points.nextTier.pointsNeeded)) * 100}%`
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Redeem Points Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Redeem Points</h2>
        
        {redeemError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {redeemError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {redeemOptions.map((option) => (
            <button
              key={option.points}
              onClick={() => handleRedeem(option.points, option.description)}
              disabled={points.balance < option.points || redeeming}
              className={`p-4 border rounded-lg text-center transition-colors ${
                points.balance >= option.points
                  ? 'border-primary-200 hover:border-primary-300 bg-primary-50 hover:bg-primary-100'
                  : 'border-gray-200 bg-gray-50 cursor-not-allowed'
              }`}
            >
              <div className="font-semibold text-lg mb-1">
                {option.points} pts
              </div>
              <div className="text-sm text-gray-600">
                {option.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        <div className="space-y-4">
          {points.transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0"
            >
              <div>
                <p className="font-medium">{transaction.description}</p>
                <p className="text-sm text-gray-500">
                  {new Date(transaction.timestamp).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`font-semibold ${
                  transaction.type === 'earned'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {transaction.type === 'earned' ? '+' : '-'}
                {transaction.points} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}