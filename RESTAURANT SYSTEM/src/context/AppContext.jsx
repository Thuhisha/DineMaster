import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  INITIAL_MENU,
  INITIAL_TABLES,
  BRANCHES,
  DEMO_USERS,
  sameDate,
  formatINR,
} from '../data/initialData';
import { loadJSON, saveJSON } from '../utils/storage';

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

export function AppProvider({ children }) {
  const [locations, setLocations] = useState(() => loadJSON(KEYS.locations, BRANCHES));
  const [menu, setMenu] = useState(() => loadJSON(KEYS.menu, INITIAL_MENU));
  const [tables, setTables] = useState(() => loadJSON(KEYS.tables, INITIAL_TABLES));
  const [reservations, setReservations] = useState(() => loadJSON(KEYS.reservations, []));
  const [orders, setOrders] = useState(() => loadJSON(KEYS.orders, []));
  const [chefQueue, setChefQueue] = useState(() => loadJSON(KEYS.chefQueue, []));
  const [feedbackList, setFeedbackList] = useState(() => loadJSON(KEYS.feedback, []));
  const [offers, setOffers] = useState(() =>
    loadJSON(KEYS.offers, [
      { id: 'o1', title: '10% Off Above ₹2000', desc: 'Auto discount on large orders', minAmount: 2000, percent: 10, reward: null, active: true },
      { id: 'o2', title: 'Free Dessert Above ₹5000', desc: 'Chef dessert platter complimentary', minAmount: 5000, percent: 0, reward: 'Free Dessert', active: true },
      { id: 'o3', title: 'Birthday Treat', desc: 'One-time yearly birthday benefit', minAmount: 0, percent: 15, reward: 'Free Dessert', active: true },
    ])
  );
  const [pendingReservation, setPendingReservation] = useState(() =>
    loadJSON(KEYS.pendingReservation, null)
  );
  const [pendingCheckout, setPendingCheckout] = useState(() =>
    loadJSON(KEYS.pendingCheckout, null)
  );
  const [birthdayUsage, setBirthdayUsage] = useState(() =>
    loadJSON(KEYS.birthdayUsage, {})
  );

  useEffect(() => saveJSON(KEYS.locations, locations), [locations]);
  useEffect(() => saveJSON(KEYS.menu, menu), [menu]);
  useEffect(() => saveJSON(KEYS.tables, tables), [tables]);
  useEffect(() => saveJSON(KEYS.reservations, reservations), [reservations]);
  useEffect(() => saveJSON(KEYS.orders, orders), [orders]);
  useEffect(() => saveJSON(KEYS.chefQueue, chefQueue), [chefQueue]);
  useEffect(() => saveJSON(KEYS.feedback, feedbackList), [feedbackList]);
  useEffect(() => saveJSON(KEYS.offers, offers), [offers]);
  useEffect(() => saveJSON(KEYS.pendingReservation, pendingReservation), [pendingReservation]);
  useEffect(() => saveJSON(KEYS.pendingCheckout, pendingCheckout), [pendingCheckout]);
  useEffect(() => saveJSON(KEYS.birthdayUsage, birthdayUsage), [birthdayUsage]);

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

  const startCheckout = (userId, details, cartItems = []) => {
    // Food ordering is mandatory
    if (!cartItems || cartItems.length === 0) {
      return { ok: false, message: 'Please add at least one food item to continue reservation.' };
    }

    const { branchId, date, time, guests, name, email, phone, birthday } = details;
    const table = findAvailableTable(guests, date, time, branchId);
    if (!table) return { ok: false, message: 'No table fits selected guest count for this slot.' };
    if (isSlotTaken(table.id, date, time)) return { ok: false, message: 'Selected slot is already booked.' };

    const year = new Date(date).getFullYear();
    const bdayKey = `${userId}-${year}`;
    const eligibleBirthday = Boolean(
      birthday &&
      sameDate(date, birthday) &&
      !birthdayUsage[bdayKey]
    );
    const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
    const taxes = Math.round(subtotal * 0.05);
    const offerSummary = getOfferSummary(subtotal, eligibleBirthday);
    const total = Math.max(0, subtotal + taxes - offerSummary.discount);
    const draft = {
      userId,
      details,
      table,
      cartItems,
      pricing: { subtotal, taxes, discount: offerSummary.discount, total, reward: offerSummary.reward },
      birthdayOffer: { applied: eligibleBirthday, benefit: eligibleBirthday ? 'Birthday discount + free dessert' : null },
    };
    setPendingCheckout(draft);
    return { ok: true, draft };
  };

  const completeReservation = (paymentPayload = {}) => {
    const draft = pendingCheckout;
    if (!draft) return { ok: false, message: 'No payment draft found. Please restart reservation.' };
    const { userId, details, table, cartItems, pricing, birthdayOffer } = draft;
    const { branchId, date, time, guests, name, email, phone, birthday, specialRequests } = details;

    console.log('[completeReservation] Starting reservation for table:', table);
    console.log('[completeReservation] Current table status before update:', table.status);

    if (isSlotTaken(table.id, date, time)) return { ok: false, message: 'Slot got booked by another user. Please retry.' };

    const reservation = {
      id: `res${Date.now()}`,
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
      paymentStatus: 'paid',
      paymentRef: paymentPayload.reference || `DM-${Date.now()}`,
    };

    console.log('[completeReservation] Creating reservation:', reservation);
    setReservations((prev) => [...prev, reservation]);
    
    console.log('[completeReservation] Updating table status to reserved for table:', table.id);
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === table.id) {
          console.log('[completeReservation] Table', t.id, 'status changing from', t.status, 'to reserved');
          return { ...t, status: 'reserved' };
        }
        return t;
      })
    );

    if (cartItems.length > 0 || pricing.subtotal > 0) {
      const order = {
        id: `ord${Date.now()}`,
        reservationId: reservation.id,
        userId,
        items: cartItems,
        subtotal: pricing.subtotal,
        tax: pricing.taxes,
        discount: pricing.discount,
        total: pricing.total,
        reward: pricing.reward,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      setOrders((prev) => [...prev, order]);

      const queueItem = {
        id: `cq${Date.now()}`,
        reservationId: reservation.id,
        orderId: order.id,
        customerName: name,
        tableNumber: table.number,
        items: cartItems.map((i) => `${i.name}×${i.qty}`).join(', '),
        specialRequests: specialRequests || '',
        reservationTime: `${date} ${time}`,
        status: 'pending',
        kitchenStatus: 'preparing',
        isNew: true,
        updatedAt: new Date().toISOString(),
      };
      setChefQueue((prev) => [...prev, queueItem]);
    } else {
      setChefQueue((prev) => [
        ...prev,
        {
          id: `cq${Date.now()}`,
          reservationId: reservation.id,
          orderId: null,
          customerName: name,
          tableNumber: table.number,
          items: 'Dine-in reservation',
          specialRequests: specialRequests || '',
          reservationTime: `${date} ${time}`,
          status: 'pending',
          kitchenStatus: 'preparing',
          isNew: true,
          updatedAt: new Date().toISOString(),
        },
      ]);
    }

    if (birthdayOffer.applied) {
      const key = `${userId}-${new Date(date).getFullYear()}`;
      setBirthdayUsage((prev) => ({ ...prev, [key]: true }));
    }
    setPendingReservation(null);
    setPendingCheckout(null);
    console.log('[completeReservation] Reservation completed successfully');
    return { ok: true, reservation, birthdayOffer, pricing };
  };

  const cancelReservation = (resId, userId) => {
    const res = reservations.find((r) => r.id === resId);
    if (!res || res.userId !== userId) return { ok: false };
    console.log('[cancelReservation] Cancelling reservation:', resId, 'for table:', res.tableId);
    setReservations((prev) =>
      prev.map((r) => (r.id === resId ? { ...r, status: 'cancelled' } : r))
    );
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === res.tableId) {
          console.log('[cancelReservation] Table', t.id, 'status changing from', t.status, 'to available');
          return { ...t, status: 'available' };
        }
        return t;
      })
    );
    setChefQueue((prev) => prev.filter((q) => q.reservationId !== resId));
    return { ok: true };
  };

  const updateTableStatus = (tableId, newStatus) => {
    console.log('[updateTableStatus] Updating table', tableId, 'status to:', newStatus);
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

  const updateKitchenStatus = (queueId, kitchenStatus) => {
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

  const addTable = (data) => {
    const newTable = {
      id: `t${Date.now()}`,
      number: data.number,
      capacity: Number(data.capacity),
      status: data.status || 'available',
      branchId: data.branchId || null,
    };
    console.log('[addTable] Adding new table:', newTable);
    setTables((prev) => [...prev, newTable]);
  };

  const resetTables = () => {
    console.log('[resetTables] Clearing all tables');
    setTables([]);
    // Force clear localStorage immediately
    localStorage.removeItem(KEYS.tables);
    // Also clear any other related data that might have stale references
    localStorage.removeItem(KEYS.reservations);
    setReservations([]);
  };

  const updateTable = (id, patch) => {
    setTables((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const deleteTable = (id) => {
    setTables((prev) => prev.filter((t) => t.id !== id));
  };

  const addMenuItem = (item) => {
    setMenu((prev) => [...prev, { ...item, id: `m${Date.now()}` }]);
  };

  const updateMenuItem = (id, patch) => {
    setMenu((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const deleteMenuItem = (id) => {
    setMenu((prev) => prev.filter((m) => m.id !== id));
  };

  const addFeedback = (entry) => {
    setFeedbackList((prev) => [...prev, { ...entry, id: `fb${Date.now()}`, createdAt: new Date().toISOString() }]);
  };

  const removeFeedback = (id) => setFeedbackList((prev) => prev.filter((f) => f.id !== id));

  const addLocation = (location) => setLocations((prev) => [...prev, { ...location, id: `b${Date.now()}` }]);
  const updateLocation = (id, patch) => setLocations((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const deleteLocation = (id) => setLocations((prev) => prev.filter((l) => l.id !== id));

  const tableStats = {
    total: tables.length,
    available: tables.filter((t) => t.status === 'available').length,
    reserved: tables.filter((t) => t.status === 'reserved').length,
    occupied: tables.filter((t) => t.status === 'occupied').length,
  };

  const getAnalytics = () => {
    const active = reservations.filter((r) => r.status !== 'cancelled');
    const activeOrders = orders.filter((o) => o.status !== 'completed');
    const chefs = loadJSON('dm_users', DEMO_USERS).filter((u) => u.role === 'chef');
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
      chefCount: chefs.length,
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
        pendingReservation,
        pendingCheckout,
        setPendingReservation,
        startCheckout,
        setPendingCheckout,
        completeReservation,
        cancelReservation,
        updateTableStatus,
        markTableOccupied,
        markTableAvailable,
        updateKitchenStatus,
        markChefOrdersSeen,
        isSlotTaken,
        addTable,
        updateTable,
        deleteTable,
        resetTables,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        addFeedback,
        removeFeedback,
        addLocation,
        updateLocation,
        deleteLocation,
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
