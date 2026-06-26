import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import CustomDatePicker from '../components/common/CustomDatePicker';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    birthday: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userEnteredCode, setUserEnteredCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    if (form.phone && form.phone.length !== 10) {
      return toast.error('Phone number must be exactly 10 digits');
    }

    setIsSubmitting(true);
    const result = await register(form);
    setIsSubmitting(false);

    if (!result.ok) {
      toast.error(result.message || 'Registration failed.');
      return;
    }
    
    setIsSuccess(true);
    toast.success('Registration successful! Please check your email.');
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!userEnteredCode || userEnteredCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }
    
    setLoading(true);
    try {
      await authApi.verifyEmail(form.email, userEnteredCode);
      setLoading(false);
      toast.success('Account verified! You can now log in.');
      navigate('/login');
    } catch (err) {
      setLoading(false);
      toast.error(err.message || 'Verification failed');
    }
  };

  if (isSuccess) {
    return (
      <motion.div className="auth-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="auth-card card">
          <h2 style={{ textAlign: 'center' }}>Verify Your Email</h2>
          <p style={{ textAlign: 'center', marginBottom: '20px' }}>We've sent a 6-digit verification code to <strong>{form.email}</strong>.</p>
          
          <form onSubmit={handleVerify}>
            <div className="form-group">
              <label htmlFor="userEnteredCode">Verification Code</label>
              <input
                id="userEnteredCode"
                type="text"
                value={userEnteredCode}
                onChange={(e) => setUserEnteredCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                required
                style={{ letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.2em' }}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full mt-4" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
          </form>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="auth-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="auth-card card">
        <h1>Join DineMaster</h1>
        <p className="auth-sub">Create your customer account — earn 50 loyalty points</p>
        
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => {
                const numericValue = e.target.value.replace(/\D/g, '');
                setForm({ ...form, phone: numericValue });
              }}
              maxLength={10}
              minLength={10}
              pattern="[0-9]{10}"
              title="Phone number must be exactly 10 digits"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="birthday">Birthday</label>
            <CustomDatePicker
              id="birthday"
              selected={form.birthday ? new Date(form.birthday) : null}
              onChange={(date) => {
                const localDate = date ? new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0] : '';
                setForm({ ...form, birthday: localDate });
              }}
              placeholderText="Birthday (Optional)"
              yearDropdownItemNumber={100}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Account...' : 'Create Customer Account'}
          </button>
        </form>
        
        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </motion.div>
  );
}
