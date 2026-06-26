import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiUser, FiMessageSquare, FiBell, FiList, FiPackage, FiToggleRight, FiToggleLeft } from 'react-icons/fi';
import { useApp } from '../context/AppContext';
import './ChefDashboard.css';

const KITCHEN_STEPS = ['new', 'cooking', 'ready', 'served'];

function WaitTimer({ startTime }) {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    const start = new Date(startTime).getTime();
    if (isNaN(start)) return;
    
    const updateTime = () => {
      const now = new Date().getTime();
      const diffMs = Math.max(0, now - start);
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diffMs / 1000 / 60) % 60);
      const secs = Math.floor((diffMs / 1000) % 60);

      let timeStr = '';
      if (days > 0) timeStr += `${days}d `;
      if (hours > 0 || days > 0) timeStr += `${hours}h `;
      timeStr += `${mins}m ${secs}s`;
      
      setElapsed(timeStr);
    };

    updateTime();
    const id = setInterval(updateTime, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  return <span className="wait-timer">{elapsed || 'Just now'}</span>;
}

export default function ChefDashboard() {
  const { chefQueue, updateKitchenStatus, groceries, setGroceries, reservations, locations } = useApp();
  const [queue, setQueue] = useState(chefQueue);
  const [activeTab, setActiveTab] = useState('kds');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState('');
  const itemsPerPage = 6;

  useEffect(() => {
    setQueue(chefQueue);
  }, [chefQueue]);

  useEffect(() => {
    const id = setInterval(() => setQueue([...chefQueue]), 3000);
    return () => clearInterval(id);
  }, [chefQueue]);

  // Reset pagination when location changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLocation]);

  const handleStatus = (id, status) => {
    updateKitchenStatus(id, status);
    toast.success(`Order marked as ${status}`);
  };

  const toggleGrocery = (id) => {
    setGroceries(prev => prev.map(g => {
      if (g.id === id) {
        toast.success(`${g.name} is now ${!g.available ? 'In Stock' : 'Out of Stock'}`);
        return { ...g, available: !g.available };
      }
      return g;
    }));
  };

  const [newGroceryName, setNewGroceryName] = useState('');

  const handleAddGrocery = (e) => {
    e.preventDefault();
    if (!newGroceryName.trim()) return;
    const newItem = {
      id: Date.now().toString(),
      name: newGroceryName,
      available: true
    };
    setGroceries([...groceries, newItem]);
    setNewGroceryName('');
    toast.success(`${newGroceryName} added to inventory!`);
  };

  // Process queue to automatically mark past orders as served and filter by location
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const processedQueue = queue
    .filter(q => {
      if (!selectedLocation) return false;
      const reservation = reservations?.find(r => r.id === q.reservationId);
      return reservation?.branchId === selectedLocation;
    })
    .map(q => {
      let isPastOrder = false;
      if (q.reservationTime) {
        const orderDateStr = q.reservationTime.split(' ')[0];
        const orderDate = new Date(orderDateStr);
        if (orderDate < today) {
          isPastOrder = true;
        }
      }
      return isPastOrder ? { ...q, kitchenStatus: 'served', isPastOrder: true } : q;
    });

  // Show ALL orders, sort by newest first (recent first, old last)
  const allOrders = [...processedQueue]
    .sort((a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt));
    
  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(allOrders.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = allOrders.slice(startIndex, startIndex + itemsPerPage);

  const activeCount = processedQueue.filter((q) => q.kitchenStatus !== 'served').length;
  const newCount = processedQueue.filter((q) => q.kitchenStatus === 'new').length;
  const readyCount = processedQueue.filter((q) => q.kitchenStatus === 'ready').length;

  return (
    <div className="chef-dash">
      <div className="chef-tabs">
        <button className={`btn ${activeTab === 'kds' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('kds')}>
          <FiList /> KDS (Orders)
        </button>
        <button className={`btn ${activeTab === 'inventory' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('inventory')}>
          <FiPackage /> Inventory
        </button>
      </div>

      {activeTab === 'kds' && (
        <>
          <div className="chef-location-selector" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <select 
              value={selectedLocation} 
              onChange={(e) => setSelectedLocation(e.target.value)}
              style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--primary-color)', fontSize: '1rem', minWidth: '250px', backgroundColor: '#1a1a1a', color: '#ffffff', outline: 'none' }}
            >
              <option value="" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>-- Select Your Location --</option>
              {locations?.map(loc => (
                <option key={loc.id} value={loc.id} style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>{loc.name} - {loc.city}</option>
              ))}
            </select>
          </div>
          
          <div className="chef-header-stats">
            <div className="chef-stat glass-panel">
              <FiBell className="stat-icon" />
              <strong>{activeCount}</strong>
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
            Kitchen Queue {allOrders.length > 0 && <span className="queue-count">{allOrders.length}</span>}
          </h2>
          {!selectedLocation ? (
            <p className="empty">Please select your location from the dropdown above to start handling orders.</p>
          ) : allOrders.length === 0 ? (
            <p className="empty">No orders in queue. New bookings appear here automatically.</p>
          ) : (
            <div className="chef-queue-container">
              <div className="chef-queue">
                <AnimatePresence>
                  {currentOrders.map((item) => (
                    <motion.article
                      key={item.id}
                      className={`chef-card glass-panel status-${item.kitchenStatus}`}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <div className="chef-card-top">
                        <span className="table-badge">Table {item.tableNumber}</span>
                        <span className={`badge badge-kds-${item.kitchenStatus}`}>
                          {item.kitchenStatus.toUpperCase()}
                        </span>
                      </div>
                      <div className="chef-wait-time">
                        Wait Time: <WaitTimer startTime={item.createdAt || item.updatedAt} />
                      </div>
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
                            disabled={item.isPastOrder && step !== 'served'}
                          >
                            {step.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </div>

              {totalPages > 1 && (
                <div className="chef-pagination">
                  <button 
                    className="btn btn-outline" 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span className="page-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button 
                    className="btn btn-outline" 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeTab === 'inventory' && (
        <div className="chef-inventory">
          <div className="inventory-header-actions">
            <div>
              <h2>Grocery Inventory Management</h2>
              <p>Track your kitchen's grocery and raw ingredient stock levels.</p>
            </div>
            <form className="add-grocery-form" onSubmit={addGrocery}>
              <input 
                type="text" 
                placeholder="Enter new grocery name..." 
                value={newGroceryName}
                onChange={(e) => setNewGroceryName(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">Add Item</button>
            </form>
          </div>
          <div className="inventory-grid">
            {groceries.map((item) => (
              <div key={item.id} className={`inventory-card glass-panel ${!item.available ? 'out-of-stock' : ''}`}>
                <div className="inventory-details">
                  <h4>{item.name}</h4>
                  <span className={`status-text ${item.available ? 'text-success' : 'text-danger'}`}>
                    {item.available ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <button 
                  className={`btn btn-icon toggle-btn ${item.available ? 'active' : ''}`}
                  onClick={() => toggleGrocery(item.id)}
                >
                  {item.available ? <FiToggleRight size={28} color="var(--success)" /> : <FiToggleLeft size={28} color="#666" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
