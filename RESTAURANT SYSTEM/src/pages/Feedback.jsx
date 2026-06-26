import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiStar } from 'react-icons/fi';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import './Feedback.css';

export default function Feedback() {
  const { addFeedback, feedbackList } = useApp();
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please write your feedback');
      return;
    }
    addFeedback({
      name: user?.name || 'Guest',
      rating,
      message: message.trim(),
    });
    setMessage('');
    toast.success('Thank you for your feedback!');
  };

  return (
    <div className="feedback-page">
      <header className="page-header">
        <h1>Customer Feedback</h1>
        <p>Share your DineMaster experience</p>
      </header>

      <div className="container feedback-grid">
        <motion.form className="feedback-form card" onSubmit={handleSubmit} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="form-group">
            <label>Rating</label>
            <div className="star-picker">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={n <= rating ? 'active' : ''}
                  onClick={() => setRating(n)}
                  aria-label={`${n} stars`}
                >
                  <FiStar />
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="message">Your Feedback</label>
            <textarea
              id="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us about your visit..."
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full">Submit Feedback</button>
        </motion.form>

        <section className="feedback-list">
          <h2>Recent Reviews</h2>
          {feedbackList.length === 0 ? (
            <p className="empty">Be the first to leave a review!</p>
          ) : (
            [...feedbackList].reverse().slice(0, 8).map((f) => (
              <article key={f.id} className="feedback-item card">
                <div className="feedback-stars">
                  {Array.from({ length: f.rating }).map((_, i) => (
                    <FiStar key={i} />
                  ))}
                </div>
                <p>{f.message}</p>
                <footer>— {f.name}</footer>
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
