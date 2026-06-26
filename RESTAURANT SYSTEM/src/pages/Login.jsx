import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiLogIn, FiUserPlus } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import RoleCard from '../components/auth/RoleCard';
import { ROLES, ROLE_LIST } from '../data/roleConfig';
import './Auth.css';

export default function Login() {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get('mode') === 'register' ? 'register' : 'login');
  const [selectedRole, setSelectedRole] = useState('customer');
  const [form, setForm] = useState({ email: '', password: '', name: '', phone: '', birthday: '' });
  const [loading, setLoading] = useState(false);

  const role = ROLES[selectedRole];

  useEffect(() => {
    if (user) {
      const dash = ROLES[user.role]?.dashboard || '/dashboard';
      navigate(dash, { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (mode === 'login' && role) {
      setForm((f) => ({
        ...f,
        email: role.demoEmail,
        password: role.demoPassword,
      }));
    }
  }, [selectedRole, mode, role]);

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    const r = ROLES[roleId];
    if (mode === 'login') {
      setForm((f) => ({ ...f, email: r.demoEmail, password: r.demoPassword }));
    }
  };

  const redirectByRole = (roleId) => {
    if (from && roleId === 'customer') return navigate(from);
    navigate(ROLES[roleId].dashboard);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const result = login(form.email, form.password, selectedRole);
    setLoading(false);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(`Welcome to DineMaster, ${role.title}!`);
    redirectByRole(result.role);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (selectedRole !== 'customer') {
      toast.error('Only customers can self-register. Chefs and admins are assigned by management.');
      return;
    }
    if (!/^\d{10}$/.test((form.phone || '').replace(/\D/g, ''))) {
      toast.error('Enter a valid 10-digit mobile number');
      return;
    }
    if ((form.password || '').length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const result = register(form);
    setLoading(false);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success('Account created! 50 loyalty points added.');
    navigate('/dashboard');
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="login-hub glass-card">
      <motion.div className="login-hub-head" layout>
        <h2>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
        <p>Select your role and {mode === 'login' ? 'enter credentials' : 'fill in your details'}</p>
      </motion.div>

      <motion.div className="role-cards-row" layout>
        {ROLE_LIST.map((r) => (
          <RoleCard
            key={r.id}
            role={r}
            selected={selectedRole === r.id}
            onSelect={handleRoleSelect}
          />
        ))}
      </motion.div>

      <div className="auth-mode-tabs">
        <button
          type="button"
          className={mode === 'login' ? 'active' : ''}
          onClick={() => setMode('login')}
        >
          <FiLogIn /> Login
        </button>
        <button
          type="button"
          className={mode === 'register' ? 'active' : ''}
          onClick={() => setMode('register')}
          disabled={selectedRole !== 'customer'}
          title={selectedRole !== 'customer' ? 'Registration is for customers only' : ''}
        >
          <FiUserPlus /> Register
        </button>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoadingSpinner label="Authenticating..." />
          </motion.div>
        ) : mode === 'login' ? (
          <motion.form
            key="login"
            className="auth-form-glass"
            onSubmit={handleLogin}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
          >
            <motion.div className="role-badge" style={{ background: role.gradient }}>
              {role.title} Login
            </motion.div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full">
              Login as {role.title}
            </button>
            <p className="demo-note">Demo credentials auto-filled per role</p>
          </motion.form>
        ) : (
          <motion.form
            key="register"
            className="auth-form-glass"
            onSubmit={handleRegister}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
          >
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="reg-email">Email</label>
              <input id="reg-email" name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="reg-password">Password</label>
              <input id="reg-password" name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} />
            </div>
            <div className="form-row-auth">
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="birthday">Birthday</label>
                <input id="birthday" name="birthday" type="date" value={form.birthday} onChange={handleChange} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full">Create Customer Account</button>
          </motion.form>
        )}
      </AnimatePresence>

      <p className="auth-back">
        <Link to="/">← Back to Restaurant Home</Link>
      </p>
    </div>
  );
}
