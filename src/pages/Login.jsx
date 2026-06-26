import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiLogIn, FiUserPlus } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CustomDatePicker from '../components/common/CustomDatePicker';
import { ROLES } from '../data/roleConfig';
import './Auth.css';

export default function Login() {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get('mode') === 'register' ? 'register' : 'login');
  const [form, setForm] = useState({ email: '', password: '', name: '', phone: '', birthday: '', regPassword: '', regPhone: '' });
  const [loading, setLoading] = useState(false);
  const [isVerificationStep, setIsVerificationStep] = useState(false);
  const [userEnteredCode, setUserEnteredCode] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false, uppercase: false, lowercase: false, number: false, special: false
  });

  useEffect(() => {
    if (user) {
      const dash = ROLES[user.role]?.dashboard || '/dashboard';
      navigate(dash, { replace: true });
    }
  }, [user, navigate]);

  const validatePassword = (pass) => {
    setPasswordValidation({
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      lowercase: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[^A-Za-z0-9]/.test(pass)
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(`Welcome to DineMaster!`);
    const dash = ROLES[result.role]?.dashboard || '/dashboard';
    if (from && result.role === 'customer') return navigate(from);
    navigate(dash);
  };

  const handleResendCode = async () => {
    try {
      await authApi.resendVerification(form.email);
      toast.success(`New verification email sent to ${form.email}`);
    } catch (err) {
      toast.error(err.message || 'Failed to resend verification');
    }
  };

  const handleBack = () => {
    setIsVerificationStep(false);
    setUserEnteredCode('');
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
      setIsVerificationStep(false);
      setUserEnteredCode('');
      setForm({ email: form.email, password: '', name: '', phone: '', birthday: '' }); // keep email, clear rest
      setMode('login'); // switch back to login mode
    } catch (err) {
      setLoading(false);
      toast.error(err.message || 'Verification failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!form.name || !form.email || !form.regPassword || !form.regPhone) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Phone Validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(form.regPhone)) {
      toast.error('Invalid Mobile Number. It must be exactly 10 digits.');
      return;
    }

    // Password Validation
    const isValidPass = passwordValidation.length && passwordValidation.uppercase && 
                        passwordValidation.lowercase && passwordValidation.number && 
                        passwordValidation.special;

    if (!isValidPass) {
      toast.error('Please meet all password requirements.');
      return;
    }

    setLoading(true);
    const result = await register({
      ...form,
      password: form.regPassword,
      phone: form.regPhone
    });
    setLoading(false);
    
    if (!result.ok) {
      toast.error(result.message || 'Registration failed.');
      return;
    }
    
    setIsVerificationStep(true);
    toast.success('Registration successful! Please check your email for the OTP code.');
  };

  const handleBackToRegister = () => {
    setIsVerificationStep(false);
    setUserEnteredCode('');
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please enter email and new password');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(form.email, form.password);
      toast.success('Password successfully reset! You can now log in.');
      setMode('login');
      setForm({ ...form, password: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (isVerificationStep) {
    return (
      <div className="login-hub glass-card">
        <motion.div className="login-hub-head" layout>
          <h2>Verify Your Email</h2>
          <p>We've sent a 6-digit verification code to <strong>{form.email}</strong>.</p>
        </motion.div>
        
        <form className="auth-form-glass" onSubmit={handleVerify}>
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
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
          <button type="button" className="btn btn-outline btn-full mt-2" onClick={handleResendCode}>
            Resend Verification Email
          </button>
          <button type="button" className="btn btn-text btn-full mt-2" onClick={handleBackToRegister}>
            Back
          </button>
        </form>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'regPassword') {
      validatePassword(value);
    }
  };

  const togglePassword = () => setShowPassword(!showPassword);

  return (
    <div className="login-hub glass-card">
      <motion.div className="login-hub-head" layout>
        <h2>{mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Reset Password'}</h2>
        <p>{mode === 'login' ? 'Sign in to your DineMaster account' : mode === 'register' ? 'Register for a new account' : 'Enter your email and new password'}</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoadingSpinner label="Processing..." />
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
            <motion.div className="role-badge" style={{ background: 'var(--primary-gradient)', padding: '5px 15px', borderRadius: '20px', display: 'inline-block', marginBottom: '20px', color: '#fff' }}>
              Authentication
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
            <div className="form-group" style={{ position: 'relative' }}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                required
              />
              <span onClick={togglePassword} style={{ position: 'absolute', right: '10px', top: '35px', cursor: 'pointer', color: '#888' }}>
                {showPassword ? 'Hide' : 'Show'}
              </span>
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <p className="auth-footer" style={{ textAlign: 'center', marginTop: '1rem' }}>
              <span onClick={() => setMode('forgot-password')} style={{cursor: 'pointer', color: 'var(--text-light)', fontSize: '0.9em'}}>Forgot Password?</span>
            </p>
            <p className="auth-footer" style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              New Customer? <span onClick={() => setMode('register')} style={{cursor: 'pointer', color: 'var(--primary-color)', textDecoration: 'underline'}}>Sign Up</span>
            </p>
          </motion.form>
        ) : mode === 'register' ? (
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
            <div className="form-group" style={{ position: 'relative' }}>
              <label htmlFor="reg-password">Password</label>
              <input id="reg-password" name="regPassword" type={showPassword ? 'text' : 'password'} value={form.regPassword || ''} onChange={handleChange} required minLength={8} autoComplete="new-password" />
              <span onClick={togglePassword} style={{ position: 'absolute', right: '10px', top: '35px', cursor: 'pointer', color: '#888' }}>
                {showPassword ? 'Hide' : 'Show'}
              </span>
              
              {form.regPassword && (
                <div style={{ fontSize: '0.8em', marginTop: '8px', background: '#f9f9f9', padding: '10px', borderRadius: '6px', color: '#333' }}>
                  <div style={{ color: passwordValidation.length ? 'green' : 'red' }}>{passwordValidation.length ? '✓' : '✗'} Minimum 8 characters</div>
                  <div style={{ color: passwordValidation.uppercase ? 'green' : 'red' }}>{passwordValidation.uppercase ? '✓' : '✗'} At least one uppercase letter</div>
                  <div style={{ color: passwordValidation.lowercase ? 'green' : 'red' }}>{passwordValidation.lowercase ? '✓' : '✗'} At least one lowercase letter</div>
                  <div style={{ color: passwordValidation.number ? 'green' : 'red' }}>{passwordValidation.number ? '✓' : '✗'} At least one number</div>
                  <div style={{ color: passwordValidation.special ? 'green' : 'red' }}>{passwordValidation.special ? '✓' : '✗'} At least one special character (@$!%*?&)</div>
                </div>
              )}
            </div>
            <div className="form-row-auth">
              <div className="form-group">
                <label htmlFor="phone">Phone (10 digits)</label>
                <input id="phone" name="regPhone" type="tel" maxLength="10" value={form.regPhone || ''} onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setForm(p => ({ ...p, regPhone: val }));
                }} autoComplete="off" required />
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
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Creating...' : 'Create Customer Account'}
            </button>
            <p className="auth-footer" style={{ textAlign: 'center', marginTop: '1rem' }}>
              Already have an account? <span onClick={() => setMode('login')} style={{cursor: 'pointer', color: 'var(--primary-color)', textDecoration: 'underline'}}>Sign In</span>
            </p>
          </motion.form>
        ) : (
          <motion.form
            key="forgot-password"
            className="auth-form-glass"
            onSubmit={handleResetPassword}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
          >
            <div className="form-group">
              <label htmlFor="reset-email">Email</label>
              <input id="reset-email" name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="reset-password">New Password</label>
              <input id="reset-password" name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} />
            </div>
            <button type="submit" className="btn btn-primary btn-full">Reset Password</button>
            <p className="auth-footer" style={{ textAlign: 'center', marginTop: '1rem' }}>
              Remembered your password? <span onClick={() => setMode('login')} style={{cursor: 'pointer', color: 'var(--primary-color)', textDecoration: 'underline'}}>Sign In</span>
            </p>
          </motion.form>
        )}
      </AnimatePresence>

      <p className="auth-back">
        <Link to="/">← Back to Restaurant Home</Link>
      </p>
    </div>
  );
}
