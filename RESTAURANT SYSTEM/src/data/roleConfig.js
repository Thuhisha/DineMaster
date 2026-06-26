import { FiUser, FiCoffee, FiShield } from 'react-icons/fi';

export const ROLES = {
  customer: {
    id: 'customer',
    title: 'Customer',
    subtitle: 'Reserve tables & order food',
    icon: FiUser,
    demoEmail: 'customer@demo.com',
    demoPassword: 'customer123',
    dashboard: '/dashboard',
    gradient: 'linear-gradient(135deg, #c9a227 0%, #8b6914 100%)',
  },
  chef: {
    id: 'chef',
    title: 'Chef',
    subtitle: 'Kitchen queue & order prep',
    icon: FiCoffee,
    demoEmail: 'chef@demo.com',
    demoPassword: 'chef123',
    dashboard: '/chef',
    gradient: 'linear-gradient(135deg, #e07b39 0%, #c45c26 100%)',
  },
  admin: {
    id: 'admin',
    title: 'Admin',
    subtitle: 'Full restaurant management',
    icon: FiShield,
    demoEmail: 'admin@demo.com',
    demoPassword: 'admin123',
    dashboard: '/admin',
    gradient: 'linear-gradient(135deg, #6b8cce 0%, #4a6fa5 100%)',
  },
};

export const ROLE_LIST = Object.values(ROLES);
