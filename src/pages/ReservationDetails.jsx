import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { sameDate, formatINR } from '../data/initialData';
import CountdownTimer from '../components/reservation/CountdownTimer';
import './ReservationDetails.css';

export default function ReservationDetails() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pendingReservation, locations, tables, startCheckout, completeReservation } = useApp();
  const { cart, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    specialRequests: '',
  });

  // Log when tables change to ensure we're getting live data
  useEffect(() => {
    console.log('[ReservationDetails] Tables updated:', tables.length);
    console.log('[ReservationDetails] Available tables:', tables.filter(t => t.status === 'available').length);
  }, [tables]);

  if (!pendingReservation) {
    return (
      <div className="container page-header">
        <h1>No reservation in progress</h1>
        <p>Please start by selecting date and time.</p>
        <Link to="/reserve" className="btn btn-primary">Start Reservation</Link>
      </div>
    );
  }

  const branch = locations.find((b) => b.id === pendingReservation.branchId);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to complete booking');
      navigate('/login', { state: { from: '/reservation-details' } });
      return;
    }
    
    // Validate form fields
    if (!form.name || !form.email || !form.phone) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (form.phone && form.phone.length !== 10) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 600));

      const payload = { ...pendingReservation, ...form };
      const res = await startCheckout(user.id, payload, cart);
    
      if (res.ok) {
        setLoading(false);
        navigate('/payment');
      } else {
        setLoading(false);
        toast.error(res.message);
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="res-details-page">
      <header className="page-header">
        <h1>Reservation Details</h1>
        <p>Step 3 of 4 — Customer details & booking summary</p>
      </header>

      <div className="container res-details-grid">
        <aside className="booking-summary card">
          <h3>Booking Summary</h3>
          <ul>
            <li><strong>Branch:</strong> {branch?.name}</li>
            <li><strong>Location:</strong> {branch?.city}</li>
            {branch?.address && <li><strong>Address:</strong> {branch?.address}</li>}
            {branch?.phone && <li><strong>Phone:</strong> {branch?.phone}</li>}
            {branch?.email && <li><strong>Email:</strong> {branch?.email}</li>}
            <li><strong>Date:</strong> {pendingReservation.date}</li>
            <li><strong>Time:</strong> {pendingReservation.time}</li>
            <li><strong>Guests:</strong> {pendingReservation.guests}</li>
          </ul>
          <CountdownTimer
            targetDate={pendingReservation.date}
            targetTime={pendingReservation.time}
          />
          {cart.length > 0 && (
            <div className="summary-cart">
              <h4>Pre-order ({cart.length} items)</h4>
              {cart.map((i) => (
                <div key={i.id} className="summary-line">
                  <span>{i.name} × {i.qty}</span>
                  <span>{formatINR(i.price * i.qty)}</span>
                </div>
              ))}
              <p className="summary-total">Subtotal: {formatINR(cartTotal)}</p>
            </div>
          )}
          {cart.length === 0 && (
            <div className="mandatory-food-section" style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
              <h4>Food Pre-order (Optional)</h4>
              <p className="food-hint" style={{ fontSize: '0.9em', color: '#aaa', margin: '5px 0 10px' }}>You haven't added any food items. You can order at the restaurant or pre-order now.</p>
              <Link to="/menu" className="btn btn-outline btn-full btn-sm">
                Browse Menu
              </Link>
            </div>
          )}
        </aside>

        <motion.form
          className="res-form card"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={(e) => {
                const numericValue = e.target.value.replace(/\D/g, '');
                setForm({ ...form, phone: numericValue });
              }}
              maxLength={10}
              minLength={10}
              pattern="[0-9]{10}"
              title="Phone number must be exactly 10 digits"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="specialRequests">Special Requests</label>
            <textarea
              id="specialRequests"
              name="specialRequests"
              rows={3}
              value={form.specialRequests}
              onChange={handleChange}
              placeholder="Allergies, seating preference, celebration..."
            />
          </div>
          {!user && (
            <p className="login-hint">
              <Link to="/login">Login</Link> or <Link to="/register">Register</Link> to confirm booking.
            </p>
          )}
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Processing...' : 'Confirm Reservation'}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
