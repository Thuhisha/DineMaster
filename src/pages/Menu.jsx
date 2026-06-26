import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiShoppingBag } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import FoodCard from '../components/menu/FoodCard';
import { useApp } from '../context/AppContext';
import { useCart } from '../context/CartContext';
import { MENU_CATEGORIES, formatINR } from '../data/initialData';
import './Menu.css';

export default function Menu() {
  const { menu, pendingReservation, tables, locations } = useApp();
  const { cartTotal, cartCount } = useCart();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  // Get the selected location from pending reservation
  const selectedLocation = pendingReservation ? locations.find((l) => l.id === pendingReservation.branchId) : null;

  // Log when tables change to ensure we're getting live data
  useEffect(() => {
    console.log('[Menu] Tables updated:', tables.length);
    console.log('[Menu] Available tables:', tables.filter(t => t.status === 'available').length);
  }, [tables]);

  const filtered = useMemo(() => {
    return menu.filter((item) => {
      const matchCat = category === 'All' || item.category === category;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      const available = item.available !== false;
      return matchCat && matchSearch && available;
    });
  }, [menu, search, category]);

  return (
    <div className="menu-page">
      <header className="page-header">
        <h1>Our Menu</h1>
        <p>{pendingReservation ? 'Step 2 of 4 — Add food items to your reservation' : 'Explore authentic flavors — prices in Indian Rupees (₹)'}</p>
        {selectedLocation && (
          <p className="location-info">Location: {selectedLocation.name} — {selectedLocation.city}</p>
        )}
      </header>

      <div className="container">
        <div className="menu-toolbar">
          <div className="search-wrap">
            <FiSearch />
            <input
              type="search"
              placeholder="Search dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {(cartCount > 0 || pendingReservation) && (
            <div className="cart-summary-bar">
              {cartCount > 0 ? (
                <Link to="/cart" className="btn btn-outline btn-sm">
                  <FiShoppingBag />
                  <span>{cartCount} items · {formatINR(cartTotal)}</span>
                </Link>
              ) : (
                <span className="empty-cart-text">No items selected</span>
              )}
              {pendingReservation ? (
                <Link to="/reservation-details" className="btn btn-primary btn-sm">
                  {cartCount > 0 ? 'Continue to Reservation Details' : 'Skip & Continue to Details'}
                </Link>
              ) : cartCount > 0 ? (
                <Link to="/reserve" className="btn btn-primary btn-sm">Checkout with Booking</Link>
              ) : null}
            </div>
          )}
        </div>

        <div className="category-filters">
          {MENU_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`filter-chip ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="empty-msg">No dishes found. Try another search or category.</p>
        ) : (
          <motion.div className="menu-grid" layout>
            {filtered.map((item, i) => (
              <FoodCard key={item.id} item={item} index={i} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
