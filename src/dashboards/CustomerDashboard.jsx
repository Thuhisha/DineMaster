import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import React from 'react';
import toast from 'react-hot-toast';
import { FiCalendar, FiGift, FiShoppingBag, FiStar, FiX, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { formatINR } from '../data/initialData';
import CountdownTimer from '../components/reservation/CountdownTimer';
import Pagination from '../components/common/Pagination';
import '../styles/dashboards.css';

const STATUS_BADGE = {
  confirmed: 'badge-success',
  cancelled: 'badge-danger',
  pending: 'badge-warning',
};

const KITCHEN_STATUS_CONFIG = {
  new: { label: 'New', icon: FiClock, color: '#17a2b8', description: 'Your reservation/order is new' },
  preparing: { label: 'Preparing', icon: FiClock, color: '#ffc107', description: 'Chef is preparing your order' },
  cooking: { label: 'Cooking', icon: FiAlertCircle, color: '#fd7e14', description: 'Your order is being cooked' },
  ready: { label: 'Ready to Serve', icon: FiCheckCircle, color: '#28a745', description: 'Your order is ready and will be served soon' },
  served: { label: 'Served', icon: FiCheckCircle, color: '#28a745', description: 'Your order has been served' },
  confirmed: { label: 'Order Received', icon: FiClock, color: '#17a2b8', description: 'Your order has been received' },
};

const ITEMS_PER_PAGE = 5;

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { reservations, orders, chefQueue, cancelReservation, cancelOrder, offers, locations } = useApp();
  const lastNotifiedStatus = React.useRef({});

  const [pageRes, setPageRes] = useState(1);
  const [pageOrd, setPageOrd] = useState(1);

  const isPastItem = (item) => {
    const dateStr = item.date || item.createdAt;
    if (!dateStr) return false;
    const dateObj = new Date(dateStr.split(' ')[0]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dateObj < today;
  };

  const getKitchenStatus = (reservationId) => {
    const r = reservations.find((res) => res.id === reservationId);
    if (r && isPastItem(r)) return 'served';
    return chefQueue.find((c) => c.reservationId === reservationId)?.kitchenStatus || 'new';
  };

  const myReservations = reservations.filter(
    (r) => r.userId === String(user?.id) && r.status !== 'cancelled'
  );
  const myOrders = orders.filter((o) => o.userId === String(user?.id));
  const totalSpent = myOrders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? (o.total || 0) : 0), 0);
  const calculatedLoyaltyPoints = Math.floor(totalSpent / 10);
  
  const birthdayOffers = myReservations.filter((r) => r.birthdayOffer?.applied);
  const upcoming = myReservations.find((r) => new Date(r.date) >= new Date(new Date().toDateString()));

  const paginate = (items, page) => {
    // Sort ascending (chronological date-wise order), but put past items at the end
    const sorted = [...items].sort((a, b) => {
      const aIsPast = isPastItem(a);
      const bIsPast = isPastItem(b);
      if (aIsPast && !bIsPast) return 1;
      if (!aIsPast && bIsPast) return -1;
      return new Date(a.createdAt || a.date || 0) - new Date(b.createdAt || b.date || 0);
    });
    const start = (page - 1) * ITEMS_PER_PAGE;
    return sorted.slice(start, start + ITEMS_PER_PAGE);
  };

  // Real-time status change notifications
  useEffect(() => {
    myReservations.forEach((reservation) => {
      const currentStatus = getKitchenStatus(reservation.id);
      const previousStatus = lastNotifiedStatus.current[reservation.id];

      if (previousStatus && previousStatus !== currentStatus) {
        const statusConfig = KITCHEN_STATUS_CONFIG[currentStatus] || KITCHEN_STATUS_CONFIG.confirmed;
        toast.success(`Order Update: ${statusConfig.label}`);
      }
      lastNotifiedStatus.current[reservation.id] = currentStatus;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chefQueue, myReservations]);

  const handleCancel = (id) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      const result = cancelReservation(id, user.id);
      if (result.ok) toast.success('Reservation cancelled');
      else toast.error('Could not cancel reservation');
    }
  };

  const handleCancelOrder = async (id) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      const result = await cancelOrder(id, user.id);
      if (result.ok) toast.success('Order cancelled');
      else toast.error(result.message || 'Could not cancel order');
    }
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
            <strong>{calculatedLoyaltyPoints}</strong>
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
            {paginate(myReservations, pageRes).map((r) => {
              const branch = locations.find((b) => b.id === r.branchId);
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
                      {['new', 'preparing', 'cooking', 'ready', 'served'].map((status, index) => {
                        const isActive = ['new', 'preparing', 'cooking', 'ready', 'served'].indexOf(kitchenStatus) >= index;
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
            <Pagination 
              currentPage={pageRes} 
              totalPages={Math.ceil(myReservations.length / ITEMS_PER_PAGE)} 
              onPageChange={setPageRes} 
            />
          </div>
        )}
      </section>

      <section className="dash-section">
        <h2>Available Offers</h2>
        {offers.filter(o => o.active).length === 0 ? (
          <p className="empty">No active offers available.</p>
        ) : (
          <div className="offers-grid">
            {offers.filter(o => o.active).map((o) => (
              <article key={o.id} className="offer-card card">
                <div className="offer-header">
                  <FiGift />
                  <h3>{o.title}</h3>
                </div>
                <p className="offer-desc">{o.desc}</p>
                <div className="offer-details">
                  {o.minAmount > 0 && <p>Minimum Order: {formatINR(o.minAmount)}</p>}
                  {o.percent > 0 && <p>Discount: {o.percent}% off</p>}
                  {o.reward && <p className="reward-text">🎁 {o.reward}</p>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="dash-section">
        <h2>Order History</h2>
        {myOrders.length === 0 ? (
          <p className="empty">No orders yet. <Link to="/menu">Browse menu</Link></p>
        ) : (
          <div className="order-list">
            {paginate(myOrders, pageOrd).map((o) => (
              <article key={o.id} className="order-item card">
                <div className="order-head">
                  <span>Order #{o.id.slice(-6)}</span>
                  <span className={`badge ${STATUS_BADGE[o.status] || 'badge-gold'}`}>{o.status}</span>
                </div>
                <p>{o.items?.map((i) => `${i.name}×${i.qty}`)?.join(', ') || 'Reservation only'}</p>
                <p className="order-total">Total: {formatINR(o.total)}</p>
                <div className="res-actions" style={{ marginTop: '10px' }}>
                  <Link to={`/bill/${o.id}`} className="btn btn-outline btn-sm">View Bill</Link>
                  {o.status !== 'cancelled' && o.status !== 'completed' && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleCancelOrder(o.id)}
                    >
                      <FiX /> Cancel Order
                    </button>
                  )}
                </div>
              </article>
            ))}
            <Pagination 
              currentPage={pageOrd} 
              totalPages={Math.ceil(myOrders.length / ITEMS_PER_PAGE)} 
              onPageChange={setPageOrd} 
            />
          </div>
        )}
      </section>
    </div>
  );
}
