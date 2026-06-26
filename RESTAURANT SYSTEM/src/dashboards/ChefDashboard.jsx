import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiUser, FiMessageSquare, FiBell } from 'react-icons/fi';
import { useApp } from '../context/AppContext';
import './ChefDashboard.css';

const KITCHEN_STEPS = ['preparing', 'ready', 'served'];

export default function ChefDashboard() {
  const { chefQueue, updateKitchenStatus } = useApp();
  const [queue, setQueue] = useState(chefQueue);

  // Real-time sync from context
  useEffect(() => {
    setQueue(chefQueue);
  }, [chefQueue]);

  // Poll for updates (simulated real-time)
  useEffect(() => {
    const id = setInterval(() => setQueue([...chefQueue]), 3000);
    return () => clearInterval(id);
  }, [chefQueue]);

  const handleStatus = (id, status) => {
    updateKitchenStatus(id, status);
    toast.success(`Order marked as ${status}`);
  };

  const active = queue.filter((q) => q.kitchenStatus !== 'served');
  const newCount = queue.filter((q) => q.isNew && q.kitchenStatus !== 'served').length;
  const readyCount = queue.filter((q) => q.kitchenStatus === 'ready').length;

  return (
    <div className="chef-dash">
      <div className="chef-header-stats">
        <div className="chef-stat glass-panel">
          <FiBell className="stat-icon" />
          <strong>{active.length}</strong>
          <span>Active Orders</span>
          {newCount > 0 && <span className="notif-badge">{newCount}</span>}
        </div>
        <div className="chef-stat glass-panel">
          <strong>{readyCount}</strong>
          <span>Ready to Serve</span>
        </div>
        <div className="chef-stat glass-panel live-pulse">
          <span className="live-dot" /> Live sync
        </div>
      </div>

      <h2 className="queue-title">
        Kitchen Queue {active.length > 0 && <span className="queue-count">{active.length}</span>}
      </h2>
      {queue.length === 0 ? (
        <p className="empty">No orders in queue. New bookings appear here automatically.</p>
      ) : (
        <div className="chef-queue">
          <AnimatePresence>
            {queue.map((item) => (
              <motion.article
                key={item.id}
                className={`chef-card glass-panel ${item.isNew ? 'is-new' : ''}`}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="chef-card-top">
                  <span className="table-badge">Table {item.tableNumber}</span>
                  <span className={`badge badge-${item.kitchenStatus === 'served' ? 'success' : 'warning'}`}>
                    {item.kitchenStatus}
                  </span>
                </div>
                {item.isNew && <span className="new-order-badge">NEW</span>}
                <h3><FiUser /> {item.customerName}</h3>
                <p className="chef-items"><strong>Dishes:</strong> {item.items}</p>
                {item.specialRequests ? (
                  <p className="chef-special">
                    <FiMessageSquare /> <strong>Special:</strong> {item.specialRequests}
                  </p>
                ) : null}
                <p className="chef-time"><FiClock /> {item.reservationTime}</p>
                <div className="chef-actions">
                  {KITCHEN_STEPS.map((step) => (
                    <button
                      key={step}
                      type="button"
                      className={`btn btn-sm ${item.kitchenStatus === step ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => handleStatus(item.id, step)}
                      disabled={item.kitchenStatus === 'served'}
                    >
                      {step.charAt(0).toUpperCase() + step.slice(1)}
                    </button>
                  ))}
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
