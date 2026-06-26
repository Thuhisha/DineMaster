import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { formatINR } from '../../data/initialData';
import Pagination from '../../components/common/Pagination';
import './AdminDashboard.css';

const TABS = ['overview', 'tables', 'menu', 'reservations', 'customers', 'offers'];
const ITEMS_PER_PAGE = 5;

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const { users } = useAuth();
  const {
    tables,
    menu,
    reservations,
    offers,
    setOffers,
    addTable,
    updateTable,
    deleteTable,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getAnalytics,
  } = useApp();

  const analytics = getAnalytics();
  const customers = users.filter((u) => u.role === 'customer');

  const [tableForm, setTableForm] = useState({ number: '', capacity: 4, status: 'available' });
  const [menuForm, setMenuForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course',
    rating: 4.5,
    image: '',
  });

  // Pagination states
  const [pageTables, setPageTables] = useState(1);
  const [pageMenu, setPageMenu] = useState(1);
  const [pageRes, setPageRes] = useState(1);
  const [pageCust, setPageCust] = useState(1);
  const [pageOff, setPageOff] = useState(1);

  const paginate = (items, page) => {
    const sorted = [...items].reverse(); // New records first
    const start = (page - 1) * ITEMS_PER_PAGE;
    return sorted.slice(start, start + ITEMS_PER_PAGE);
  };

  const handleAddTable = (e) => {
    e.preventDefault();
    addTable(tableForm);
    setTableForm({ number: '', capacity: 4, status: 'available' });
    toast.success('Table added');
  };

  const handleAddMenu = (e) => {
    e.preventDefault();
    addMenuItem({
      ...menuForm,
      price: Number(menuForm.price),
      rating: Number(menuForm.rating),
      image: menuForm.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
    });
    setMenuForm({ name: '', description: '', price: '', category: 'Main Course', rating: 4.5, image: '' });
    toast.success('Menu item added');
  };

  return (
    <div className="admin-dash">
      <div className="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            className={`admin-tab ${tab === t ? 'active' : ''}`}
            onClick={() => {
              setTab(t);
              // Reset pages when switching tabs
              setPageTables(1); setPageMenu(1); setPageRes(1); setPageCust(1); setPageOff(1);
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="admin-overview">
          <div className="grid-4 analytics-grid">
            <div className="analytics-card">
              <strong>{analytics.totalReservations}</strong>
              <span>Total Reservations</span>
            </div>
            <div className="analytics-card">
              <strong>{analytics.cancelled}</strong>
              <span>Cancelled</span>
            </div>
            <div className="analytics-card">
              <strong>{analytics.birthdayBookings}</strong>
              <span>Birthday Bookings</span>
            </div>
            <div className="analytics-card">
              <strong>{formatINR(analytics.revenue)}</strong>
              <span>Revenue</span>
            </div>
          </div>
        </div>
      )}

      {tab === 'tables' && (
        <section>
          <form className="admin-form card" onSubmit={handleAddTable}>
            <h3>Add Table</h3>
            <div className="form-row">
              <input placeholder="Table number" value={tableForm.number} onChange={(e) => setTableForm({ ...tableForm, number: e.target.value })} required />
              <input type="number" placeholder="Capacity" value={tableForm.capacity} onChange={(e) => setTableForm({ ...tableForm, capacity: e.target.value })} />
              <select value={tableForm.status} onChange={(e) => setTableForm({ ...tableForm, status: e.target.value })}>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="occupied">Occupied</option>
              </select>
              <button type="submit" className="btn btn-primary btn-sm">Add</button>
            </div>
          </form>
          <div className="admin-table-list">
            {paginate(tables, pageTables).map((t) => (
              <div key={t.id} className="admin-row card">
                <span>Table {t.number} · {t.capacity} seats</span>
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
                <button type="button" className="btn btn-danger btn-sm" onClick={() => { 
                  if (window.confirm('Are you sure you want to delete this table?')) {
                    deleteTable(t.id); 
                    toast.success('Deleted'); 
                  }
                }}>Delete</button>
              </div>
            ))}
            <Pagination 
              currentPage={pageTables} 
              totalPages={Math.ceil(tables.length / ITEMS_PER_PAGE)} 
              onPageChange={setPageTables} 
            />
          </div>
        </section>
      )}

      {tab === 'menu' && (
        <section>
          <form className="admin-form card" onSubmit={handleAddMenu}>
            <h3>Add Menu Item</h3>
            <div className="form-grid">
              <input placeholder="Name" value={menuForm.name} onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })} required />
              <input placeholder="Price (₹)" type="number" value={menuForm.price} onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })} required />
              <input placeholder="Category" value={menuForm.category} onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })} />
              <input placeholder="Image URL" value={menuForm.image} onChange={(e) => setMenuForm({ ...menuForm, image: e.target.value })} />
              <textarea placeholder="Description" value={menuForm.description} onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })} rows={2} />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">Add Item</button>
          </form>
          <div className="admin-menu-list">
            {paginate(menu, pageMenu).map((m) => (
              <div key={m.id} className="admin-row card" style={{ alignItems: 'center' }}>
                <img src={m.image} alt={m.name} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
                <span style={{ flex: 1, marginLeft: '15px' }}>{m.name} — {formatINR(m.price)}</span>
                
                <label className="toggle" style={{ marginRight: '15px' }}>
                  <input
                    type="checkbox"
                    checked={m.available !== false}
                    onChange={() => {
                      updateMenuItem(m.id, { available: m.available === false });
                      toast.success(m.available === false ? 'Item is now visible' : 'Item is now hidden');
                    }}
                  />
                  Visible
                </label>

                <button type="button" className="btn btn-outline btn-sm" onClick={() => {
                  const newPrice = prompt('Enter new price:', m.price);
                  if (newPrice !== null && newPrice !== '') {
                    const newImage = prompt('Enter new image URL (leave blank to keep current):', m.image);
                    const updates = { price: Number(newPrice) };
                    if (newImage && newImage.trim() !== '') updates.image = newImage.trim();
                    updateMenuItem(m.id, updates);
                    toast.success('Item updated');
                  }
                }}>Edit</button>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => { 
                  if (window.confirm('Are you sure you want to delete this item?')) {
                    deleteMenuItem(m.id); 
                    toast.success('Removed'); 
                  }
                }}>Delete</button>
              </div>
            ))}
            <Pagination 
              currentPage={pageMenu} 
              totalPages={Math.ceil(menu.length / ITEMS_PER_PAGE)} 
              onPageChange={setPageMenu} 
            />
          </div>
        </section>
      )}

      {tab === 'reservations' && (
        <div className="admin-res-list">
          {reservations.length === 0 ? (
            <p className="empty">No reservations</p>
          ) : (
            <>
              {paginate(reservations, pageRes).map((r) => (
                <div key={r.id} className="admin-row card">
                  <span>{r.name} · Table {r.tableNumber} · {r.date} {r.time}</span>
                  <span className={`badge badge-${r.status === 'cancelled' ? 'danger' : 'success'}`}>{r.status}</span>
                </div>
              ))}
              <Pagination 
                currentPage={pageRes} 
                totalPages={Math.ceil(reservations.length / ITEMS_PER_PAGE)} 
                onPageChange={setPageRes} 
              />
            </>
          )}
        </div>
      )}

      {tab === 'customers' && (
        <div className="admin-customers">
          {paginate(customers, pageCust).map((c) => (
            <div key={c.id} className="admin-row card">
              <span>{c.name} — {c.email}</span>
              <span>{c.loyaltyPoints ?? 0} pts</span>
            </div>
          ))}
          <Pagination 
            currentPage={pageCust} 
            totalPages={Math.ceil(customers.length / ITEMS_PER_PAGE)} 
            onPageChange={setPageCust} 
          />
        </div>
      )}

      {tab === 'offers' && (
        <div className="offers-admin">
          {paginate(offers, pageOff).map((o) => (
            <div key={o.id} className="admin-row card">
              <div>
                <strong>{o.title}</strong>
                <p>{o.desc}</p>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={o.active}
                  onChange={() => {
                    setOffers((prev) =>
                      prev.map((x) => (x.id === o.id ? { ...x, active: !x.active } : x))
                    );
                    toast.success('Offer updated');
                  }}
                />
                Active
              </label>
            </div>
          ))}
          <Pagination 
            currentPage={pageOff} 
            totalPages={Math.ceil(offers.length / ITEMS_PER_PAGE)} 
            onPageChange={setPageOff} 
          />
        </div>
      )}
    </div>
  );
}
