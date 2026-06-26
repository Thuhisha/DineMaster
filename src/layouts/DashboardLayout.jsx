import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiHome, FiCalendar, FiMenu, FiLogOut, FiGrid,
  FiBarChart2, FiChevronLeft, FiChevronRight, FiBell,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import './DashboardLayout.css';

const NAV = {
  customer: [
    { to: '/dashboard', label: 'Overview', icon: FiHome, end: true },
    { to: '/menu', label: 'Order Food', icon: FiMenu },
    { to: '/reserve', label: 'New Booking', icon: FiCalendar },
  ],
  chef: [{ to: '/chef', label: 'Kitchen Queue', icon: FiGrid, end: true }],
  admin: [{ to: '/admin', label: 'Overview', icon: FiBarChart2, end: true }],
};

export default function DashboardLayout({ role }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { chefQueue } = useApp();
  const navigate = useNavigate();
  const chefNewCount = chefQueue.filter((q) => q.isNew && q.kitchenStatus !== 'served').length;
  const links = NAV[role] || [];
  const titles = { customer: 'My Dashboard', chef: 'Chef Dashboard', admin: 'Admin Panel' };

  return (
    <div className={`dash-layout ${collapsed ? 'collapsed' : ''}`}>
      <aside className="dash-sidebar">
        <div className="dash-sidebar-head">
          <span className="logo-icon">D</span>
          {!collapsed && <span className="dash-title">{titles[role]}</span>}
        </div>
        <nav className="dash-nav">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className="dash-nav-link">
              <Icon />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
          {role === 'customer' && (
            <NavLink to="/" className="dash-nav-link">
              <FiHome /> {!collapsed && <span>Back to Site</span>}
            </NavLink>
          )}
        </nav>
        <button
          type="button"
          className="dash-collapse"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
        <div className="dash-user">
          {!collapsed && (
            <div>
              <strong>{user?.name}</strong>
              <span className="badge badge-gold">{user?.role}</span>
            </div>
          )}
          <button
            type="button"
            className="dash-logout"
            onClick={() => { logout(); navigate('/login'); }}
            title="Logout"
          >
            <FiLogOut />
          </button>
        </div>
      </aside>
      <main className="dash-main">
        <header className="dash-header">
          <div>
            <h1>{titles[role]}</h1>
            <p>Welcome back, {user?.name}</p>
          </div>
          {role === 'chef' && chefNewCount > 0 && (
            <span className="dash-notif"><FiBell /> {chefNewCount} new</span>
          )}
        </header>
        <motion.div
          className="dash-content"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
