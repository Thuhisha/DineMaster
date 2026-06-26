import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiShoppingBag, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const dashPath =
    user?.role === 'admin' ? '/admin' : user?.role === 'chef' ? '/chef' : '/dashboard';

  const links = [
    { to: '/', label: 'Home' },
    { to: '/menu', label: 'Menu' },
    { to: '/tables', label: 'Tables' },
    { to: '/reserve', label: 'Reserve' },
    { to: '/feedback', label: 'Feedback' },
  ];

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo" onClick={() => setOpen(false)}>
          <span className="logo-icon">D</span>
          <span className="logo-text">DineMaster</span>
        </Link>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
          {user ? (
            <>
              <NavLink to={dashPath} onClick={() => setOpen(false)}>Dashboard</NavLink>
              <button type="button" className="btn-ghost nav-btn" onClick={() => { logout(); navigate('/'); setOpen(false); }}>
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/login" onClick={() => setOpen(false)}>Login</NavLink>
          )}
        </nav>

        <div className="nav-actions">
          <Link to="/menu" className="cart-btn" aria-label="Cart">
            <FiShoppingBag />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
          {!user && (
            <Link to="/register" className="btn btn-primary btn-sm hide-mobile">
              Join Us
            </Link>
          )}
          {user && (
            <Link to={dashPath} className="user-avatar" aria-label="Dashboard">
              <FiUser />
            </Link>
          )}
          <button type="button" className="menu-toggle" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </header>
  );
}
