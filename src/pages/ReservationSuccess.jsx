import { useMemo, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useCart } from '../context/CartContext';
import './ReservationSuccess.css';

export default function ReservationSuccess() {
  const location = useLocation();
  const { reservations, orders, locations, formatINR } = useApp();
  const { clearCart } = useCart();

  const reservationId = location.state?.reservationId;
  const reservation = useMemo(() => reservations.find((r) => r.id === reservationId), [reservations, reservationId]);
  const order = orders.find((o) => o.reservationId === reservationId);
  const branch = locations.find((l) => l.id === reservation?.branchId);

  useEffect(() => {
    // Clear cart upon successful reservation
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadReceipt = () => {
    if (!reservation) return;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>DineMaster Payment Receipt</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
          }
          .receipt {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #c9a227;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          .header h1 {
            color: #c9a227;
            margin: 0;
            font-size: 28px;
          }
          .header p {
            color: #666;
            margin: 5px 0 0 0;
          }
          .section {
            margin-bottom: 20px;
        }
          .section h3 {
            color: #333;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
            margin-bottom: 15px;
            font-size: 16px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f5f5f5;
          }
          .row:last-child {
            border-bottom: none;
          }
          .label {
            color: #666;
            font-size: 14px;
          }
          .value {
            font-weight: 600;
            color: #333;
            font-size: 14px;
        }
          .total-row {
            background: #fff9e6;
            padding: 12px;
            border-radius: 4px;
            margin-top: 10px;
          }
          .total-row .value {
            color: #c9a227;
            font-size: 18px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
          }
          .items-table th,
          .items-table td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #eee;
          }
          .items-table th {
            background: #f9f9f9;
            font-weight: 600;
            color: #333;
          }
          .items-table td:last-child {
            text-align: right;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 12px;
          }
          .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
          }
          .badge-success {
            background: #d4edda;
            color: #155724;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>DineMaster</h1>
            <p>Payment Receipt / Invoice</p>
          </div>

          <div class="section">
            <h3>Payment Information</h3>
            <div class="row">
              <span class="label">Payment ID:</span>
              <span class="value">${reservation.paymentRef}</span>
            </div>
            <div class="row">
              <span class="label">Payment Status:</span>
              <span class="badge badge-success">${reservation.paymentStatus}</span>
            </div>
            <div class="row">
              <span class="label">Payment Date:</span>
              <span class="value">${new Date(reservation.createdAt).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div class="section">
            <h3>Customer Details</h3>
            <div class="row">
              <span class="label">Name:</span>
              <span class="value">${reservation.name}</span>
            </div>
            <div class="row">
              <span class="label">Email:</span>
              <span class="value">${reservation.email}</span>
            </div>
            <div class="row">
              <span class="label">Phone:</span>
              <span class="value">${reservation.phone}</span>
            </div>
          </div>

          <div class="section">
            <h3>Reservation Details</h3>
            <div class="row">
              <span class="label">Location:</span>
              <span class="value">${branch?.name || reservation.branchId}</span>
            </div>
            <div class="row">
              <span class="label">Date:</span>
              <span class="value">${reservation.date}</span>
            </div>
            <div class="row">
              <span class="label">Time:</span>
              <span class="value">${reservation.time}</span>
            </div>
            <div class="row">
              <span class="label">Table Number:</span>
              <span class="value">#${reservation.tableNumber}</span>
            </div>
            <div class="row">
              <span class="label">Guests:</span>
              <span class="value">${reservation.guests}</span>
            </div>
          </div>

          ${order && order.items && order.items.length > 0 ? `
          <div class="section">
            <h3>Ordered Items</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.qty}</td>
                    <td>₹${item.price}</td>
                    <td>₹${item.price * item.qty}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h3>Payment Summary</h3>
            <div class="row">
              <span class="label">Subtotal:</span>
              <span class="value">₹${order.subtotal}</span>
            </div>
            <div class="row">
              <span class="label">Tax (5%):</span>
              <span class="value">₹${order.tax}</span>
            </div>
            ${order.discount > 0 ? `
            <div class="row">
              <span class="label">Discount:</span>
              <span class="value" style="color: #28a745;">-₹${order.discount}</span>
            </div>
            ` : ''}
            <div class="total-row">
              <span class="label" style="font-size: 16px;">Total Amount:</span>
              <span class="value">₹${order.total}</span>
            </div>
            ${order.reward ? `
            <div class="row" style="margin-top: 10px;">
              <span class="label">Reward:</span>
              <span class="value" style="color: #28a745;">${order.reward}</span>
            </div>
            ` : ''}
          </div>
          ` : `
          <div class="section">
            <h3>Reservation Only</h3>
            <p style="color: #666; font-size: 14px;">Table reservation confirmed. No food items ordered.</p>
          </div>
          `}

          ${reservation.birthdayOffer?.applied ? `
          <div class="section" style="background: #fff3cd; padding: 15px; border-radius: 4px;">
            <h3 style="color: #856404; border: none; margin: 0 0 10px 0;">🎉 Birthday Offer Applied</h3>
            <p style="color: #856404; margin: 0; font-size: 14px;">${reservation.birthdayOffer.benefit}</p>
          </div>
          ` : ''}

          <div class="footer">
            <p>Thank you for dining with DineMaster!</p>
            <p>This is a computer-generated receipt. No signature required.</p>
            <p>For queries, contact: support@dinemaster.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `DineMaster_Receipt_${reservation.id}.html`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (!reservation) {
    return (
      <div className="container page-header">
        <h1>Reservation Confirmed</h1>
        <p>Your booking is complete. Check dashboard for details.</p>
        <Link className="btn btn-primary" to="/dashboard">Go to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="success-page">
      <div className="success-bg" />
      <div className="success-overlay" />
      <motion.div className="container success-card card" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}>
        <h1>Thank You For Your Reservation</h1>
        <p className="sub">Your table is confirmed at DineMaster.</p>
        <div className="success-grid">
          <p><strong>Guest:</strong> {reservation.name}</p>
          <p><strong>Location:</strong> {branch?.name || reservation.branchId}</p>
          <p><strong>Date:</strong> {reservation.date}</p>
          <p><strong>Time:</strong> {reservation.time}</p>
          <p><strong>Table:</strong> #{reservation.tableNumber}</p>
          <p><strong>Guests:</strong> {reservation.guests}</p>
          <p><strong>Payment Ref:</strong> {reservation.paymentRef}</p>
          <p><strong>Total Paid:</strong> {formatINR(order?.total || 0)}</p>
          {reservation.birthdayOffer?.applied && <p>🎉 Birthday Offer Applied</p>}
        </div>
        <div className="success-actions">
          <button className="btn btn-primary" onClick={downloadReceipt}>Download Receipt</button>
          <Link className="btn btn-outline" to="/dashboard">Go to Dashboard</Link>
        </div>
      </motion.div>
    </div>
  );
}
