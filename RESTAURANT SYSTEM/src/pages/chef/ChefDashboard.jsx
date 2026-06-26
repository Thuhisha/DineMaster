import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiUser } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
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

  return (
    <div className="chef-dash">
      <div className="chef-header-stats">
        <div className="chef-stat">
          <strong>{active.length}</strong>
          <span>Active Orders</span>
        </div>
        <div className="chef-stat">
          <strong>{queue.filter((q) => q.kitchenStatus === 'ready').length}</strong>
          <span>Ready to Serve</span>
        </div>
      </div>

      <h2 className="queue-title">Kitchen Queue</h2>
      {queue.length === 0 ? (
        <p className="empty">No orders in queue. New bookings appear here automatically.</p>
      ) : (
        <div className="chef-queue">
          <AnimatePresence>
            {queue.map((item) => (
              <motion.article
                key={item.id}
                className="chef-card card"
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
                <h3><FiUser /> {item.customerName}</h3>
                <p className="chef-items">{item.items}</p>
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
