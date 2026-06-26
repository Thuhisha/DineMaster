import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiCalendar, FiGift, FiShoppingBag, FiStar, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../data/initialData';
import CountdownTimer from '../../components/reservation/CountdownTimer';
import Pagination from '../../components/common/Pagination';
import './CustomerDashboard.css';

const STATUS_BADGE = {
  confirmed: 'badge-success',
  cancelled: 'badge-danger',
  pending: 'badge-warning',
};
const ITEMS_PER_PAGE = 5;

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { reservations, orders, locations, cancelReservation } = useApp();

  const [pageRes, setPageRes] = useState(1);
  const [pageOrd, setPageOrd] = useState(1);

  const myReservations = reservations.filter(
    (r) => r.userId === user?.id && r.status !== 'cancelled'
  );
  const myOrders = orders.filter((o) => o.userId === user?.id);
  const birthdayOffers = myReservations.filter((r) => r.birthdayOffer?.applied);
  const upcoming = myReservations.find((r) => new Date(r.date) >= new Date(new Date().toDateString()));

  const paginate = (items, page) => {
    const sorted = [...items].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
    const start = (page - 1) * ITEMS_PER_PAGE;
    return sorted.slice(start, start + ITEMS_PER_PAGE);
  };

  const handleCancel = (id) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      const result = cancelReservation(id, user.id);
      if (result.ok) toast.success('Reservation cancelled');
      else toast.error('Could not cancel reservation');
    }
  };

  return (
    <div className="customer-dash">
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
            {paginate(myReservations, pageRes).map((r) => {
              const branch = locations?.find((b) => b.id === r.branchId);
              return (
                <article key={r.id} className="res-item card">
                  <div className="res-item-head">
                    <h3>Table #{r.tableNumber}</h3>
                    <span className={`badge ${STATUS_BADGE[r.status] || 'badge-gold'}`}>
                      {r.status}
                    </span>
                  </div>
                  <p>{branch?.name} · {r.date} · {r.time} · {r.guests} guests</p>
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
                <p>{o.items?.map((i) => `${i.name}×${i.qty}`).join(', ') || 'Reservation only'}</p>
                <p className="order-total">Total: {formatINR(o.total)}</p>
                <Link to={`/bill/${o.id}`} className="btn btn-outline btn-sm">View Bill</Link>
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
