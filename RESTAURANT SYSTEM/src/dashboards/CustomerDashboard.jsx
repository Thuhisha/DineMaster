import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiCalendar, FiGift, FiShoppingBag, FiStar, FiX, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { BRANCHES, formatINR } from '../data/initialData';
import CountdownTimer from '../components/reservation/CountdownTimer';
import '../styles/dashboards.css';

const STATUS_BADGE = {
  confirmed: 'badge-success',
  cancelled: 'badge-danger',
  pending: 'badge-warning',
};

const KITCHEN_STATUS_CONFIG = {
  preparing: { label: 'Preparing', icon: FiClock, color: '#ffc107', description: 'Chef is preparing your order' },
  cooking: { label: 'Cooking', icon: FiAlertCircle, color: '#fd7e14', description: 'Your order is being cooked' },
  ready: { label: 'Ready to Serve', icon: FiCheckCircle, color: '#28a745', description: 'Your order is ready and will be served soon' },
  served: { label: 'Served', icon: FiCheckCircle, color: '#28a745', description: 'Your order has been served' },
  confirmed: { label: 'Order Received', icon: FiClock, color: '#17a2b8', description: 'Your order has been received' },
};

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { reservations, orders, chefQueue, cancelReservation } = useApp();
  const [lastNotifiedStatus, setLastNotifiedStatus] = useState({});

  const getKitchenStatus = (reservationId) =>
    chefQueue.find((c) => c.reservationId === reservationId)?.kitchenStatus || 'confirmed';

  const myReservations = reservations.filter(
    (r) => r.userId === user?.id && r.status !== 'cancelled'
  );
  const myOrders = orders.filter((o) => o.userId === user?.id);
  const birthdayOffers = myReservations.filter((r) => r.birthdayOffer?.applied);
  const upcoming = myReservations.find((r) => new Date(r.date) >= new Date(new Date().toDateString()));

  // Real-time status change notifications
  useEffect(() => {
    myReservations.forEach((reservation) => {
      const currentStatus = getKitchenStatus(reservation.id);
      const previousStatus = lastNotifiedStatus[reservation.id];

      if (previousStatus && previousStatus !== currentStatus) {
        const statusConfig = KITCHEN_STATUS_CONFIG[currentStatus] || KITCHEN_STATUS_CONFIG.confirmed;
        toast.success(`Order Update: ${statusConfig.label}`, {
          icon: statusConfig.icon,
          description: statusConfig.description,
        });
      }
      setLastNotifiedStatus((prev) => ({
        ...prev,
        [reservation.id]: currentStatus,
      }));
    });
  }, [chefQueue, myReservations, lastNotifiedStatus]);

  const handleCancel = (id) => {
    const result = cancelReservation(id, user.id);
    if (result.ok) toast.success('Reservation cancelled');
    else toast.error('Could not cancel reservation');
  };

  return (
    <div className="customer-dash">
      <div className="quick-links">
        <Link to="/menu" className="quick-link glass-panel">Order Food</Link>
        <Link to="/reserve" className="quick-link glass-panel">Reserve Table</Link>
        <Link to="/tables" className="quick-link glass-panel">Table Status</Link>
      </div>
      <div className="dash-stats grid-4">
        <div className="dash-stat-card">
          <FiCalendar />
          <div>
            <strong>{myReservations.length}</strong>
            <span>Active Reservations</span>
          </div>
        </div>
        <div className="dash-stat-card">
          <FiStar />
          <div>
            <strong>{user?.loyaltyPoints ?? 0}</strong>
            <span>Loyalty Points</span>
          </div>
        </div>
        <div className="dash-stat-card">
          <FiGift />
          <div>
            <strong>{birthdayOffers.length}</strong>
            <span>Birthday Offers Used</span>
          </div>
        </div>
        <div className="dash-stat-card">
          <FiShoppingBag />
          <div>
            <strong>{myOrders.length}</strong>
            <span>Orders</span>
          </div>
        </div>
      </div>

      {upcoming && (
        <section className="dash-section card">
          <h2>Upcoming Reservation</h2>
          <CountdownTimer targetDate={upcoming.date} targetTime={upcoming.time} />
          <p>Table #{upcoming.tableNumber} · {upcoming.date} at {upcoming.time}</p>
        </section>
      )}

      <section className="dash-section">
        <div className="section-title-row">
          <h2>My Reservations</h2>
          <Link to="/reserve" className="btn btn-primary btn-sm">New Booking</Link>
        </div>
        {myReservations.length === 0 ? (
          <p className="empty">No reservations yet.</p>
        ) : (
          <div className="res-list">
            {myReservations.map((r) => {
              const branch = BRANCHES.find((b) => b.id === r.branchId);
              const kitchenStatus = getKitchenStatus(r.id);
              const statusConfig = KITCHEN_STATUS_CONFIG[kitchenStatus] || KITCHEN_STATUS_CONFIG.confirmed;
              const StatusIcon = statusConfig.icon;

              return (
                <article key={r.id} className="res-item card">
                  <div className="res-item-head">
                    <h3>Table #{r.tableNumber}</h3>
                    <span className={`badge ${STATUS_BADGE[r.status] || 'badge-gold'}`}>
                      {r.status}
                    </span>
                  </div>
                  <p>{branch?.name} · {r.date} · {r.time} · {r.guests} guests</p>
                  
                  {/* Kitchen Status Timeline */}
                  <div className="kitchen-status-timeline">
                    <div className="status-header">
                      <StatusIcon style={{ color: statusConfig.color }} />
                      <span className="status-label">{statusConfig.label}</span>
                    </div>
                    <p className="status-description">{statusConfig.description}</p>
                    <div className="status-progress">
                      {['confirmed', 'preparing', 'cooking', 'ready', 'served'].map((status, index) => {
                        const isActive = ['confirmed', 'preparing', 'cooking', 'ready', 'served'].indexOf(kitchenStatus) >= index;
                        const isCurrent = status === kitchenStatus;
                        return (
                          <div
                            key={status}
                            className={`status-step ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}
                          >
                            <div className="status-dot" />
                            <span className="status-step-label">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {r.birthdayOffer?.applied && (
                    <p className="offer-tag">🎉 Birthday Offer Applied</p>
                  )}
                  <div className="res-actions">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleCancel(r.id)}
                    >
                      <FiX /> Cancel
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="dash-section">
        <h2>Order History</h2>
        {myOrders.length === 0 ? (
          <p className="empty">No orders yet. <Link to="/menu">Browse menu</Link></p>
        ) : (
          <div className="order-list">
            {myOrders.map((o) => (
              <article key={o.id} className="order-item card">
                <div className="order-head">
                  <span>Order #{o.id.slice(-6)}</span>
                  <span className={`badge ${STATUS_BADGE[o.status] || 'badge-gold'}`}>{o.status}</span>
                </div>
                <p>{o.items?.map((i) => `${i.name}×${i.qty}`).join(', ') || 'Reservation only'}</p>
                <p className="order-total">Total: {formatINR(o.total)}</p>
                <Link to={`/bill/${o.id}`} className="btn btn-outline btn-sm">View Bill</Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
