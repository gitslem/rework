/**
 * Rating Display Component
 * Shows user ratings and review summary with star visualization
 */
import React, { useEffect, useState } from 'react';
import { reviewsAPI } from '@/lib/api';

interface RatingSummary {
  average_rating: number;
  total_reviews: number;
  min_rating: number | null;
  max_rating: number | null;
}

interface RatingDisplayProps {
  userId: number;
  showDetails?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  userId,
  showDetails = true,
  size = 'medium',
  className = '',
}) => {
  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRatingSummary = async () => {
      try {
        setLoading(true);
        const response = await reviewsAPI.getReviewSummary(userId);
        setSummary(response.data);
        setError(null);
      } catch (err: any) {
        setError('Failed to load ratings');
        console.error('Error fetching rating summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRatingSummary();
  }, [userId]);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    const starSize = {
      small: 'w-4 h-4',
      medium: 'w-5 h-5',
      large: 'w-6 h-6',
    }[size];

    return (
      <div className="flex items-center gap-0.5">
        {/* Full stars */}
        {[...Array(fullStars)].map((_, i) => (
          <svg
            key={`full-${i}`}
            className={`${starSize} text-yellow-400 fill-current`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        ))}

        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <svg
              className={`${starSize} text-gray-300`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              <svg
                className={`${starSize} text-yellow-400`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        )}

        {/* Empty stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <svg
            key={`empty-${i}`}
            className={`${starSize} text-gray-300`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-pulse flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`bg-gray-200 rounded ${size === 'small' ? 'w-4 h-4' : size === 'medium' ? 'w-5 h-5' : 'w-6 h-6'}`} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className={`text-gray-400 text-sm ${className}`}>
        No ratings yet
      </div>
    );
  }

  const textSize = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  }[size];

  const avgRating = summary.average_rating || 0;
  const totalReviews = summary.total_reviews || 0;

  if (totalReviews === 0) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`${size === 'small' ? 'w-4 h-4' : size === 'medium' ? 'w-5 h-5' : 'w-6 h-6'} text-gray-300`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          ))}
        </div>
        <span className={`${textSize} text-gray-500`}>No reviews yet</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {renderStars(avgRating)}

      <div className="flex items-baseline gap-1">
        <span className={`${textSize} font-semibold text-gray-900`}>
          {avgRating.toFixed(1)}
        </span>
        {showDetails && (
          <span className={`${size === 'small' ? 'text-xs' : 'text-sm'} text-gray-500`}>
            ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
          </span>
        )}
      </div>
    </div>
  );
};

export default RatingDisplay;
