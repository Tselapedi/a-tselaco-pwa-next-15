import React, { useState } from 'react';
import { postReview } from '@/lib/api';

interface RatingFormProps {
  rideId: string;
  driverName: string;
}

export default function RatingForm({ rideId, driverName }: RatingFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await postReview(rideId, { rating, comment });
      // Could add a success callback or state here if needed
    } catch (err) {
      setError('Failed to submit review. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Rate your ride with {driverName}</h3>
        <p className="text-sm text-gray-600">Your feedback helps improve our service</p>
      </div>

      {/* Star Rating */}
      <div className="flex justify-center space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            className={`text-3xl transition-colors ${
              star <= (hoveredStar || rating)
                ? 'text-primary-500'
                : 'text-gray-300 hover:text-primary-300'
            }`}
          >
            ★
          </button>
        ))}
      </div>

      {/* Comment Box */}
      <div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience (optional)"
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows={4}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || rating === 0}
        className="w-full py-3 px-4 bg-primary-500 text-white font-medium rounded-lg
                 disabled:opacity-50 disabled:cursor-not-allowed
                 hover:bg-primary-600 transition-colors"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Submitting...
          </div>
        ) : (
          'Submit Rating'
        )}
      </button>

      <div className="text-center text-sm text-gray-500">
        Your rating will be shared with {driverName}
      </div>
    </form>
  );
}