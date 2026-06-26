const API_BASE_URL = 'http://localhost:8081/api/auth';
const MAIN_API_BASE_URL = 'http://localhost:8082/api';

// Auth API
export const authApi = {
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const errText = await response.text();
      let errMsg = 'Registration failed';
      try {
        const errObj = JSON.parse(errText);
        errMsg = errObj.message || errMsg;
      } catch (e) {
        errMsg = errText || errMsg;
      }
      throw new Error(errMsg);
    }
    return response.json();
  },

  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || 'Login failed');
    }
    return response.json();
  },

  resetPassword: async (email, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, newPassword }),
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || 'Failed to reset password');
    }
    return response.text();
  },

  getUserByEmail: async (email) => {
    const response = await fetch(`${API_BASE_URL}/user/${email}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    return response.json();
  },

  verifyEmail: async (email, code) => {
    const response = await fetch(`${API_BASE_URL}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Verification failed');
    }
    return response.text();
  },

  getAllUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return response.json();
  },

  resendVerification: async (email) => {
    const response = await fetch(`${API_BASE_URL}/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to resend verification');
    }
    return response.text();
  },

  addLoyaltyPoints: async (userId, points) => {
    const response = await fetch(`${API_BASE_URL}/user/${userId}/loyalty`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ points }),
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || 'Failed to add loyalty points');
    }
    return response.text();
  },
};

// Main Service API
export const mainApi = {
  // Menu
  getMenu: async () => {
    const response = await fetch(`${MAIN_API_BASE_URL}/menu`);
    if (!response.ok) {
      throw new Error('Failed to fetch menu');
    }
    return response.json();
  },

  createMenuItem: async (item) => {
    const response = await fetch(`${MAIN_API_BASE_URL}/menu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });
    if (!response.ok) {
      throw new Error('Failed to create menu item');
    }
    return response.json();
  },

  updateMenuItem: async (id, item) => {
    const response = await fetch(`${MAIN_API_BASE_URL}/menu/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });
    if (!response.ok) {
      throw new Error('Failed to update menu item');
    }
    return response.json();
  },

  deleteMenuItem: async (id) => {
    const response = await fetch(`${MAIN_API_BASE_URL}/menu/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete menu item');
    }
    return response.text();
  },

  // Orders
  getOrders: async () => {
    const response = await fetch(`${MAIN_API_BASE_URL}/orders`);
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    return response.json();
  },

  createOrder: async (order) => {
    const response = await fetch(`${MAIN_API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });
    if (!response.ok) {
      throw new Error('Failed to create order');
    }
    return response.json();
  },

  calculateOrder: async (requestData) => {
    const response = await fetch(`${MAIN_API_BASE_URL}/orders/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });
    if (!response.ok) {
      throw new Error('Failed to calculate order details');
    }
    return response.json();
  },

  updateOrder: async (id, order) => {
    const response = await fetch(`${MAIN_API_BASE_URL}/orders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });
    if (!response.ok) {
      throw new Error('Failed to update order');
    }
    return response.json();
  },

  // Reservations
  getReservations: async () => {
    const response = await fetch(`${MAIN_API_BASE_URL}/reservations`);
    if (!response.ok) {
      throw new Error('Failed to fetch reservations');
    }
    return response.json();
  },

  getReservationById: async (id) => {
    const response = await fetch(`${MAIN_API_BASE_URL}/reservations/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch reservation by id');
    }
    return response.json();
  },

  createReservation: async (reservation) => {
    const response = await fetch(`${MAIN_API_BASE_URL}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservation),
    });
    if (!response.ok) {
      throw new Error('Failed to create reservation');
    }
    return response.json();
  },

  updateReservation: async (id, reservation) => {
    const response = await fetch(`${MAIN_API_BASE_URL}/reservations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservation),
    });
    if (!response.ok) {
      throw new Error('Failed to update reservation');
    }
    return response.json();
  },

  // Locations
  getLocations: async () => {
    const response = await fetch(`${MAIN_API_BASE_URL}/locations`);
    if (!response.ok) {
      throw new Error('Failed to fetch locations');
    }
    return response.json();
  },

  createLocation: async (location) => {
    const response = await fetch(`${MAIN_API_BASE_URL}/locations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(location),
    });
    if (!response.ok) {
      throw new Error('Failed to create location');
    }
    return response.json();
  },

  updateLocation: async (id, location) => {
    const response = await fetch(`${MAIN_API_BASE_URL}/locations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(location),
    });
    if (!response.ok) {
      throw new Error('Failed to update location');
    }
    return response.json();
  },

  deleteLocation: async (id) => {
    const response = await fetch(`${MAIN_API_BASE_URL}/locations/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      let errMsg = 'Failed to delete location';
      try {
        const errObj = await response.json();
        errMsg = errObj.message || errMsg;
      } catch (e) {}
      throw new Error(errMsg);
    }
    return response.text();
  },

  // Tables
  getTables: async () => {
    const response = await fetch(`${MAIN_API_BASE_URL}/tables`);
    if (!response.ok) {
      throw new Error('Failed to fetch tables');
    }
    return response.json();
  },

  createTable: async (table) => {
    const response = await fetch(`${MAIN_API_BASE_URL}/tables`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(table),
    });
    if (!response.ok) {
      throw new Error('Failed to create table');
    }
    return response.json();
  },

  updateTable: async (id, table) => {
    const response = await fetch(`${MAIN_API_BASE_URL}/tables/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(table),
    });
    if (!response.ok) {
      throw new Error('Failed to update table');
    }
    return response.json();
  },

  deleteTable: async (id) => {
    const response = await fetch(`${MAIN_API_BASE_URL}/tables/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      let errMsg = 'Failed to delete table';
      try {
        const errObj = await response.json();
        errMsg = errObj.message || errMsg;
      } catch (e) {}
      throw new Error(errMsg);
    }
    return response.text();
  },

  // Offers
  getOffers: async () => {
    const response = await fetch(`${MAIN_API_BASE_URL}/offers`);
    if (!response.ok) {
      throw new Error('Failed to fetch offers');
    }
    return response.json();
  },

  getActiveOffers: async () => {
    const response = await fetch(`${MAIN_API_BASE_URL}/offers/active`);
    if (!response.ok) {
      throw new Error('Failed to fetch active offers');
    }
    return response.json();
  },

  createOffer: async (offer) => {
    const response = await fetch(`${MAIN_API_BASE_URL}/offers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(offer),
    });
    if (!response.ok) {
      throw new Error('Failed to create offer');
    }
    return response.json();
  },

  updateOffer: async (id, offer) => {
    const response = await fetch(`${MAIN_API_BASE_URL}/offers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(offer),
    });
    if (!response.ok) {
      throw new Error('Failed to update offer');
    }
    return response.json();
  },

  deleteOffer: async (id) => {
    const response = await fetch(`${MAIN_API_BASE_URL}/offers/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete offer');
    }
    return response.text();
  },

  // Feedback
  getFeedback: async () => {
    const response = await fetch(`${MAIN_API_BASE_URL}/feedback`);
    if (!response.ok) {
      throw new Error('Failed to fetch feedback');
    }
    return response.json();
  },

  createFeedback: async (feedback) => {
    const response = await fetch(`${MAIN_API_BASE_URL}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedback),
    });
    if (!response.ok) {
      throw new Error('Failed to create feedback');
    }
    return response.json();
  },

  // Chef Queue
  getChefQueue: async () => {
    const response = await fetch(`${MAIN_API_BASE_URL}/chef-queue`);
    if (!response.ok) {
      throw new Error('Failed to fetch chef queue');
    }
    return response.json();
  },

  createChefQueueItem: async (item) => {
    const response = await fetch(`${MAIN_API_BASE_URL}/chef-queue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });
    if (!response.ok) {
      throw new Error('Failed to create chef queue item');
    }
    return response.json();
  },

  updateChefQueueItem: async (id, item) => {
    const response = await fetch(`${MAIN_API_BASE_URL}/chef-queue/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });
    if (!response.ok) {
      throw new Error('Failed to update chef queue item');
    }
    return response.json();
  },

  deleteChefQueueItem: async (id) => {
    const response = await fetch(`${MAIN_API_BASE_URL}/chef-queue/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete chef queue item');
    }
    return response.text();
  },

  // Payment
  createPaymentOrder: async (amount, receiptId) => {
    const response = await fetch(`${MAIN_API_BASE_URL}/payment/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, receiptId }),
    });
    if (!response.ok) {
      throw new Error('Failed to create payment order');
    }
    return response.json();
  },

  verifyPayment: async (verificationData) => {
    const response = await fetch(`${MAIN_API_BASE_URL}/payment/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verificationData),
    });
    if (!response.ok) {
      throw new Error('Payment verification failed');
    }
    return response.json();
  },
};
