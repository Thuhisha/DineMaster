import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../data/initialData';
import BarChart from '../components/dashboard/BarChart';
import { MdAdd, MdEdit, MdVisibility, MdVisibilityOff, MdDelete } from 'react-icons/md';
import CustomDatePicker from '../components/common/CustomDatePicker';
import './AdminDashboard.css';

const TABS = ['overview', 'locations', 'tables', 'menu', 'inventory', 'reservations', 'orders', 'customers', 'offers'];

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [locationPage, setLocationPage] = useState(1);
  const [locationListPage, setLocationListPage] = useState(1);
  const [tableListPage, setTableListPage] = useState(1);
  const [tableLocationPage, setTableLocationPage] = useState(1);
  const [inventoryPage, setInventoryPage] = useState(1);
  const [reservationPage, setReservationPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [customerPage, setCustomerPage] = useState(1);
  const { users } = useAuth();
  const {
    tables,
    menu,
    reservations,
    orders,
    chefQueue,
    tableStats,
    offers,
    locations,
    feedbackList,
    setOffers,
    addTable,
    updateTable,
    deleteTable,
    resetTables,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    addLocation,
    updateLocation,
    deleteLocation,
    removeFeedback,
    addOffer,
    updateOffer,
    deleteOffer,
    groceries,
  } = useApp();

  const customers = users.filter((u) => u.role?.toLowerCase() === 'customer');

  // Force re-render when key data changes to ensure real-time updates
  useEffect(() => {
    console.log('[AdminDashboard] Data changed - tables:', tables.length, 'reservations:', reservations.length, 'orders:', orders.length);
  }, [tables, reservations, orders]);

  // Enhanced analytics with location-wise tracking
  const analytics = (() => {
    const active = reservations.filter((r) => r.status !== 'cancelled');
    const activeOrders = orders.filter((o) => o.status !== 'completed');
    
    // Location-wise analytics
    const locationAnalytics = locations.map((loc) => {
      const locReservations = active.filter((r) => r.branchId === loc.id);
      const locOrders = orders.filter((o) => {
        const res = reservations.find((r) => r.id === o.reservationId);
        return res?.branchId === loc.id;
      });
      const locTables = tables.filter((t) => t.branchId === loc.id);
      
      return {
        location: loc.name,
        city: loc.city,
        branchId: loc.id,
        totalBookings: locReservations.length,
        totalTables: locTables.length,
        availableTables: locTables.filter((t) => t.status === 'available').length,
        reservedTables: locTables.filter((t) => t.status === 'reserved').length,
        occupiedTables: locTables.filter((t) => t.status === 'occupied').length,
        revenue: locOrders.reduce((s, o) => s + (o.total || 0), 0),
        activeOrders: locOrders.filter((o) => o.status !== 'completed').length,
        completedOrders: locOrders.filter((o) => o.status === 'completed').length,
      };
    });

    // Customer order analytics
    const customerAnalytics = customers.map((cust) => {
      const custIdStr = String(cust.id);
      const custOrders = orders.filter((o) => o.userId === custIdStr);
      const custReservations = reservations.filter((r) => r.userId === custIdStr);
      const totalSpent = custOrders.reduce((s, o) => s + (o.total || 0), 0);
      return {
        customerName: cust.name,
        customerEmail: cust.email,
        totalOrders: custOrders.length,
        totalSpent: totalSpent,
        totalReservations: custReservations.length,
        loyaltyPoints: Math.floor(totalSpent / 10),
        lastOrder: custOrders.length > 0 ? custOrders[custOrders.length - 1].createdAt : null,
      };
    });

    // 1. Reservation Trend (by date)
    const resByDate = {};
    active.forEach((r) => {
      if (r.date) {
        resByDate[r.date] = (resByDate[r.date] || 0) + 1;
      }
    });
    const sortedDates = Object.keys(resByDate).sort();
    const reservationTrend = sortedDates.slice(-7).map(d => ({
      label: d.substring(5), // Keep MM-DD
      value: resByDate[d]
    }));

    return {
      totalReservations: active.length,
      cancelled: reservations.filter((r) => r.status === 'cancelled').length,
      birthdayBookings: active.filter((r) => r.birthdayOffer?.applied).length,
      revenue: orders.reduce((s, o) => s + (o.total || 0), 0),
      activeOrders: activeOrders.length,
      pendingKitchen: chefQueue.filter((q) => q.kitchenStatus !== 'served').length,
      tableStats,
      locationAnalytics,
      customerAnalytics,
      reservationTrend: reservationTrend.length > 0 ? reservationTrend : [{ label: 'No Data', value: 0 }],
    };
  })();

  const [tableForm, setTableForm] = useState({ number: '', capacity: 4, status: 'available' });
  const [menuForm, setMenuForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course',
    rating: 4.5,
    image: '',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [locationForm, setLocationForm] = useState({ name: '', city: '', address: '', phone: '', email: '', mapLink: '' });
  const [editingLocation, setEditingLocation] = useState(null);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [reservationFilters, setReservationFilters] = useState({
    branchId: '',
    date: '',
    status: '',
  });
  const [offerForm, setOfferForm] = useState({
    title: '',
    desc: '',
    minAmount: '',
    percent: '',
    reward: '',
  });
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && deleteConfirmItem) {
        setDeleteConfirmItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteConfirmItem]);

  const handleAddTable = (e) => {
    e.preventDefault();
    if (!selectedLocationId) {
      toast.error('Please select a location first');
      return;
    }
    console.log('[AdminDashboard] Adding table for location:', selectedLocationId);
    addTable({ ...tableForm, branchId: selectedLocationId });
    setTableForm({ number: '', capacity: 4, status: 'available' });
    toast.success('Table added');
  };

  const handleAddMenu = async (e) => {
    e.preventDefault();

    if (!selectedImage) {
      toast.error('Please select an image');
      return;
    }

    setUploadingImage(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(selectedImage);
      reader.onload = () => {
        const base64Image = reader.result;

        addMenuItem({
          ...menuForm,
          price: Number(menuForm.price),
          rating: Number(menuForm.rating),
          image: base64Image,
        });

        setMenuForm({ name: '', description: '', price: '', category: 'Main Course', rating: 4.5, image: '' });
        setSelectedImage(null);
        setImagePreview(null);
        setUploadingImage(false);
        toast.success('Menu item added');
      };

      reader.onerror = () => {
        toast.error('Failed to read image');
        setUploadingImage(false);
      };
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image');
      setUploadingImage(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid image file (jpg, png, jpeg, webp)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleAddLocation = (e) => {
    e.preventDefault();
    if (!locationForm.name || !locationForm.city) return toast.error('Name and city are required');
    if (locationForm.phone && locationForm.phone.length !== 10) return toast.error('Phone number must be exactly 10 digits');

    if (editingLocation) {
      updateLocation(editingLocation.id, locationForm);
      setEditingLocation(null);
      toast.success('Location updated');
    } else {
      addLocation(locationForm);
      toast.success('Location added');
    }

    setLocationForm({ name: '', city: '', address: '', phone: '', email: '', mapLink: '' });
  };

  const handleEditLocation = (loc) => {
    setEditingLocation(loc);
    setLocationForm({
      name: loc.name,
      city: loc.city,
      address: loc.address || '',
      phone: loc.phone || '',
      email: loc.email || '',
      mapLink: loc.mapLink || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditLocation = () => {
    setEditingLocation(null);
    setLocationForm({ name: '', city: '', address: '', phone: '', email: '', mapLink: '' });
  };

  const handleEditMenuItem = (item) => {
    setEditingMenuItem(item);
    setMenuForm({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      rating: item.rating,
      image: item.image,
    });
  };

  const handleUpdateMenuItem = (e) => {
    e.preventDefault();
    if (!editingMenuItem) return;
    updateMenuItem(editingMenuItem.id, {
      name: menuForm.name,
      description: menuForm.description,
      price: Number(menuForm.price),
      category: menuForm.category,
      rating: Number(menuForm.rating),
      image: menuForm.image,
    });
    setEditingMenuItem(null);
    setMenuForm({ name: '', description: '', price: '', category: 'Main Course', rating: 4.5, image: '' });
    toast.success('Menu item updated');
  };

  const handleCancelEdit = () => {
    setEditingMenuItem(null);
    setMenuForm({ name: '', description: '', price: '', category: 'Main Course', rating: 4.5, image: '' });
  };

  const handleAddOffer = async (e) => {
    e.preventDefault();
    if (!offerForm.title || !offerForm.desc) {
      toast.error('Title and description are required');
      return;
    }
    try {
      const newOffer = {
        title: offerForm.title,
        desc: offerForm.desc,
        minAmount: Number(offerForm.minAmount) || 0,
        percent: Number(offerForm.percent) || 0,
        reward: offerForm.reward || null,
        active: true,
      };
      await addOffer(newOffer);
      setOfferForm({ title: '', desc: '', minAmount: '', percent: '', reward: '' });
      setShowOfferForm(false);
      toast.success('Offer added successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to add offer');
    }
  };

  const handleUpdateOffer = async (e) => {
    e.preventDefault();
    if (!editingOffer) return;
    try {
      const patch = {
        ...editingOffer,
        title: offerForm.title,
        desc: offerForm.desc,
        minAmount: Number(offerForm.minAmount) || 0,
        percent: Number(offerForm.percent) || 0,
        reward: offerForm.reward || null,
      };
      await updateOffer(editingOffer.id, patch);
      setEditingOffer(null);
      setOfferForm({ title: '', desc: '', minAmount: '', percent: '', reward: '' });
      setShowOfferForm(false);
      toast.success('Offer updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update offer');
    }
  };

  const handleEditOffer = (offer) => {
    setEditingOffer(offer);
    setOfferForm({
      title: offer.title,
      desc: offer.desc,
      minAmount: offer.minAmount || '',
      percent: offer.percent || '',
      reward: offer.reward || '',
    });
    setShowOfferForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="admin-dash">
      <div className="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            className={`admin-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

            {tab === 'overview' && (
        <div className="admin-overview">
          <div className="grid-4 analytics-grid">
            <div className="analytics-card glass-panel">
              <span className="stat-label">Total Tables (All Locations)</span>
              <strong>{tableStats.total}</strong>
            </div>
            <div className="analytics-card glass-panel stat-available">
              <span className="stat-label">Available (All Locations)</span>
              <strong>{tableStats.available}</strong>
            </div>
            <div className="analytics-card glass-panel stat-reserved">
              <span className="stat-label">Reserved (All Locations)</span>
              <strong>{tableStats.reserved}</strong>
            </div>
            <div className="analytics-card glass-panel stat-occupied">
              <span className="stat-label">Occupied (All Locations)</span>
              <strong>{tableStats.occupied}</strong>
            </div>
          </div>
          <div className="grid-4 analytics-grid">
            <div className="analytics-card glass-panel">
              <strong>{analytics.totalReservations}</strong>
              <span>Reservations</span>
            </div>
            <div className="analytics-card glass-panel">
              <strong>{analytics.activeOrders}</strong>
              <span>Active Orders</span>
            </div>
            <div className="analytics-card glass-panel">
              <strong>{formatINR(analytics.revenue)}</strong>
              <span>Revenue</span>
            </div>
            <div className="analytics-card glass-panel">
              <strong>{analytics.pendingKitchen}</strong>
              <span>Kitchen Queue</span>
            </div>
          </div>
          <div className="charts-row">
            <BarChart title="Reservations by day" data={analytics.reservationTrend} />
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <section className="admin-orders">
          <h3>Customer Orders & Food Details</h3>
          {orders.length === 0 ? (
            <p className="empty">No orders yet</p>
          ) : (
            <>
              <div className="orders-list">
                {orders.slice((orderPage - 1) * 4, orderPage * 4).map((order) => {
                  const reservation = reservations.find((r) => r.id === order.reservationId);
                  const branch = locations.find((l) => l.id === reservation?.branchId);
                  const kitchenItem = chefQueue.find(q => q.orderId === order.id || q.reservationId === order.reservationId);
                  const kitchenStatus = kitchenItem?.kitchenStatus;
                  
                  return (
                    <div key={order.id} className="order-detail-card card">
                      <div className="order-header">
                        <div>
                          <h4>Order #{order.id.slice(-6)}</h4>
                          <p className="order-meta">
                            Customer: <strong>{reservation?.name || 'N/A'}</strong> · 
                            Table: #{reservation?.tableNumber || 'N/A'} · 
                            Location: {branch?.name || reservation?.branchId || 'N/A'}
                          </p>
                          <p className="order-meta">
                            Date: {reservation?.date} · Time: {reservation?.time} · 
                            Guests: {reservation?.guests}
                          </p>
                        </div>
                        <div className="order-status">
                          <span className={`badge badge-${order.status === 'completed' ? 'success' : 'warning'}`}>
                            {order.status}
                          </span>
                          <span className={`badge badge-${reservation?.paymentStatus === 'paid' ? 'success' : 'danger'}`}>
                            {reservation?.paymentStatus || 'pending'}
                          </span>
                          {kitchenStatus && (
                            <span className={`badge badge-${kitchenStatus === 'served' ? 'success' : kitchenStatus === 'ready' ? 'primary' : 'info'}`}>
                              Chef: {kitchenStatus}
                            </span>
                          )}
                          {reservation?.birthdayOffer?.applied && (
                            <span className="badge badge-success">🎉 Birthday Offer</span>
                          )}
                        </div>
                      </div>
                      <div className="order-items">
                        <table className="order-items-table">
                          <thead>
                            <tr>
                              <th>Food Item</th>
                              <th>Quantity</th>
                              <th>Price</th>
                              <th>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items?.map((item) => (
                              <tr key={item.id}>
                                <td>{item.name}</td>
                                <td>{item.qty}</td>
                                <td>{formatINR(item.price)}</td>
                                <td>{formatINR(item.price * item.qty)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="order-totals">
                        <div className="total-row">
                          <span>Subtotal:</span>
                          <span>{formatINR(order.subtotal)}</span>
                        </div>
                        <div className="total-row">
                          <span>Tax (5%):</span>
                          <span>{formatINR(order.tax)}</span>
                        </div>
                        {order.discount > 0 && (
                          <div className="total-row discount">
                            <span>Discount:</span>
                            <span>-{formatINR(order.discount)}</span>
                          </div>
                        )}
                        <div className="total-row grand-total">
                          <span>Total Amount:</span>
                          <span>{formatINR(order.total)}</span>
                        </div>
                        {order.reward && (
                          <p className="reward-note">Reward: {order.reward}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {orders.length > 4 && (
                <div className="admin-pagination">
                  <button 
                    type="button"
                    className="btn btn-outline" 
                    onClick={() => setOrderPage(p => Math.max(1, p - 1))}
                    disabled={orderPage === 1}
                  >
                    Previous
                  </button>
                  <span className="page-info">
                    Page {orderPage} of {Math.ceil(orders.length / 4)}
                  </span>
                  <button 
                    type="button"
                    className="btn btn-outline" 
                    onClick={() => setOrderPage(p => Math.min(Math.ceil(orders.length / 4), p + 1))}
                    disabled={orderPage === Math.ceil(orders.length / 4)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      )}

{tab === 'locations' && (
        <section>
          <form className="admin-form card" onSubmit={handleAddLocation}>
            <h3>{editingLocation ? 'Edit Restaurant Location' : 'Add Restaurant Location'}</h3>
            <div className="form-grid">
              <input placeholder="Branch name" value={locationForm.name} onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })} />
              <input placeholder="City" value={locationForm.city} onChange={(e) => setLocationForm({ ...locationForm, city: e.target.value })} />
              <input placeholder="Address" value={locationForm.address} onChange={(e) => setLocationForm({ ...locationForm, address: e.target.value })} />
              <input
                placeholder="Phone Number"
                value={locationForm.phone}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/\D/g, '');
                  setLocationForm({ ...locationForm, phone: numericValue });
                }}
                maxLength={10}
                minLength={10}
                pattern="[0-9]{10}"
                title="Phone number must be exactly 10 digits"
              />
              <input placeholder="Email ID" value={locationForm.email} onChange={(e) => setLocationForm({ ...locationForm, email: e.target.value })} />
              <input placeholder="Map Link (Google Maps URL)" value={locationForm.mapLink} onChange={(e) => setLocationForm({ ...locationForm, mapLink: e.target.value })} />
            </div>
            <div className="form-row">
              <button type="submit" className="btn btn-primary btn-sm">{editingLocation ? 'Update Location' : 'Add Location'}</button>
              {editingLocation && (
                <button type="button" className="btn btn-outline btn-sm" onClick={handleCancelEditLocation}>Cancel</button>
              )}
            </div>
          </form>
          
          <h3 className="mt-4">Location-wise Analytics (Click to manage tables)</h3>
          <div className="location-analytics-grid">
            {analytics.locationAnalytics.slice((locationPage - 1) * 8, locationPage * 8).map((loc) => (
              <div key={loc.branchId} className={`location-analytics-card card ${selectedLocationId === loc.branchId ? 'selected' : ''}`} onClick={() => setSelectedLocationId(loc.branchId === selectedLocationId ? null : loc.branchId)}>
                <h4>{loc.location}</h4>
                <p className="location-city">{loc.city}</p>
                <div className="location-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Tables</span>
                    <strong>{loc.totalTables}</strong>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Bookings</span>
                    <strong>{loc.totalBookings}</strong>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Revenue</span>
                    <strong>{formatINR(loc.revenue)}</strong>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Active Orders</span>
                    <strong>{loc.activeOrders}</strong>
                  </div>
                </div>
                <div className="table-status">
                  <span>Available: {loc.availableTables}</span>
                  <span>Reserved: {loc.reservedTables}</span>
                  <span>Occupied: {loc.occupiedTables}</span>
                </div>
              </div>
            ))}
          </div>

          {analytics.locationAnalytics.length > 8 && (
            <div className="admin-pagination">
              <button 
                type="button"
                className="btn btn-outline" 
                onClick={() => setLocationPage(p => Math.max(1, p - 1))}
                disabled={locationPage === 1}
              >
                Previous
              </button>
              <span className="page-info">
                Page {locationPage} of {Math.ceil(analytics.locationAnalytics.length / 8)}
              </span>
              <button 
                type="button"
                className="btn btn-outline" 
                onClick={() => setLocationPage(p => Math.min(Math.ceil(analytics.locationAnalytics.length / 8), p + 1))}
                disabled={locationPage === Math.ceil(analytics.locationAnalytics.length / 8)}
              >
                Next
              </button>
            </div>
          )}

          {selectedLocationId && (
            <div className="location-table-management card mt-4">
              <h3>Table Management - {locations.find((l) => l.id === selectedLocationId)?.name}</h3>
              <form className="admin-form" onSubmit={handleAddTable}>
                <div className="form-row">
                  <input
                    type="number"
                    placeholder="Table Number"
                    value={tableForm.number}
                    onChange={(e) => setTableForm({ ...tableForm, number: e.target.value })}
                    required
                  />
                  <select
                    value={tableForm.capacity}
                    onChange={(e) => setTableForm({ ...tableForm, capacity: Number(e.target.value) })}
                  >
                    <option value={2}>2-seater</option>
                    <option value={4}>4-seater</option>
                    <option value={6}>6-seater</option>
                    <option value={8}>8-seater</option>
                  </select>
                  <select
                    value={tableForm.status}
                    onChange={(e) => setTableForm({ ...tableForm, status: e.target.value })}
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="occupied">Occupied</option>
                  </select>
                  <button type="submit" className="btn btn-primary btn-sm">Add Table</button>
                </div>
              </form>
              <div className="admin-table-list">
                {tables.filter((t) => t.branchId === selectedLocationId).map((t) => (
                  <div key={t.id} className="admin-row card">
                    <span>Table {t.number} - {t.capacity}-seater - {t.status}</span>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => {
                      const status = prompt('Update status (available/reserved/occupied)', t.status);
                      if (status && ['available', 'reserved', 'occupied'].includes(status)) {
                        updateTable(t.id, { status });
                      }
                    }}>Edit Status</button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={async () => {
                      try {
                        await deleteTable(t.id);
                        toast.success('Deleted');
                      } catch (err) {
                        toast.error(err.message || 'Failed to delete table');
                      }
                    }}>Delete</button>
                  </div>
                ))}
              </div>
            </div>
          )}

        <div className="admin-table-list">
            {locations.slice((locationListPage - 1) * 8, locationListPage * 8).map((loc) => (
              <div key={loc.id} className="admin-row card">
                <div className="admin-location-info">
                  <span className="admin-location-name">{loc.name} - {loc.city}</span>
                  {loc.phone && <span className="admin-location-contact">📞 {loc.phone}</span>}
                  {loc.email && <span className="admin-location-contact">✉️ {loc.email}</span>}
                  {loc.mapLink && (
                    <a href={loc.mapLink} target="_blank" rel="noopener noreferrer" className="admin-location-map-link">
                      📍 View on Map
                    </a>
                  )}
                </div>
                <div className="location-actions">
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => handleEditLocation(loc)}>Edit</button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={async () => {
                    try {
                      await deleteLocation(loc.id);
                      toast.success('Location deleted');
                    } catch (err) {
                      toast.error(err.message || 'Failed to delete location');
                    }
                  }}>Delete</button>
                </div>
              </div>
            ))}
          </div>

          {locations.length > 8 && (
            <div className="admin-pagination">
              <button 
                type="button"
                className="btn btn-outline" 
                onClick={() => setLocationListPage(p => Math.max(1, p - 1))}
                disabled={locationListPage === 1}
              >
                Previous
              </button>
              <span className="page-info">
                Page {locationListPage} of {Math.ceil(locations.length / 8)}
              </span>
              <button 
                type="button"
                className="btn btn-outline" 
                onClick={() => setLocationListPage(p => Math.min(Math.ceil(locations.length / 8), p + 1))}
                disabled={locationListPage === Math.ceil(locations.length / 8)}
              >
                Next
              </button>
            </div>
          )}
        </section>
      )}

{tab === 'tables' && (
        <section>
          {/* Table Availability by Location */}
          <div className="table-availability-section">
            <h2>Table Availability by Location</h2>
            <div className="locations-grid">
              {locations.slice((tableLocationPage - 1) * 6, tableLocationPage * 6).map((loc) => {
                const availableTables = tables.filter((t) => t.branchId === loc.id && t.status === 'available');
                const reservedTables = tables.filter((t) => t.branchId === loc.id && t.status === 'reserved');
                const occupiedTables = tables.filter((t) => t.branchId === loc.id && t.status === 'occupied');
                return (
                  <div key={loc.id} className="location-availability card" onClick={() => {
                    setSelectedLocationId(loc.id === selectedLocationId ? null : loc.id);
                    setTableListPage(1);
                  }}>
                    <h3>{loc.name} — {loc.city}</h3>
                    <div className="table-stats">
                      <div className="stat-item available">
                        <span className="stat-label">Available</span>
                        <span className="stat-value">{availableTables.length}</span>
                      </div>
                      <div className="stat-item reserved">
                        <span className="stat-label">Reserved</span>
                        <span className="stat-value">{reservedTables.length}</span>
                      </div>
                      <div className="stat-item occupied">
                        <span className="stat-label">Occupied</span>
                        <span className="stat-value">{occupiedTables.length}</span>
                      </div>
                    </div>
                    {availableTables.length > 0 && (
                      <div className="available-tables-list">
                        <p className="tables-label">Available Tables:</p>
                        <div className="tables-chips">
                          {availableTables.map((t) => (
                            <span key={t.id} className="table-chip">
                              Table {t.number} ({t.capacity}-seater)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {availableTables.length === 0 && (
                      <p className="no-tables">No available tables</p>
                    )}
                  </div>
                );
              })}
            </div>
            
            {locations.length > 6 && (
              <div className="admin-pagination">
                <button 
                  type="button"
                  className="btn btn-outline" 
                  onClick={() => setTableLocationPage(p => Math.max(1, p - 1))}
                  disabled={tableLocationPage === 1}
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {tableLocationPage} of {Math.ceil(locations.length / 6)}
                </span>
                <button 
                  type="button"
                  className="btn btn-outline" 
                  onClick={() => setTableLocationPage(p => Math.min(Math.ceil(locations.length / 6), p + 1))}
                  disabled={tableLocationPage === Math.ceil(locations.length / 6)}
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {!selectedLocationId ? (
            <div className="location-selection-prompt card">
              <h3>Please Select a Location First</h3>
              <p>Choose a location from the overview to manage its tables.</p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setTab('locations')}
              >
                Go to Locations
              </button>
            </div>
          ) : (
            <>
              <div className="location-header">
                <h3>Managing Tables - {locations.find((l) => l.id === selectedLocationId)?.name}</h3>
                <div className="header-actions">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setSelectedLocationId(null)}
                  >
                    Change Location
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                      if (confirm('Are you sure you want to clear ALL tables and reservations? This cannot be undone.')) {
                        resetTables();
                        toast.success('All tables and reservations cleared');
                        // Force page reload to clear any cached state
                        setTimeout(() => window.location.reload(), 500);
                      }
                    }}
                  >
                    Clear All Tables
                  </button>
                </div>
              </div>
              <form className="admin-form card" onSubmit={handleAddTable}>
                <h3>Add Table</h3>
                <div className="form-row">
                  <input
                    type="number"
                    placeholder="Table number"
                    value={tableForm.number}
                    onChange={(e) => setTableForm({ ...tableForm, number: e.target.value })}
                    required
                  />
                  <select
                    value={tableForm.capacity}
                    onChange={(e) => setTableForm({ ...tableForm, capacity: Number(e.target.value) })}
                  >
                    <option value={2}>2-seater</option>
                    <option value={4}>4-seater</option>
                    <option value={6}>6-seater</option>
                    <option value={8}>8-seater</option>
                  </select>
                  <select
                    value={tableForm.status}
                    onChange={(e) => setTableForm({ ...tableForm, status: e.target.value })}
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="occupied">Occupied</option>
                  </select>
                  <button type="submit" className="btn btn-primary btn-sm">Add Table</button>
                </div>
              </form>
              <div className="admin-table-list">
                {tables
                  .filter((t) => t.branchId === selectedLocationId)
                  .slice((tableListPage - 1) * 8, tableListPage * 8)
                  .map((t) => {
                    const location = locations.find((l) => l.id === t.branchId);
                    return (
                      <div key={t.id} className="admin-row card">
                        <span>Table {t.number} · {t.capacity}-seater · {t.status} · {location?.name || 'Unknown Location'}</span>
                        <select
                          value={t.status}
                          onChange={(e) => {
                            updateTable(t.id, { status: e.target.value });
                            toast.success('Table updated');
                          }}
                        >
                          <option value="available">Available</option>
                          <option value="reserved">Reserved</option>
                          <option value="occupied">Occupied</option>
                        </select>
                        <button type="button" className="btn btn-danger btn-sm" onClick={async () => {
                          try {
                            await deleteTable(t.id);
                            toast.success('Deleted');
                          } catch (err) {
                            toast.error(err.message || 'Failed to delete table');
                          }
                        }}>Delete</button>
                      </div>
                    );
                  })}
                {tables.filter((t) => t.branchId === selectedLocationId).length === 0 && (
                  <p className="empty">No tables found for this location. Add your first table above.</p>
                )}
              </div>
              
              {tables.filter((t) => t.branchId === selectedLocationId).length > 8 && (
                <div className="admin-pagination">
                  <button 
                    type="button"
                    className="btn btn-outline" 
                    onClick={() => setTableListPage(p => Math.max(1, p - 1))}
                    disabled={tableListPage === 1}
                  >
                    Previous
                  </button>
                  <span className="page-info">
                    Page {tableListPage} of {Math.ceil(tables.filter((t) => t.branchId === selectedLocationId).length / 8)}
                  </span>
                  <button 
                    type="button"
                    className="btn btn-outline" 
                    onClick={() => setTableListPage(p => Math.min(Math.ceil(tables.filter((t) => t.branchId === selectedLocationId).length / 8), p + 1))}
                    disabled={tableListPage === Math.ceil(tables.filter((t) => t.branchId === selectedLocationId).length / 8)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {tab === 'inventory' && (
        <section>
          <div className="admin-header">
            <h2>Grocery Inventory Overview</h2>
            <p>Monitor raw ingredient stock status updated by the Kitchen Staff.</p>
          </div>
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Stock Status</th>
                </tr>
              </thead>
              <tbody>
                {groceries.slice((inventoryPage - 1) * 8, inventoryPage * 8).map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.name}</strong></td>
                    <td>
                      <span className={`status-badge ${item.available ? 'status-success' : 'status-danger'}`}>
                        {item.available ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!groceries || groceries.length === 0) && (
                  <tr>
                    <td colSpan="2" className="empty-state">No grocery inventory to display.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {groceries && groceries.length > 8 && (
            <div className="admin-pagination">
              <button 
                type="button"
                className="btn btn-outline" 
                onClick={() => setInventoryPage(p => Math.max(1, p - 1))}
                disabled={inventoryPage === 1}
              >
                Previous
              </button>
              <span className="page-info">
                Page {inventoryPage} of {Math.ceil(groceries.length / 8)}
              </span>
              <button 
                type="button"
                className="btn btn-outline" 
                onClick={() => setInventoryPage(p => Math.min(Math.ceil(groceries.length / 8), p + 1))}
                disabled={inventoryPage === Math.ceil(groceries.length / 8)}
              >
                Next
              </button>
            </div>
          )}
        </section>
      )}

      {tab === 'menu' && (
        <section>
          <form className="admin-form card" onSubmit={editingMenuItem ? handleUpdateMenuItem : handleAddMenu}>
            <h3>{editingMenuItem ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
            <div className="form-grid">
              <input placeholder="Name" value={menuForm.name} onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })} required />
              <input placeholder="Price (₹)" type="number" value={menuForm.price} onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })} required />
              <input placeholder="Category" value={menuForm.category} onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })} />
              <textarea placeholder="Description" value={menuForm.description} onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })} rows={2} />
            </div>
            <div className="image-upload-section">
              <label className="image-upload-label">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="image-upload-input"
                />
                <div className="image-upload-button">
                  <span className="upload-icon">📷</span>
                  <span className="upload-text">{selectedImage ? selectedImage.name : 'Choose Image'}</span>
                </div>
              </label>
              {imagePreview && (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                  <button type="button" className="remove-image-btn" onClick={handleRemoveImage}>
                    ✕
                  </button>
                </div>
              )}
            </div>
            <div className="form-row">
              <button type="submit" className="btn btn-primary btn-sm" disabled={uploadingImage}>
                {uploadingImage ? 'Uploading...' : (editingMenuItem ? 'Update Item' : 'Add Item')}
              </button>
              {editingMenuItem && (
                <button type="button" className="btn btn-outline btn-sm" onClick={handleCancelEdit}>Cancel</button>
              )}
            </div>
          </form>
          <div className="menu-sections">
            <h4 style={{ color: 'var(--gold)', margin: '1.5rem 0 1rem' }}>Active Menu Items</h4>
            {menu.filter(m => m.available !== false).length === 0 ? (
              <p className="empty">No active menu items.</p>
            ) : (
              <div className="admin-menu-list">
                {menu.filter(m => m.available !== false).map((m) => (
                  <div key={m.id} className="admin-row card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '250px' }}>
                      {m.image ? (
                        <img src={m.image} alt={m.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                      ) : (
                        <div style={{ width: '60px', height: '60px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🍲</div>
                      )}
                      <div>
                        <strong style={{ display: 'block', color: 'var(--gold)', fontSize: '1.1rem' }}>{m.name} — {formatINR(m.price)}</strong>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{m.category} | Available</span>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text)', margin: '4px 0 0', maxWidth: '400px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{m.description}</p>
                      </div>
                    </div>
                    <div className="menu-actions">
                      <button type="button" className="btn btn-icon btn-outline" onClick={() => handleEditMenuItem(m)} title="Edit">
                        <MdEdit /> Edit
                      </button>
                      <button type="button" className="btn btn-icon btn-outline" onClick={() => updateMenuItem(m.id, { ...m, available: false })} title="Hide">
                        <MdVisibilityOff /> Hide
                      </button>
                      <button type="button" className="btn btn-icon btn-danger" onClick={() => setDeleteConfirmItem(m)} title="Delete">
                        <MdDelete /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h4 style={{ color: 'var(--gold)', margin: '2rem 0 1rem' }}>Hidden Items</h4>
            {menu.filter(m => m.available === false).length === 0 ? (
              <p className="empty">No hidden items.</p>
            ) : (
              <div className="admin-menu-list">
                {menu.filter(m => m.available === false).map((m) => (
                  <div key={m.id} className="admin-row card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', opacity: 0.7, borderLeft: '3px solid #dc2626' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '250px' }}>
                      {m.image ? (
                        <img src={m.image} alt={m.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', filter: 'grayscale(50%)' }} />
                      ) : (
                        <div style={{ width: '60px', height: '60px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🍲</div>
                      )}
                      <div>
                        <strong style={{ display: 'block', color: 'var(--gold)', fontSize: '1.1rem' }}>{m.name} — {formatINR(m.price)}</strong>
                        <span style={{ fontSize: '0.85rem', color: 'var(--danger)' }}>{m.category} | Hidden</span>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text)', margin: '4px 0 0', maxWidth: '400px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{m.description}</p>
                      </div>
                    </div>
                    <div className="menu-actions">
                      <button type="button" className="btn btn-icon btn-outline" onClick={() => handleEditMenuItem(m)} title="Edit">
                        <MdEdit /> Edit
                      </button>
                      <button type="button" className="btn btn-icon btn-outline" onClick={() => updateMenuItem(m.id, { ...m, available: true })} title="Show">
                        <MdVisibility /> Show
                      </button>
                      <button type="button" className="btn btn-icon btn-danger" onClick={() => setDeleteConfirmItem(m)} title="Delete">
                        <MdDelete /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {tab === 'reservations' && (
        <div className="admin-res-list">
          <div className="reservation-filters card">
            <h3>Filter Reservations</h3>
            <div className="form-row">
              <select
                value={reservationFilters.branchId}
                onChange={(e) => {
                  setReservationFilters({ ...reservationFilters, branchId: e.target.value });
                  setReservationPage(1);
                }}
              >
                <option value="">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name} - {loc.city}</option>
                ))}
              </select>
              <CustomDatePicker
                id="filterDate"
                selected={reservationFilters.date ? new Date(reservationFilters.date) : null}
                onChange={(date) => {
                  const localDate = date ? new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0] : '';
                  setReservationFilters({ ...reservationFilters, date: localDate });
                  setReservationPage(1);
                }}
                placeholderText="Filter by date"
              />
              <select
                value={reservationFilters.status}
                onChange={(e) => {
                  setReservationFilters({ ...reservationFilters, status: e.target.value });
                  setReservationPage(1);
                }}
              >
                <option value="">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setReservationFilters({ branchId: '', date: '', status: '' });
                  setReservationPage(1);
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
          {reservations.length === 0 ? (
            <p className="empty">No reservations</p>
          ) : (() => {
            const filteredResList = reservations.filter((r) => {
              if (reservationFilters.branchId && r.branchId !== reservationFilters.branchId) return false;
              if (reservationFilters.date && r.date !== reservationFilters.date) return false;
              if (reservationFilters.status && r.status !== reservationFilters.status) return false;
              return true;
            });

            if (filteredResList.length === 0) {
              return <p className="empty">No matching reservations for selected filters</p>;
            }

            return (
              <>
                {filteredResList
                  .slice((reservationPage - 1) * 4, reservationPage * 4)
                  .map((r) => {
                    const branch = locations.find((l) => l.id === r.branchId);
                    const order = orders.find((o) => o.reservationId === r.id);
                    return (
                      <div key={r.id} className="reservation-detail-card card">
                        <div className="reservation-header">
                          <div>
                            <h4>Reservation #{r.id.slice(-6)}</h4>
                            <p className="reservation-meta">
                              <strong>Customer:</strong> {r.name} ({r.email})
                            </p>
                            <p className="reservation-meta">
                              <strong>Location:</strong> {branch?.name || r.branchId} - {branch?.city}
                            </p>
                            <p className="reservation-meta">
                              <strong>Table:</strong> #{r.tableNumber} · <strong>Guests:</strong> {r.guests}
                            </p>
                            <p className="reservation-meta">
                              <strong>Date:</strong> {r.date} · <strong>Time:</strong> {r.time}
                            </p>
                          </div>
                          <div className="reservation-status">
                            <span className={`badge badge-${r.status === 'cancelled' ? 'danger' : 'success'}`}>
                              {r.status}
                            </span>
                            <span className={`badge badge-${r.paymentStatus === 'paid' ? 'success' : 'warning'}`}>
                              {r.paymentStatus}
                            </span>
                          </div>
                        </div>
                        {order && order.items && order.items.length > 0 && (
                          <div className="reservation-foods">
                            <h5>Ordered Foods</h5>
                            <div className="food-items-list">
                              {order.items.map((item) => (
                                <div key={item.id} className="food-item">
                                  <span>{item.name}</span>
                                  <span>×{item.qty}</span>
                                  <span>{formatINR(item.price * item.qty)}</span>
                                </div>
                              ))}
                            </div>
                            <div className="food-total">
                              <strong>Total: {formatINR(order.total)}</strong>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                
                {filteredResList.length > 4 && (
                  <div className="admin-pagination">
                    <button 
                      type="button"
                      className="btn btn-outline" 
                      onClick={() => setReservationPage(p => Math.max(1, p - 1))}
                      disabled={reservationPage === 1}
                    >
                      Previous
                    </button>
                    <span className="page-info">
                      Page {reservationPage} of {Math.ceil(filteredResList.length / 4)}
                    </span>
                    <button 
                      type="button"
                      className="btn btn-outline" 
                      onClick={() => setReservationPage(p => Math.min(Math.ceil(filteredResList.length / 4), p + 1))}
                      disabled={reservationPage === Math.ceil(filteredResList.length / 4)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {tab === 'customers' && (
        <div className="admin-customers">
          <h3>Customer Order Analytics</h3>
          <div className="customer-analytics-grid">
            {analytics.customerAnalytics.slice((customerPage - 1) * 8, customerPage * 8).map((cust) => (
              <div key={cust.customerEmail} className="customer-analytics-card card">
                <h4>{cust.customerName}</h4>
                <p className="customer-email">{cust.customerEmail}</p>
                <div className="customer-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Orders</span>
                    <strong>{cust.totalOrders}</strong>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Spent</span>
                    <strong>{formatINR(cust.totalSpent)}</strong>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Reservations</span>
                    <strong>{cust.totalReservations}</strong>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Loyalty Points</span>
                    <strong>{cust.loyaltyPoints}</strong>
                  </div>
                </div>
                {cust.lastOrder && (
                  <p className="last-order">Last Order: {new Date(cust.lastOrder).toLocaleDateString('en-IN')}</p>
                )}
              </div>
            ))}
          </div>
          
          {analytics.customerAnalytics.length > 8 && (
            <div className="admin-pagination">
              <button 
                type="button"
                className="btn btn-outline" 
                onClick={() => setCustomerPage(p => Math.max(1, p - 1))}
                disabled={customerPage === 1}
              >
                Previous
              </button>
              <span className="page-info">
                Page {customerPage} of {Math.ceil(analytics.customerAnalytics.length / 8)}
              </span>
              <button 
                type="button"
                className="btn btn-outline" 
                onClick={() => setCustomerPage(p => Math.min(Math.ceil(analytics.customerAnalytics.length / 8), p + 1))}
                disabled={customerPage === Math.ceil(analytics.customerAnalytics.length / 8)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {tab === 'offers' && (
        <div className="offers-admin">
          <div className="offers-header">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setShowOfferForm(!showOfferForm)}
            >
              <MdAdd /> Add Offer
            </button>
          </div>
          
          {showOfferForm && (
            <form className="admin-form card" onSubmit={editingOffer ? handleUpdateOffer : handleAddOffer}>
              <h3>{editingOffer ? 'Edit Offer' : 'Add New Offer'}</h3>
              <div className="form-grid">
                <input
                  placeholder="Offer Title"
                  value={offerForm.title}
                  onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                  required
                />
                <input
                  placeholder="Description"
                  value={offerForm.desc}
                  onChange={(e) => setOfferForm({ ...offerForm, desc: e.target.value })}
                  required
                />
                <input
                  type="number"
                  placeholder="Minimum Amount (₹)"
                  value={offerForm.minAmount}
                  onChange={(e) => setOfferForm({ ...offerForm, minAmount: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Discount Percentage (%)"
                  value={offerForm.percent}
                  onChange={(e) => setOfferForm({ ...offerForm, percent: e.target.value })}
                />
                <input
                  placeholder="Reward (optional, e.g., Free Dessert)"
                  value={offerForm.reward}
                  onChange={(e) => setOfferForm({ ...offerForm, reward: e.target.value })}
                />
              </div>
              <div className="form-row">
                <button type="submit" className="btn btn-primary btn-sm">{editingOffer ? 'Update Offer' : 'Add Offer'}</button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setShowOfferForm(false);
                    setEditingOffer(null);
                    setOfferForm({ title: '', desc: '', minAmount: '', percent: '', reward: '' });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="admin-table-list mt-4">
            {/* Hardcoded System Offer for Birthday */}
            <div className="admin-row card" style={{ borderLeft: '4px solid #c9a227', backgroundColor: 'rgba(201, 162, 39, 0.05)' }}>
              <div>
                <strong>🎉 System Offer: Birthday Discount</strong>
                <p>Automatically applies a 50% discount to reservations when the date matches the customer's registered Date of Birth.</p>
                <small>Threshold: ₹0 | Discount: 50% | Backend Controlled</small>
              </div>
              <div className="location-actions">
                <span className="badge badge-success">Always Active</span>
                <span className="badge badge-warning" style={{ marginLeft: '8px' }} title="This is an automated backend offer and cannot be modified.">System</span>
              </div>
            </div>

            {offers.map((o) => (
              <div key={o.id} className="admin-row card">
                <div>
                  <strong>{o.title}</strong>
                  <p>{o.desc}</p>
                  <small>Threshold: {formatINR(o.minAmount || 0)} | Discount: {o.percent || 0}% {o.reward ? `| Reward: ${o.reward}` : ''}</small>
                </div>
                <div className="location-actions">
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => handleEditOffer(o)}>Edit</button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={async () => {
                    try {
                      await deleteOffer(o.id);
                      toast.success('Offer deleted');
                    } catch (err) {
                      toast.error(err.message || 'Failed to delete offer');
                    }
                  }}>Delete</button>
                  <label className="toggle ml-2">
                    <input
                      type="checkbox"
                      checked={o.active}
                      onChange={async () => {
                        try {
                          await updateOffer(o.id, { ...o, active: !o.active });
                          toast.success('Offer active state updated');
                        } catch (err) {
                          toast.error(err.message || 'Failed to update offer');
                        }
                      }}
                    />
                    Active
                  </label>
                </div>
              </div>
            ))}
          </div>
          <div className="card">
            <h4>Customer Feedback Moderation</h4>
            {feedbackList.slice(-5).map((f) => (
              <div key={f.id} className="admin-row">
                <span>{f.name}: {f.message}</span>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => removeFeedback(f.id)}>Hide</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {deleteConfirmItem && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmItem(null)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this menu item? This action cannot be undone.</p>
            <div className="form-row mt-4" style={{ justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ backgroundColor: '#6c757d', color: 'white', borderColor: '#6c757d' }}
                onClick={() => setDeleteConfirmItem(null)}
              >
                No, Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={async () => {
                  try {
                    await deleteMenuItem(deleteConfirmItem.id);
                    toast.success('Menu item deleted successfully.');
                  } catch (err) {
                    toast.error(err.message || 'Failed to delete menu item.');
                  }
                  setDeleteConfirmItem(null);
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
