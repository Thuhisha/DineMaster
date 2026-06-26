import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { mainApi } from '../services/api';
import './Receipt.css';

export default function Receipt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleDownload = () => {
    window.print();
  };

  useEffect(() => {
    if (id === 'undefined' || !id) {
      navigate('/dashboard');
      return;
    }
    
    const fetchReservation = async () => {
      try {
        const res = await mainApi.getReservationById(id);
        setReservation(res);
      } catch (err) {
        console.error('Failed to load reservation', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReservation();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="receipt-page">
        <div className="receipt-loader">Generating Receipt...</div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="receipt-page error">
        <h2>Receipt Not Found</h2>
        <button className="btn primary" onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="receipt-page">
      <motion.div 
        className="receipt-card"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="receipt-header">
          <div className="success-icon">✓</div>
          <h2>Payment Successful!</h2>
          <p>Thank you for dining with DineMaster</p>
        </div>

        <div className="receipt-body">
          <div className="receipt-row">
            <span>Order ID</span>
            <strong>{reservation.id}</strong>
          </div>
          <div className="receipt-row">
            <span>Date & Time</span>
            <strong>{new Date(reservation.date).toLocaleString()}</strong>
          </div>
          <div className="receipt-row">
            <span>Name</span>
            <strong>{reservation.name}</strong>
          </div>
          <div className="receipt-row">
            <span>Payment Method</span>
            <strong style={{ textTransform: 'capitalize' }}>
              {reservation.paymentMethod === 'razorpay' ? 'Online Payment' : 'Pay at Restaurant'}
            </strong>
          </div>
          
          {reservation.reference && (
            <div className="receipt-row">
              <span>Transaction Ref</span>
              <strong>{reservation.reference}</strong>
            </div>
          )}

          <div className="divider"></div>

          <div className="receipt-total">
            <span>Total Amount Paid</span>
            <span className="amount">₹{reservation.totalAmount}</span>
          </div>
        </div>

        <div className="receipt-footer no-print">
          <button className="btn secondary" onClick={() => navigate('/dashboard')}>
            View Dashboard
          </button>
          <button className="btn primary" onClick={handlePrint}>
            Download Receipt (PDF)
          </button>
        </div>
      </motion.div>
    </div>
  );
}
