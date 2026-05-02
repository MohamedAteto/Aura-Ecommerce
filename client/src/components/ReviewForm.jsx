import { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/client';
import './ReviewForm.css';

export function ReviewForm({ productId, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setErr('Please select a rating.'); return; }
    setErr(null);
    setLoading(true);
    try {
      await api.post(`/api/Products/${productId}/reviews`, { rating, comment });
      onSubmitted?.();
    } catch (ex) {
      setErr(ex?.response?.data?.message || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      className="review-form"
      onSubmit={submit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h4 className="review-form__title">Write a review</h4>
      <div className="review-form__stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className="review-form__star-btn"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
          >
            <Star
              size={24}
              fill={(hover || rating) >= n ? '#fbbf24' : 'none'}
              color={(hover || rating) >= n ? '#fbbf24' : 'var(--line-bright)'}
              strokeWidth={1.5}
            />
          </button>
        ))}
        <span className="review-form__rating-label">
          {rating > 0 ? ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating] : 'Select rating'}
        </span>
      </div>
      <textarea
        className="review-form__textarea"
        placeholder="Share your experience (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={1000}
        rows={3}
      />
      {err && <p className="form-error">{err}</p>}
      <button type="submit" className="btn btn--primary" disabled={loading}>
        {loading ? 'Submitting…' : 'Submit review'}
      </button>
    </motion.form>
  );
}
