import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, ThumbsUp, MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const INITIAL_REVIEWS_SEED = [
  {
    id: 1,
    userName: 'Aarav Sharma',
    rating: 5,
    date: '2 days ago',
    verified: true,
    comment: 'Exceptional build quality! Delivered promptly via Cash on Delivery. Truly worth every rupee, kids loved it.',
  },
  {
    id: 2,
    userName: 'Pooja Patel',
    rating: 5,
    date: '1 week ago',
    verified: true,
    comment: 'Very happy with the finish and packaging. Looks exactly like the photos on Ilahi Retail. Highly recommended!',
  },
  {
    id: 3,
    userName: 'Mohammed Rehan',
    rating: 4,
    date: '2 weeks ago',
    verified: true,
    comment: 'Great value for money. Sturdy and well-crafted. Delivery person was polite and verified the package before taking cash.',
  },
];

export const ProductReviews = ({ productId, productName }) => {
  const { user, isAuthenticated } = useAuthStore();
  const storageKey = `ilahi_reviews_${productId}`;

  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_REVIEWS_SEED;
  });

  const [isWriting, setIsWriting] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const averageRating = (
    reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)
  ).toFixed(1);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please write a brief comment');
      return;
    }

    const newReview = {
      id: Date.now(),
      userName: user?.name || 'Anonymous Customer',
      rating,
      date: 'Just now',
      verified: true,
      comment: comment.trim(),
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    toast.success('Thank you! Your verified review was posted.', { icon: '⭐' });
    setComment('');
    setIsWriting(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-sm space-y-10">
      {/* Header & Stats Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center space-x-2">
            <span>Customer Ratings & Reviews</span>
            <span className="text-sm font-semibold text-gray-400">({reviews.length})</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">Verified feedback from real customers</p>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="text-4xl font-black text-gray-900">{averageRating}</div>
            <div className="flex items-center justify-center space-x-0.5 text-amber-400 my-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(Number(averageRating))
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-[11px] text-gray-400">{reviews.length} reviews</p>
          </div>

          <div className="h-14 w-px bg-gray-200 hidden sm:block" />

          <button
            onClick={() => setIsWriting(!isWriting)}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-2 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{isWriting ? 'Cancel Review' : 'Write a Review'}</span>
          </button>
        </div>
      </div>

      {/* Write Review Form */}
      {isWriting && (
        <form onSubmit={handleSubmitReview} className="bg-gray-50/80 rounded-2xl p-6 border border-emerald-100 space-y-4">
          <h3 className="font-bold text-sm text-gray-900">Share your thoughts on {productName}</h3>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Your Rating *</label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 focus:outline-none cursor-pointer"
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-gray-700 ml-2">
                {hoverRating || rating} out of 5 stars
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Your Review *</label>
            <textarea
              rows={3}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like about this product? How was the packaging and delivery?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none text-xs bg-white"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsWriting(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Review</span>
            </button>
          </div>
        </form>
      )}

      {/* Review List */}
      <div className="space-y-6 divide-y divide-gray-100">
        {reviews.map((rev) => (
          <div key={rev.id} className="pt-6 first:pt-0 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                  {rev.userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs sm:text-sm text-gray-900">{rev.userName}</span>
                    {rev.verified && (
                      <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-400">{rev.date}</span>
                </div>
              </div>

              {/* Star Rating */}
              <div className="flex items-center space-x-0.5 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pl-10">
              {rev.comment}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductReviews;
