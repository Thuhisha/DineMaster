// Utility functions for DineMaster
// All data comes from database via API calls

export const TIME_SLOTS = [
  '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM',
  '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM',
];

export const MENU_CATEGORIES = ['All', 'Starters', 'Main Course', 'Desserts', 'Beverages', 'Chef Special'];

export const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const sameDate = (d1, d2) => {
  if (!d1 || !d2) return false;
  const a = new Date(d1);
  const b = new Date(d2);
  return a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
};
