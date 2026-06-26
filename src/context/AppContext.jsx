import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { formatINR } from '../data/initialData';
import { mainApi } from '../services/api';

const AppContext = createContext(null);

function buildWeeklyTrend(resList) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const counts = days.map(() => 0);
  resList
    .filter((r) => r.status !== 'cancelled')
    .forEach((r) => {
      const d = new Date(r.date).getDay();
      counts[d] += 1;
    });
  return days.map((label, i) => ({ label, value: counts[i] }));
}

function buildCategoryRevenue(orderList, menuList) {
  const map = {};
  orderList.forEach((o) => {
    o.items?.forEach((item) => {
      const cat = menuList.find((m) => m.id === item.id)?.category || 'Other';
      map[cat] = (map[cat] || 0) + item.price * item.qty;
    });
  });
  const entries = Object.entries(map).map(([label, value]) => ({ label, value }));
  return entries.length ? entries : [{ label: 'No orders yet', value: 0 }];
}

const KEYS = {
  locations: 'dm_locations',
  menu: 'dm_menu',
  tables: 'dm_tables',
  reservations: 'dm_reservations',
  orders: 'dm_orders',
  chefQueue: 'dm_chef_queue',
  feedback: 'dm_feedback',
  offers: 'dm_offers',
  pendingReservation: 'dm_pending_res',
  pendingCheckout: 'dm_pending_checkout',
  birthdayUsage: 'dm_birthday_usage',
};

function sameDate(date1, date2) {
  if (!date1 || !date2) return false;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getDate() === d2.getDate() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getFullYear() === d2.getFullYear();
}

