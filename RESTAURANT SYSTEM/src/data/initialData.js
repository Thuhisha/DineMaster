// Seed data for DineMaster – persisted via Context + localStorage

export const BRANCHES = [
  { id: 'b1', name: 'DineMaster Chennai', city: 'Chennai', address: '12 Marina Blvd, Chennai' },
  { id: 'b2', name: 'DineMaster Coimbatore', city: 'Coimbatore', address: '88 Avinashi Rd, Coimbatore' },
  { id: 'b3', name: 'DineMaster Madurai', city: 'Madurai', address: '14 Alagar Kovil Rd, Madurai' },
  { id: 'b4', name: 'DineMaster Trichy', city: 'Trichy', address: '26 Salai Rd, Trichy' },
  { id: 'b5', name: 'DineMaster Salem', city: 'Salem', address: '30 Cherry Rd, Salem' },
  { id: 'b6', name: 'DineMaster Erode', city: 'Erode', address: '22 Perundurai Rd, Erode' },
  { id: 'b7', name: 'DineMaster Tirunelveli', city: 'Tirunelveli', address: '18 South Bypass, Tirunelveli' },
  { id: 'b8', name: 'DineMaster Vellore', city: 'Vellore', address: '42 Katpadi Rd, Vellore' },
  { id: 'b9', name: 'DineMaster Thanjavur', city: 'Thanjavur', address: '9 Medical College Rd, Thanjavur' },
  { id: 'b10', name: 'DineMaster Hosur', city: 'Hosur', address: '56 Bagalur Rd, Hosur' },
  { id: 'b11', name: 'DineMaster Kanchipuram', city: 'Kanchipuram', address: '11 Gandhi Rd, Kanchipuram' },
  { id: 'b12', name: 'DineMaster Tiruppur', city: 'Tiruppur', address: '61 Kangeyam Rd, Tiruppur' },
];

export const TIME_SLOTS = [
  '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM',
  '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM',
];

export const MENU_CATEGORIES = ['All', 'Starters', 'Main Course', 'Desserts', 'Beverages', 'Chef Special'];

export const INITIAL_MENU = [
  { id: 'm1', name: 'Butter Chicken', description: 'Creamy tomato gravy with tender chicken', price: 420, category: 'Main Course', rating: 4.8, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80' },
  { id: 'm2', name: 'Paneer Tikka', description: 'Char-grilled cottage cheese with spices', price: 320, category: 'Starters', rating: 4.6, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80' },
  { id: 'm3', name: 'Hyderabadi Biryani', description: 'Aromatic basmati rice with saffron', price: 380, category: 'Chef Special', rating: 4.9, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80' },
  { id: 'm4', name: 'Gulab Jamun', description: 'Warm milk dumplings in rose syrup', price: 150, category: 'Desserts', rating: 4.7, image: 'https://images.unsplash.com/photo-1587314160605-4ffc7c9e0c0e?w=400&q=80' },
  { id: 'm5', name: 'Masala Dosa', description: 'Crispy crepe with potato filling', price: 180, category: 'Main Course', rating: 4.5, image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&q=80' },
  { id: 'm6', name: 'Mango Lassi', description: 'Chilled yogurt drink with Alphonso mango', price: 120, category: 'Beverages', rating: 4.4, image: 'https://images.unsplash.com/photo-1623065426852-847b72fce3b5?w=400&q=80' },
  { id: 'm7', name: 'Tandoori Prawns', description: 'Jumbo prawns marinated in yogurt spices', price: 520, category: 'Chef Special', rating: 4.8, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a572?w=400&q=80' },
  { id: 'm8', name: 'Chocolate Soufflé', description: 'Warm molten chocolate with vanilla ice cream', price: 280, category: 'Desserts', rating: 4.9, image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&q=80' },
];

export const INITIAL_TABLES = []; // Start with empty tables - admin will add tables

export const DEMO_USERS = [
  { id: 'u1', name: 'Demo Customer', email: 'customer@demo.com', password: 'customer123', role: 'customer', phone: '9876543210', birthday: '1995-05-20', loyaltyPoints: 120 },
  { id: 'u2', name: 'Chef Arjun', email: 'chef@demo.com', password: 'chef123', role: 'chef' },
  { id: 'u3', name: 'Admin Priya', email: 'admin@demo.com', password: 'admin123', role: 'admin' },
];

export const FEATURED_DISHES = INITIAL_MENU.slice(0, 4);

export const TESTIMONIALS = [
  { id: 1, name: 'Ananya R.', text: 'Best dining experience in Chennai. The reservation was seamless!', rating: 5, avatar: 'AR' },
  { id: 2, name: 'Rahul M.', text: 'Birthday surprise dessert made our evening unforgettable.', rating: 5, avatar: 'RM' },
  { id: 3, name: 'Sneha K.', text: 'Chef specials are incredible. Will book again!', rating: 4, avatar: 'SK' },
];

export const SPECIAL_OFFERS = [
  { id: 'o1', title: 'Weekend Brunch', desc: '20% off on all mains Sat–Sun 11AM–2PM', code: 'BRUNCH20' },
  { id: 'o2', title: 'Birthday Treat', desc: 'Free dessert when you dine on your birthday', code: 'BDAYFREE' },
];

export const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const sameDate = (d1, d2) => {
  if (!d1 || !d2) return false;
  const a = new Date(d1);
  const b = new Date(d2);
  return a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
};
