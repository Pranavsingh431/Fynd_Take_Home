'use client';

import { useState } from 'react';

interface ApiResponse {
  success: boolean;
  data?: {
    id: number;
    rating: number;
    userResponse: string;
    createdAt: string;
  };
  error?: string;
  message?: string;
  details?: Array<{ field: string; message: string }>;
}

export default function Home() {
  const [rating, setRating] = useState<number>(5);
  const [review, setReview] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setLoading(true);
    setResponse(null);
    setError(null);

    // Client-side validation
    if (!review.trim()) {
      setError('Please enter a review');
      setLoading(false);
      return;
    }

    if (review.trim().length < 10) {
      setError('Review must be at least 10 characters');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          review: review.trim(),
        }),
      });

      const data: ApiResponse = await res.json();

      if (!res.ok) {
        if (data.details) {
          setError(data.details.map(d => d.message).join(', '));
        } else {
          setError(data.message || data.error || 'Failed to submit review');
        }
        setLoading(false);
        return;
      }

      if (data.success && data.data) {
        setResponse(data.data.userResponse);
        // Clear form
        setReview('');
        setRating(5);
      }

    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const StarButton = ({ value }: { value: number }) => (
    <button
      type="button"
      onClick={() => setRating(value)}
      className={`text-4xl transition-transform hover:scale-110 ${
        value <= rating ? 'text-yellow-400' : 'text-gray-300'
      }`}
      aria-label={`${value} star${value !== 1 ? 's' : ''}`}
    >
      ★
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Share Your Experience
          </h1>
          <p className="text-gray-600">
            Your feedback helps us improve our service
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star Rating */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                How would you rate your experience?
              </label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((value) => (
                  <StarButton key={value} value={value} />
                ))}
              </div>
              <p className="text-center mt-2 text-sm text-gray-600">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            </div>

            {/* Review Text */}
            <div>
              <label htmlFor="review" className="block text-lg font-semibold text-gray-900 mb-3">
                Tell us more about your experience
              </label>
              <textarea
                id="review"
                rows={6}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your thoughts, suggestions, or concerns..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
                disabled={loading}
                maxLength={5000}
              />
              <div className="mt-2 flex justify-between text-sm text-gray-500">
                <span>{review.length} / 5000 characters</span>
                <span className="text-xs">Minimum 10 characters</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !review.trim()}
              className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Review'
              )}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Response */}
          {response && (
            <div className="mt-6 p-6 bg-green-50 border-l-4 border-green-500 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    Thank you for your feedback!
                  </h3>
                  <p className="text-sm text-green-700 leading-relaxed">{response}</p>
                  <button
                    onClick={() => setResponse(null)}
                    className="mt-4 text-sm text-green-700 hover:text-green-900 font-medium underline"
                  >
                    Submit another review
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Your feedback is valuable to us and helps improve our service.</p>
          <p className="mt-1">All reviews are processed with AI-powered sentiment analysis.</p>
        </div>
      </div>
    </div>
  );
}
