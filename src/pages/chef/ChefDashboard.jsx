import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiUser, FiPackage, FiList } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import './ChefDashboard.css';

const KITCHEN_STEPS = ['new', 'cooking', 'ready'];

export default function ChefDashboard() {
  const { chefQueue, updateKitchenStatus, menu, updateMenuItem } = useApp();
  const [queue, setQueue] = useState([]);
  const [activeTab, setActiveTab] = useState('kds');

  // Real-time sync from context and prioritize by wait time
  useEffect(() => {
    const sortedQueue = [...chefQueue].sort((a, b) => {
      // Prioritize by status: new -> cooking -> ready -> served
      const statusOrder = { 'new': 1, 'preparing': 1, 'cooking': 2, 'ready': 3, 'served': 4 };
      const sA = statusOrder[a.kitchenStatus] || 1;
      const sB = statusOrder[b.kitchenStatus] || 1;
      
      if (sA !== sB) return sA - sB;
      
      // Then prioritize by time (oldest first)
      const timeA = new Date(a.createdAt || a.reservationTime).getTime();
      const timeB = new Date(b.createdAt || b.reservationTime).getTime();
      return timeA - timeB;
    });
    setQueue(sortedQueue);
  }, [chefQueue]);

  const handleStatus = (id, status) => {
    updateKitchenStatus(id, status);
    toast.success(`Order marked as ${status}`);
  };

  const handleToggleStock = async (item) => {
    try {
      await updateMenuItem(item.id, { available: item.available === false });
      toast.success(`${item.name} is now ${item.available === false ? 'In Stock' : 'Out of Stock'}`);
    } catch (err) {
      toast.error('Failed to update stock status');
    }
  };

  const active = queue.filter((q) => q.kitchenStatus !== 'served');

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': case 'preparing': return '#e74c3c'; // Red
      case 'cooking': return '#f1c40f'; // Yellow
      case 'ready': return '#2ecc71'; // Green
      default: return '#95a5a6';
    }
  };

  return (
    <div className="chef-dash">
      <div className="chef-tabs">
        <button 
          className={`tab-btn ${activeTab === 'kds' ? 'active' : ''}`}
          onClick={() => setActiveTab('kds')}
        >
          <FiList /> KDS Queue
        </button>
        <button 
          className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <FiPackage /> Inventory
        </button>
      </div>

      {activeTab === 'kds' ? (
        <>
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
          {active.length === 0 ? (
            <p className="empty">No active orders in queue.</p>
          ) : (
            <div className="chef-queue">
              <AnimatePresence>
                {active.map((item) => (
                  <motion.article
                    key={item.id}
                    className="chef-card card"
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ borderLeft: `6px solid ${getStatusColor(item.kitchenStatus)}` }}
                  >
                    <div className="chef-card-top">
                      <span className="table-badge">Table {item.tableNumber}</span>
                      <span 
                        className="badge"
                        style={{ backgroundColor: getStatusColor(item.kitchenStatus), color: '#fff' }}
                      >
                        {item.kitchenStatus === 'preparing' ? 'new' : item.kitchenStatus}
                      </span>
                    </div>
                    <h3><FiUser /> {item.customerName}</h3>
                    <p className="chef-items">{item.items}</p>
                    <p className="chef-time"><FiClock /> {new Date(item.createdAt || item.reservationTime).toLocaleTimeString()}</p>
                    <div className="chef-actions">
                      {KITCHEN_STEPS.map((step) => (
                        <button
                          key={step}
                          type="button"
                          className={`btn btn-sm ${item.kitchenStatus === step || (item.kitchenStatus === 'preparing' && step === 'new') ? 'btn-primary' : 'btn-outline'}`}
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
        </>
      ) : (
        <div className="chef-inventory">
          <h2 className="queue-title">Menu Inventory</h2>
          <div className="inventory-grid">
            {menu.map(item => (
              <div key={item.id} className="inventory-card card">
                <div className="inv-info">
                  <h4>{item.name}</h4>
                  <span className={`badge ${item.available !== false ? 'badge-success' : 'badge-danger'}`}>
                    {item.available !== false ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <button 
                  className={`btn btn-sm ${item.available !== false ? 'btn-outline' : 'btn-primary'}`}
                  onClick={() => handleToggleStock(item)}
                >
                  Mark {item.available !== false ? 'Out of Stock' : 'In Stock'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
