'use client';

import { useState, useEffect } from 'react';

interface Review {
  id: number;
  rating: number;
  reviewText: string;
  userResponse: string;
  adminSummary: string;
  recommendedAction: string;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  data?: {
    reviews: Review[];
    stats: { [key: number]: number };
    total: number;
  };
  error?: string;
}

export default function AdminDashboard() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<{ [key: number]: number }>({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const fetchReviews = async (rating?: number) => {
    setLoading(true);
    setError(null);

    try {
      const url = rating 
        ? `${API_URL}/api/reviews?rating=${rating}`
        : `${API_URL}/api/reviews`;
      
      const res = await fetch(url);
      const data: ApiResponse = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch reviews');
      }

      if (data.success && data.data) {
        setReviews(data.data.reviews);
        setStats(data.data.stats);
        setTotal(data.data.total);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchReviews(selectedRating || undefined), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleFilterChange = (rating: number | null) => {
    setSelectedRating(rating);
    fetchReviews(rating || undefined);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating <= 2) return 'text-red-600 bg-red-100';
    if (rating === 3) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const StarDisplay = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= rating ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">Review management and analytics</p>
            </div>
            <button
              onClick={() => fetchReviews(selectedRating || undefined)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          {/* Total */}
          <div 
            className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-all ${
              selectedRating === null ? 'ring-2 ring-indigo-500' : 'hover:shadow-md'
            }`}
            onClick={() => handleFilterChange(null)}
          >
            <div className="text-2xl font-bold text-gray-900">{Object.values(stats).reduce((a, b) => a + b, 0)}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>

          {/* Per Rating */}
          {[1, 2, 3, 4, 5].map((rating) => (
            <div
              key={rating}
              className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-all ${
                selectedRating === rating ? 'ring-2 ring-indigo-500' : 'hover:shadow-md'
              }`}
              onClick={() => handleFilterChange(rating)}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="text-2xl font-bold text-gray-900">{stats[rating] || 0}</div>
                <StarDisplay rating={rating} />
              </div>
              <div className="text-sm text-gray-600">{rating} Star{rating !== 1 ? 's' : ''}</div>
            </div>
          ))}
        </div>

        {/* Filter Info */}
        {selectedRating && (
          <div className="mb-4 flex items-center justify-between bg-indigo-50 p-3 rounded-lg">
            <span className="text-sm text-indigo-900">
              Showing {selectedRating}-star reviews only
            </span>
            <button
              onClick={() => handleFilterChange(null)}
              className="text-sm text-indigo-700 hover:text-indigo-900 font-medium"
            >
              Clear filter
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading reviews...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Reviews Table */}
        {!loading && !error && (
          <>
            {reviews.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No reviews yet</h3>
                <p className="mt-1 text-sm text-gray-500">Reviews will appear here once users submit them.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rating
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Review
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          AI Summary
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Recommended Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reviews.map((review) => (
                        <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col items-center">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getRatingColor(review.rating)}`}>
                                {review.rating}
                              </span>
                              <StarDisplay rating={review.rating} />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-md">
                              <p className="line-clamp-3">{review.reviewText}</p>
                              {review.reviewText.length > 150 && (
                                <button className="text-indigo-600 hover:text-indigo-800 text-xs mt-1">
                                  Read more
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700 max-w-xs">
                              <p className="line-clamp-2">{review.adminSummary}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700 max-w-xs">
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {review.recommendedAction}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(review.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Showing <span className="font-medium">{reviews.length}</span> review{reviews.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