export function AppProvider({ children }) {
  const [locations, setLocations] = useState([]);
  const [menu, setMenu] = useState([]);
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [chefQueue, setChefQueue] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [offers, setOffers] = useState([]);
  const [groceries, setGroceries] = useState([
    { id: 1, name: 'Tomatoes (Fresh)', available: true },
    { id: 2, name: 'Onions (Red)', available: true },
    { id: 3, name: 'Chicken Breast', available: true },
    { id: 4, name: 'Basmati Rice', available: true },
    { id: 5, name: 'Paneer (Cottage Cheese)', available: true },
    { id: 6, name: 'Wheat Flour', available: true },
  ]);
  const [pendingReservationState, setPendingReservationState] = useState(() => {
    try {
      const stored = sessionStorage.getItem(KEYS.pendingReservation);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const setPendingReservation = (val) => {
    setPendingReservationState(val);
    if (val) {
      sessionStorage.setItem(KEYS.pendingReservation, JSON.stringify(val));
    } else {
      sessionStorage.removeItem(KEYS.pendingReservation);
    }
  };

  const pendingReservation = pendingReservationState;

  const [pendingCheckoutState, setPendingCheckoutState] = useState(() => {
    try {
      const stored = sessionStorage.getItem(KEYS.pendingCheckout);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  
  const setPendingCheckout = (val) => {
    setPendingCheckoutState(val);
    if (val) {
      sessionStorage.setItem(KEYS.pendingCheckout, JSON.stringify(val));
    } else {
      sessionStorage.removeItem(KEYS.pendingCheckout);
    }
  };

  const pendingCheckout = pendingCheckoutState;
  const [birthdayUsage, setBirthdayUsage] = useState({});

  // Load data from backend on mount
  useEffect(() => {
    const loadBackendData = async () => {
      try {
        // Use allSettled to prevent catastrophic failure if a single endpoint is down
        const results = await Promise.allSettled([
          mainApi.getMenu(),
          mainApi.getActiveOffers(),
          mainApi.getLocations(),
          mainApi.getTables(),
          mainApi.getReservations(),
          mainApi.getOrders(),
          mainApi.getChefQueue(),
          mainApi.getFeedback(),
        ]);
        
        const getValue = (res) => res.status === 'fulfilled' ? res.value : [];
        setMenu(getValue(results[0]));
        setOffers(getValue(results[1]));
        setLocations(getValue(results[2]));
        setTables(getValue(results[3]));
        setReservations(getValue(results[4]));
        setOrders(getValue(results[5]));
        setChefQueue(getValue(results[6]));
        setFeedbackList(getValue(results[7]));
      } catch (error) {
        console.error('Failed to load data from backend:', error);
      }
    };
    loadBackendData();
  }, []);

  // Prevent double booking: same table + date + time
  const isSlotTaken = useCallback(
    (tableId, date, time, excludeId) => {
      return reservations.some(
        (r) =>
          r.tableId === tableId &&
          r.date === date &&
          r.time === time &&
          r.status !== 'cancelled' &&
          r.id !== excludeId
      );
    },
    [reservations]
  );

  const findAvailableTable = (guests, date, time, branchId) => {
    
    console.log('[findAvailableTable] Input:', { guests, date, time, branchId });
    console.log('[findAvailableTable] Total tables:', tables.length);
    
    const suitable = tables.filter(
      (t) =>
        t.status === 'available' &&
        t.capacity >= guests &&
        t.branchId === branchId
    );
    
    console.log('[findAvailableTable] Suitable tables (available, capacity>=guests, matching branch):', suitable.length);
    console.log('[findAvailableTable] Suitable table details:', suitable.map(t => ({ id: t.id, number: t.number, capacity: t.capacity, status: t.status, branchId: t.branchId })));
    
    // Sort by capacity to find the nearest suitable table (smallest capacity that fits)
    suitable.sort((a, b) => a.capacity - b.capacity);
    
    for (const t of suitable) {
      const slotTaken = isSlotTaken(t.id, date, time);
      console.log('[findAvailableTable] Checking table', t.number, 'slot taken:', slotTaken);
      if (!slotTaken) {
        console.log('[findAvailableTable] Found available table:', t);
        return t;
      }
    }
    console.log('[findAvailableTable] No available table found');
    return null;
  };

  const getOfferSummary = (subtotal, isBirthday) => {
    const activeOffers = offers.filter((o) => o.active);
    let discount = 0;
    let reward = null;
    activeOffers.forEach((o) => {
      if (subtotal >= (o.minAmount || 0)) {
        if (o.percent) discount = Math.max(discount, Math.round((subtotal * o.percent) / 100));
        if (o.reward) reward = o.reward;
      }
    });
    if (isBirthday) {
      const bday = activeOffers.find((o) => /birthday/i.test(o.title));
      if (bday?.percent) discount = Math.max(discount, Math.round((subtotal * bday.percent) / 100));
      if (bday?.reward) reward = bday.reward;
    }
    return { discount, reward };
  };

  const startCheckout = async (userId, details, cartItems = []) => {
    // Food ordering is now optional - reservation can be done without ordering food
    const { branchId, date, time, guests, name, email, phone, birthday } = details;
    const table = findAvailableTable(guests, date, time, branchId);
    if (!table) return { ok: false, message: 'No table fits selected guest count for this slot.' };
    if (isSlotTaken(table.id, date, time)) return { ok: false, message: 'Selected slot is already booked.' };

    try {
      const calcData = await mainApi.calculateOrder({
        email: email,
        date: date,
        items: cartItems
      });

      const draft = {
        userId,
        details,
        table,
        cartItems,
        pricing: { 
          subtotal: calcData.subtotal, 
          taxes: calcData.tax, 
          discount: calcData.discount, 
          total: calcData.total, 
          reward: calcData.birthdayOffer?.applied ? calcData.birthdayOffer.benefit : null 
        },
        birthdayOffer: calcData.birthdayOffer,
      };
      setPendingCheckout(draft);
      return { ok: true, draft };
    } catch (error) {
      console.error('Failed to calculate order:', error);
      return { ok: false, message: 'Failed to calculate order details securely. Please try again.' };
    }
  };

  const completeReservation = async (paymentPayload = {}) => {
    const draft = pendingCheckout;
    if (!draft) return { ok: false, message: 'No payment draft found. Please restart reservation.' };
    const { userId, details, table, cartItems, pricing, birthdayOffer } = draft;
    const { branchId, date, time, guests, name, email, phone, birthday, specialRequests } = details;

    console.log('[completeReservation] Starting reservation for table:', table);
    console.log('[completeReservation] Current table status before update:', table.status);

    if (isSlotTaken(table.id, date, time)) return { ok: false, message: 'Slot got booked by another user. Please retry.' };

    const reservation = {
      userId,
      branchId,
      date,
      time,
      guests,
      tableId: table.id,
      tableNumber: table.number,
      name,
      email,
      phone,
      birthday,
      specialRequests,
      birthdayOffer,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      loyaltyEarned: 25 + Math.floor(pricing.total / 500),
      paymentStatus: paymentPayload.reference ? 'paid' : 'pending',
      paymentRef: paymentPayload.reference || null,
      paymentMethod: paymentPayload.method || 'pay-at-restaurant',
      totalAmount: pricing.total || 0,
    };

    console.log('[completeReservation] Creating reservation:', reservation);
    const savedReservation = await mainApi.createReservation(reservation);
    setReservations((prev) => [...prev, savedReservation]);
    
    // Persist loyalty points to auth service
    try {
      const authApi = (await import('../services/api')).authApi;
      const pointsEarned = Math.floor(pricing.total / 10); // 1 point per ₹10 spent
      if (pointsEarned > 0) {
        await authApi.addLoyaltyPoints(userId, pointsEarned);
      }
    } catch (err) {
      console.error('Failed to update loyalty points:', err);
    }
    
    console.log('[completeReservation] Updating table status to reserved for table:', table.id);
    await mainApi.updateTable(table.id, { status: 'reserved' });
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === table.id) {
          console.log('[completeReservation] Table', t.id, 'status changing from', t.status, 'to reserved');
          return { ...t, status: 'reserved' };
        }
        return t;
      })
    );

    // Always create an order so it shows in Order History
    const order = {
      reservationId: savedReservation.id,
      userId,
      items: cartItems,
      subtotal: pricing.subtotal || 0,
      tax: pricing.taxes || 0,
      discount: pricing.discount || 0,
      total: pricing.total || 0,
      reward: pricing.reward || null,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const savedOrder = await mainApi.createOrder(order);
    setOrders((prev) => [...prev, savedOrder]);

    // Only send to Chef if there is food
    if (cartItems.length > 0) {
      const queueItem = {
        reservationId: savedReservation.id,
        orderId: savedOrder.id,
        customerName: name,
        tableNumber: table.number,
        items: cartItems.map((i) => `${i.name}×${i.qty}`).join(', '),
        specialRequests: specialRequests || '',
        reservationTime: `${date} ${time}`,
        status: 'pending',
        kitchenStatus: 'new',
        isNew: true,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      const savedQueueItem = await mainApi.createChefQueueItem(queueItem);
      setChefQueue((prev) => [...prev, savedQueueItem]);
    }

    if (birthdayOffer.applied) {
      const key = `${userId}-${new Date(date).getFullYear()}`;
      setBirthdayUsage((prev) => ({ ...prev, [key]: true }));
    }
    setPendingReservation(null);
    setPendingCheckout(null);
    console.log('[completeReservation] Reservation completed successfully');
    return { ok: true, reservation: savedReservation, birthdayOffer, pricing };
  };

  const cancelReservation = async (resId, userId) => {
    const res = reservations.find((r) => r.id === resId);
    if (!res || res.userId !== userId) return { ok: false };
    console.log('[cancelReservation] Cancelling reservation:', resId, 'for table:', res.tableId);
    await mainApi.updateReservation(resId, { status: 'cancelled' });
    setReservations((prev) =>
      prev.map((r) => (r.id === resId ? { ...r, status: 'cancelled' } : r))
    );
    await mainApi.updateTable(res.tableId, { status: 'available' });
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === res.tableId) {
          console.log('[cancelReservation] Table', t.id, 'status changing from', t.status, 'to available');
          return { ...t, status: 'available' };
        }
        return t;
      })
    );
    await mainApi.deleteChefQueueItem(resId);
    setChefQueue((prev) => prev.filter((q) => q.reservationId !== resId));
    return { ok: true };
  };

  const cancelOrder = async (orderId, userId) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order || order.userId !== userId) return { ok: false, message: 'Order not found' };
    
    const queueItem = chefQueue.find(q => q.orderId === orderId);
    if (queueItem && ['cooking', 'ready', 'served'].includes(queueItem.kitchenStatus)) {
      return { ok: false, message: 'Order is already being prepared and cannot be cancelled.' };
    }

    await mainApi.updateOrder(orderId, { ...order, status: 'cancelled' });
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o))
    );

    if (queueItem) {
      await mainApi.deleteChefQueueItem(queueItem.id);
      setChefQueue((prev) => prev.filter((q) => q.id !== queueItem.id));
    }
    
    return { ok: true };
  };

  const updateTableStatus = async (tableId, newStatus) => {
    console.log('[updateTableStatus] Updating table', tableId, 'status to:', newStatus);
    await mainApi.updateTable(tableId, { status: newStatus });
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === tableId) {
          console.log('[updateTableStatus] Table', t.id, 'status changing from', t.status, 'to', newStatus);
          return { ...t, status: newStatus };
        }
        return t;
      })
    );
  };

  const markTableOccupied = (tableId) => {
    updateTableStatus(tableId, 'occupied');
  };

  const markTableAvailable = (tableId) => {
    updateTableStatus(tableId, 'available');
  };

  const updateKitchenStatus = async (queueId, kitchenStatus) => {
    await mainApi.updateChefQueueItem(queueId, { kitchenStatus, isNew: false, updatedAt: new Date().toISOString() });
    setChefQueue((prev) =>
      prev.map((q) =>
        q.id === queueId
          ? { ...q, kitchenStatus, isNew: false, updatedAt: new Date().toISOString() }
          : q
      )
    );
  };

  const markChefOrdersSeen = () => {
    setChefQueue((prev) => prev.map((q) => ({ ...q, isNew: false })));
  };

  const addTable = async (data) => {
    const newTable = {
      number: data.number,
      capacity: Number(data.capacity),
      status: data.status || 'available',
      branchId: data.branchId || null,
    };
    console.log('[addTable] Adding new table:', newTable);
    const savedTable = await mainApi.createTable(newTable);
    setTables((prev) => [...prev, savedTable]);
  };

  const updateTable = async (id, patch) => {
    const updatedTable = await mainApi.updateTable(id, patch);
    setTables((prev) => prev.map((t) => (t.id === id ? updatedTable : t)));
  };

  const deleteTable = async (id) => {
    await mainApi.deleteTable(id);
    setTables((prev) => prev.filter((t) => t.id !== id));
  };

  const addMenuItem = async (item) => {
    const newItem = { ...item };
    const savedItem = await mainApi.createMenuItem(newItem);
    setMenu((prev) => [...prev, savedItem]);
  };

  const updateMenuItem = async (id, patch) => {
    // Find the existing item to preserve all its original data
    const existingItem = menu.find(m => m.id === id);
    if (!existingItem) {
      console.error('Item not found for update');
      return;
    }
    
    // Merge the existing data with the new patch data.
    // This strictly prevents any fields (like image, price, name) from being 
    // lost if the patch object is incomplete (e.g. from Hide/Show or Edit).
    const mergedItem = { ...existingItem, ...patch };
    
    // Ensure critical fields are never nullified
    if (mergedItem.price === undefined || mergedItem.price === null || isNaN(mergedItem.price)) {
      mergedItem.price = existingItem.price;
    }
    if (!mergedItem.name) mergedItem.name = existingItem.name;
    
    const updatedItem = await mainApi.updateMenuItem(id, mergedItem);
    setMenu((prev) => prev.map((m) => (m.id === id ? updatedItem : m)));
  };

  const deleteMenuItem = async (id) => {
    await mainApi.deleteMenuItem(id);
    setMenu((prev) => prev.filter((m) => m.id !== id));
  };

  const addFeedback = async (entry) => {
    const newFeedback = { ...entry, createdAt: new Date().toISOString() };
    const savedFeedback = await mainApi.createFeedback(newFeedback);
    setFeedbackList((prev) => [...prev, savedFeedback]);
  };

  const removeFeedback = async (id) => {
    await mainApi.deleteFeedback(id);
    setFeedbackList((prev) => prev.filter((f) => f.id !== id));
  };

  const addLocation = async (location) => {
    const newLocation = { ...location };
    const savedLocation = await mainApi.createLocation(newLocation);
    setLocations((prev) => [...prev, savedLocation]);
  };

  const updateLocation = async (id, patch) => {
    const updatedLocation = await mainApi.updateLocation(id, patch);
    setLocations((prev) => prev.map((l) => (l.id === id ? updatedLocation : l)));
  };

  const deleteLocation = async (id) => {
    await mainApi.deleteLocation(id);
    setLocations((prev) => prev.filter((l) => l.id !== id));
  };

  const addOffer = async (offer) => {
    const newOffer = { ...offer };
    const savedOffer = await mainApi.createOffer(newOffer);
    setOffers((prev) => [...prev, savedOffer]);
  };

  const updateOffer = async (id, patch) => {
    const updatedOffer = await mainApi.updateOffer(id, patch);
    setOffers((prev) => prev.map((o) => (o.id === id ? updatedOffer : o)));
  };

  const deleteOffer = async (id) => {
    await mainApi.deleteOffer(id);
    setOffers((prev) => prev.filter((o) => o.id !== id));
  };

  const tableStats = {
    total: tables.length,
    available: tables.filter((t) => t.status === 'available').length,
    reserved: tables.filter((t) => t.status === 'reserved').length,
    occupied: tables.filter((t) => t.status === 'occupied').length,
  };

  const getAnalytics = () => {
    const active = reservations.filter((r) => r.status !== 'cancelled');
    const activeOrders = orders.filter((o) => o.status !== 'completed');
    return {
      totalReservations: active.length,
      cancelled: reservations.filter((r) => r.status === 'cancelled').length,
      birthdayBookings: active.filter((r) => r.birthdayOffer?.applied).length,
      revenue: orders.reduce((s, o) => s + (o.total || 0), 0),
      activeOrders: activeOrders.length,
      pendingKitchen: chefQueue.filter((q) => q.kitchenStatus !== 'served').length,
      tableStats,
      reservationTrend: buildWeeklyTrend(reservations),
      revenueByCategory: buildCategoryRevenue(orders, menu),
      chefCount: 0, // Will be loaded from backend
    };
  };

  return (
    <AppContext.Provider
      value={{
        menu,
        locations,
        setMenu,
        tables,
        reservations,
        orders,
        chefQueue,
        feedbackList,
        offers,
        setOffers,
        groceries,
        setGroceries,
        pendingReservation,
        pendingCheckout,
        setPendingReservation,
        startCheckout,
        setPendingCheckout,
        completeReservation,
        cancelReservation,
        cancelOrder,
        updateTableStatus,
        markTableOccupied,
        markTableAvailable,
        updateKitchenStatus,
        markChefOrdersSeen,
        isSlotTaken,
        addTable,
        updateTable,
        deleteTable,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        addFeedback,
        removeFeedback,
        addLocation,
        updateLocation,
        deleteLocation,
        addOffer,
        updateOffer,
        deleteOffer,
        tableStats,
        getAnalytics,
        formatINR,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
