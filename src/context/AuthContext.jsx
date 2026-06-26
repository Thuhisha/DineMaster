import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';
import { loadJSON, saveJSON } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadJSON('dm_current_user', null));
  const [token, setToken] = useState(() => loadJSON('dm_token', null));
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (user) saveJSON('dm_current_user', user);
    else localStorage.removeItem('dm_current_user');
  }, [user]);

  // Fetch latest user data on mount to ensure DB persistence over local storage
  useEffect(() => {
    const fetchFreshUser = async () => {
      if (user && user.email) {
        try {
          const freshData = await authApi.getUserByEmail(user.email);
          setUser(prev => ({ ...prev, ...freshData, role: freshData.role.toLowerCase() }));
        } catch (error) {
          console.error('Failed to refresh user data:', error);
        }
      }
    };
    fetchFreshUser();
  }, []);

  useEffect(() => {
    if (token) saveJSON('dm_token', token);
    else localStorage.removeItem('dm_token');
  }, [token]);

  // Fetch all users for Admin Dashboard if logged in as admin
  useEffect(() => {
    if (user && user.role === 'admin') {
      const fetchAllUsers = async () => {
        try {
          const data = await authApi.getAllUsers();
          setUsers(data);
        } catch (err) {
          console.error('Failed to fetch users:', err);
        }
      };
      fetchAllUsers();
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      const response = await authApi.login({ email, password });
      setUser({
        id: response.id,
        name: response.name,
        email: response.email,
        role: response.role.toLowerCase(),
        loyaltyPoints: response.loyaltyPoints,
      });
      setToken(response.token);
      return { ok: true, role: response.role.toLowerCase() };
    } catch (error) {
      return { ok: false, message: error.message || 'Invalid email or password' };
    }
  };

  const register = async (data) => {
    try {
      const response = await authApi.register({
        name: data.name,
        email: data.email.trim().toLowerCase(),
        password: data.password,
        phone: data.phone || '',
        birthday: data.birthday || '',
      });
      // Do not log the user in immediately; they need to verify their email
      return { ok: true, pendingVerification: true };
    } catch (error) {
      // Use the actual error message thrown from api.js
      const errorMessage = error.message || 'Registration failed. Email or phone may already be registered.';
      return { ok: false, message: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setUsers([]);
  };

  const updateProfile = (patch) => {
    setUser((prev) => ({ ...prev, ...patch }));
  };

  return (
    <AuthContext.Provider value={{ user, users, token, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
