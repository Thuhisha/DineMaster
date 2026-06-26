import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './AuthLayout.css';

export default function AuthLayout() {
  return (
    <motion.div className="auth-layout" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div className="auth-layout-bg" aria-hidden />
      <div className="auth-layout-grid">
        <aside className="auth-brand-panel">
          <Link to="/" className="auth-logo">
            <span className="logo-icon">D</span>
            <span>DineMaster</span>
          </Link>
          <h1>Premium Dining,<br />Seamlessly Managed</h1>
          <p>Reserve tables, order from the kitchen, and run your restaurant — all in one place.</p>
          <ul className="auth-features">
            <li>Role-based secure access</li>
            <li>Live table & kitchen sync</li>
            <li>Analytics for admins</li>
          </ul>
        </aside>
        <main className="auth-form-panel">
          <Outlet />
        </main>
      </div>
    </motion.div>
  );
}
