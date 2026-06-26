import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../data/initialData';
import './BillPreview.css';

export default function BillPreview() {
  const { orderId } = useParams();
  const { orders, reservations } = useApp();
  const { user } = useAuth();

  const order = orders.find((o) => o.id === orderId);
  if (!order) {
    return (
      <div className="container page-header">
        <h1>Bill not found</h1>
        <Link to="/dashboard">Back to Dashboard</Link>
      </div>
    );
  }

  const reservation = reservations.find((r) => r.id === order.reservationId);

  return (
    <div className="bill-page">
      <div className="container">
        <div className="bill-card card">
          <header className="bill-header">
            <h1>DineMaster</h1>
            <p>Digital Bill Preview</p>
          </header>
          <div className="bill-meta">
            <p>Order: #{order.id.slice(-8)}</p>
            <p>Date: {new Date(order.createdAt).toLocaleString('en-IN')}</p>
            {reservation && <p>Table: #{reservation.tableNumber}</p>}
          </div>
          <table className="bill-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.qty}</td>
                  <td>{formatINR(item.price * item.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bill-totals">
            <p>Subtotal: {formatINR(order.subtotal)}</p>
            {order.discount > 0 && (
              <p className="discount">Birthday Discount: -{formatINR(order.discount)}</p>
            )}
            <p className="grand-total">Total: {formatINR(order.total)}</p>
          </div>
          <p className="bill-thanks">Thank you for dining with us!</p>
          <Link to="/dashboard" className="btn btn-outline">Back</Link>
        </div>
      </div>
    </div>
  );
}
