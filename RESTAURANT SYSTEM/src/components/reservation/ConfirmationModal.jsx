import { motion } from 'framer-motion';
import { FiCheckCircle, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import './ConfirmationModal.css';

export default function ConfirmationModal({ reservation, onClose }) {
  if (!reservation) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <motion.div
        className="modal-content"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="confirm-title"
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          <FiX />
        </button>
        <FiCheckCircle className="modal-icon" />
        <h2 id="confirm-title">Booking Confirmed!</h2>
        <p>Your table has been reserved successfully.</p>
        <ul className="confirm-details">
          <li><strong>Table:</strong> #{reservation.tableNumber}</li>
          <li><strong>Date:</strong> {reservation.date}</li>
          <li><strong>Time:</strong> {reservation.time}</li>
          <li><strong>Guests:</strong> {reservation.guests}</li>
        </ul>
        {reservation.birthdayOffer?.applied && (
          <p className="birthday-banner">🎉 Birthday Offer Applied — Free dessert + 15% off!</p>
        )}
        <div className="modal-actions">
          <Link to="/dashboard" className="btn btn-primary" onClick={onClose}>
            View Dashboard
          </Link>
          <button type="button" className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </motion.div>
    </div>
  );
}
