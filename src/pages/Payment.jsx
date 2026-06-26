import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { useCart } from '../context/CartContext';
import './Payment.css';

export default function Payment() {
  const navigate = useNavigate();
  const { pendingCheckout, completeReservation, formatINR, locations } = useApp();
  const { clearCart } = useCart();
  const [method, setMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Dynamically load Razorpay script only on the payment page
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

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
  const locationName = locations?.find((l) => l.id === details.branchId)?.name || details.branchId;

  const handlePay = async () => {
    setLoading(true);
    try {
      if (method === 'cod') {
        const result = await completeReservation({
          method: 'cod',
          reference: `COD-${Date.now()}`
        });
        
        if (!result.ok) {
          toast.error(result.message);
          setLoading(false);
          return;
        }
        toast.success('Reservation confirmed with Pay at Restaurant!');
        clearCart();
        navigate('/reservation-success', { state: { reservationId: result.reservation.id } });
        return;
      }

      // 1. Create Order on backend
      const { mainApi } = await import('../services/api');
      const orderRes = await mainApi.createPaymentOrder(pricing.total, `RCPT-${Date.now()}`);

      if (!orderRes || !orderRes.razorpayOrderId) {
        throw new Error('Failed to create Razorpay order');
      }

      // 2. Configure Mock Razorpay
      const options = {
        key: 'rzp_test_T0DYTF45Ar9eUL',
        amount: pricing.total * 100,
        currency: 'INR',
        name: 'DineMaster',
        description: 'Table Reservation & Food Order',
        order_id: orderRes.razorpayOrderId,
        handler: async function (response) {
          try {
            // Bypass backend verification if this is from our MockRazorpay
            if (response.razorpay_payment_id && response.razorpay_payment_id.startsWith('pay_mock_')) {
              const result = await completeReservation({
                method,
                reference: response.razorpay_payment_id,
              });
              
              if (!result.ok) {
                toast.error(result.message);
                setLoading(false);
                return;
              }
              toast.success('Payment successful. Reservation confirmed!');
              clearCart();
              navigate('/reservation-success', { state: { reservationId: result.reservation.id } });
              return;
            }

            // 3. Verify Real Payment (fallback)
            const verifyRes = await mainApi.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyRes.status === 'success') {
              // 4. Complete reservation
              const result = await completeReservation({
                method,
                reference: response.razorpay_payment_id,
              });
              
              if (!result.ok) {
                toast.error(result.message);
                setLoading(false);
                return;
              }
              toast.success('Payment successful. Reservation confirmed!');
              clearCart();
              navigate('/reservation-success', { state: { reservationId: result.reservation.id } });
            } else {
              toast.error('Payment verification failed.');
              setLoading(false);
            }
          } catch (err) {
            toast.error('Payment verification failed.');
            console.error('Verification error:', err);
            setLoading(false);
          }
        },
        prefill: {
          name: details.name,
          email: details.email,
          contact: details.phone,
        },
        theme: {
          color: '#c9a227',
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        toast.error('Payment failed: ' + response.error.description);
        setLoading(false);
      });
      rzp.open();

    } catch (error) {
      toast.error('Failed to initiate payment.');
      console.error('Payment error:', error);
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
          <p><strong>Location:</strong> {locationName}</p>
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
          {birthdayOffer.applied && <p className="birthday-note">🎉 Happy Birthday! A 50% Birthday Discount has been applied to your reservation.</p>}
          {pricing.reward && <p className="reward-note">Reward: {pricing.reward}</p>}
        </section>

        <motion.section className="card payment-methods" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <h3>Select Payment Method</h3>
          <label><input type="radio" checked={method === 'razorpay'} onChange={() => setMethod('razorpay')} /> Razorpay</label>
          <label><input type="radio" checked={method === 'cod'} onChange={() => setMethod('cod')} /> Cash on Delivery (Pay at Restaurant)</label>
          <div className="mock-fields">
            <input placeholder="Transaction Name" defaultValue={details.name} />
            <input placeholder="Email" defaultValue={details.email} />
            <input placeholder="Phone" defaultValue={details.phone} readOnly />
          </div>
          <button className="btn btn-primary btn-full" onClick={handlePay} disabled={loading}>
            {loading ? 'Processing Payment...' : `Pay ${formatINR(pricing.total)}`}
          </button>
        </motion.section>
      </div>
    </div>
  );
}
