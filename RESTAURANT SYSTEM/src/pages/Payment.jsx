import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import './Payment.css';

export default function Payment() {
  const navigate = useNavigate();
  const { pendingCheckout, completeReservation, formatINR } = useApp();
  const [method, setMethod] = useState('upi');
  const [loading, setLoading] = useState(false);

  if (!pendingCheckout) {
    return (
      <div className="container page-header">
        <h1>No payment pending</h1>
        <p>Please start a reservation first.</p>
        <Link className="btn btn-primary" to="/reserve">Reserve Table</Link>
      </div>
    );
  }

  const { details, table, cartItems, pricing, birthdayOffer } = pendingCheckout;

  const handlePay = async () => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 900));
      const result = completeReservation({
        method,
        reference: `TXN-${Date.now()}`,
      });
      
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success('Payment successful. Reservation confirmed!');
      navigate('/reservation-success', { state: { reservationId: result.reservation.id } });
    } catch (error) {
      toast.error('Payment failed. Please try again.');
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-page">
      <header className="page-header">
        <h1>Online Payment</h1>
        <p>Step 4 of 4 - confirm reservation with secure payment</p>
      </header>
      <div className="container payment-grid">
        <section className="card payment-summary">
          <h3>Payment Summary</h3>
          <p><strong>Location:</strong> {details.branchId}</p>
          <p><strong>Date & Time:</strong> {details.date} - {details.time}</p>
          <p><strong>Table:</strong> #{table.number}</p>
          <p><strong>Guests:</strong> {details.guests}</p>
          <hr />
          {cartItems.map((i) => (
            <div key={i.id} className="line">
              <span>{i.name} x {i.qty}</span>
              <span>{formatINR(i.qty * i.price)}</span>
            </div>
          ))}
          <div className="line"><span>Subtotal</span><span>{formatINR(pricing.subtotal)}</span></div>
          <div className="line"><span>Tax (5%)</span><span>{formatINR(pricing.taxes)}</span></div>
          <div className="line discount"><span>Discount</span><span>-{formatINR(pricing.discount)}</span></div>
          <div className="line grand"><span>Total</span><span>{formatINR(pricing.total)}</span></div>
          {birthdayOffer.applied && <p className="birthday-note">🎉 Birthday Offer Applied</p>}
          {pricing.reward && <p className="reward-note">Reward: {pricing.reward}</p>}
        </section>

        <motion.section className="card payment-methods" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <h3>Select Payment Method</h3>
          <label><input type="radio" checked={method === 'upi'} onChange={() => setMethod('upi')} /> UPI</label>
          <label><input type="radio" checked={method === 'card'} onChange={() => setMethod('card')} /> Credit / Debit Card</label>
          <label><input type="radio" checked={method === 'netbanking'} onChange={() => setMethod('netbanking')} /> Net Banking</label>
          <div className="mock-fields">
            <input placeholder="Transaction Name" defaultValue={details.name} />
            <input placeholder="Email" defaultValue={details.email} />
            <input placeholder="Phone" defaultValue={details.phone} />
          </div>
          <button className="btn btn-primary btn-full" onClick={handlePay} disabled={loading}>
            {loading ? 'Processing Payment...' : `Pay ${formatINR(pricing.total)}`}
          </button>
        </motion.section>
      </div>
    </div>
  );
}
