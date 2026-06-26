import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { TIME_SLOTS } from '../data/initialData';
import { useApp } from '../context/AppContext';
import './Reserve.css';

export default function Reserve() {
  const navigate = useNavigate();
  const { setPendingReservation, locations, tables } = useApp();
  const [form, setForm] = useState({
    branchId: locations[0]?.id || '',
    date: '',
    time: TIME_SLOTS[4],
    guests: 2,
  });

  const minDate = new Date().toISOString().split('T')[0];

  // Log when tables change to ensure we're getting live data
  useEffect(() => {
    console.log('[Reserve] Tables updated:', tables.length);
    console.log('[Reserve] Available tables:', tables.filter(t => t.status === 'available').length);
  }, [tables]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'guests' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.date) {
      toast.error('Please select a date');
      return;
    }
    if (!form.branchId) {
      toast.error('Please select a location');
      return;
    }
    if (form.guests < 1) {
      toast.error('Please select at least 1 guest');
      return;
    }

    // Check if there are available tables for this location
    const availableTables = tables.filter(
      t => t.branchId === form.branchId && t.status === 'available' && t.capacity >= form.guests
    );

    console.log('[Reserve] Available tables for location:', form.branchId, 'guests:', form.guests, 'count:', availableTables.length);

    if (availableTables.length === 0) {
      toast.error('No available tables for this location and guest count. Please try a different time or location.');
      return;
    }

    setPendingReservation(form);
    toast.success('Step 1 complete — add food items');
    navigate('/menu');
  };

  return (
    <div className="reserve-page">
      <header className="page-header">
        <h1>Reserve Your Table</h1>
        <p>Step 1 of 4 — Choose location, date & time</p>
      </header>

      <div className="container reserve-container">
        <motion.form
          className="reserve-form card"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="form-group">
            <label htmlFor="branchId">Restaurant Location</label>
            <select id="branchId" name="branchId" value={form.branchId} onChange={handleChange} required>
              {locations.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} — {b.city}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                name="date"
                min={minDate}
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="time">Time</label>
              <select id="time" name="time" value={form.time} onChange={handleChange} required>
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="guests">Number of Guests</label>
            <select id="guests" name="guests" value={form.guests} onChange={handleChange}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-full">
            Continue to Details
          </button>
        </motion.form>
      </div>
    </div>
  );
}
