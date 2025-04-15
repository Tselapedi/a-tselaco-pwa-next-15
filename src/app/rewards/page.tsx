'use client';

import { useEffect, useState } from 'react';
import { getRewardPoints, redeemRewardPoints, RewardPoints } from '@/lib/api';
import BottomNav from '@/components/BottomNav';
import { RewardsCenter } from '@/components/RewardsCenter';

export default function RewardsPage() {
  const [rewardPoints, setRewardPoints] = useState<RewardPoints | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRewardPoints();
  }, []);

  const loadRewardPoints = async () => {
    try {
      setLoading(true);
      const response = await getRewardPoints();
      if (response.data) {
        setRewardPoints(response.data);
      }
    } catch (err) {
      setError('Failed to load reward points. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemPoints = async (points: number, purpose: string) => {
    try {
      const response = await redeemRewardPoints(points, purpose);
      if (response.data.success) {
        await loadRewardPoints(); // Refresh points after redemption
      }
      return response.data;
    } catch (err) {
      setError('Failed to redeem points. Please try again later.');
      return { success: false };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-lg mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-6">My Rewards</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {rewardPoints && (
          <RewardsCenter
            points={rewardPoints}
            onRedeem={handleRedeemPoints}
          />
        )}
      </div>
      <BottomNav />
    </div>
  );
}