import { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_USERS } from '../data/initialData';
import { loadJSON, saveJSON } from '../utils/storage';

const AuthContext = createContext(null);
const USERS_KEY = 'dm_users';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadJSON('dm_current_user', null));
  const [users, setUsers] = useState(() => loadJSON(USERS_KEY, DEMO_USERS));

  useEffect(() => saveJSON(USERS_KEY, users), [users]);
  useEffect(() => {
    if (user) saveJSON('dm_current_user', user);
    else localStorage.removeItem('dm_current_user');
  }, [user]);

  const login = (email, password, expectedRole = null) => {
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) return { ok: false, message: 'Invalid email or password' };
    if (expectedRole && found.role !== expectedRole) {
      return {
        ok: false,
        message: `This account is not registered as ${expectedRole}. Select the correct role.`,
      };
    }
    const { password: _, ...safe } = found;
    setUser(safe);
    return { ok: true, role: found.role };
  };

  const register = (data) => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPhone = (data.phone || '').replace(/\D/g, '');
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { ok: false, message: 'Email already registered' };
    }
    if (cleanPhone && users.some((u) => (u.phone || '').replace(/\D/g, '') === cleanPhone)) {
      return { ok: false, message: 'Phone number already registered with another account' };
    }
    const newUser = {
      id: `u${Date.now()}`,
      name: data.name,
      email: cleanEmail,
      password: data.password,
      role: 'customer',
      phone: cleanPhone,
      birthday: data.birthday || '',
      loyaltyPoints: 50,
      birthdayOfferYears: [],
    };
    setUsers((prev) => [...prev, newUser]);
    const { password: _, ...safe } = newUser;
    setUser(safe);
    return { ok: true };
  };

  const logout = () => setUser(null);

  const updateProfile = (patch) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, ...patch } : u))
    );
    setUser((prev) => ({ ...prev, ...patch }));
  };

  return (
    <AuthContext.Provider value={{ user, users, login, register, logout, updateProfile, setUsers }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
