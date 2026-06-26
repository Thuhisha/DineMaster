import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import './Tables.css';

export default function Tables() {
  const { tables, locations } = useApp();

  return (
    <div className="tables-page">
      <header className="page-header">
        <h1>Table Availability by Location</h1>
        <p>Live status — updated in real time when reservations change</p>
      </header>

      <div className="container">
        <div className="locations-grid">
          {locations.map((loc) => {
            const availableTables = tables.filter((t) => t.branchId === loc.id && t.status === 'available');
            const reservedTables = tables.filter((t) => t.branchId === loc.id && t.status === 'reserved');
            const occupiedTables = tables.filter((t) => t.branchId === loc.id && t.status === 'occupied');
            return (
              <motion.div
                key={loc.id}
                className="location-availability card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h3>{loc.name} — {loc.city}</h3>
                <div className="location-contact-info">
                  {loc.phone && <span className="contact-item">📞 {loc.phone}</span>}
                  {loc.email && <span className="contact-item">✉️ {loc.email}</span>}
                  {loc.mapLink && (
                    <a href={loc.mapLink} target="_blank" rel="noopener noreferrer" className="contact-item map-link">
                      📍 View on Map
                    </a>
                  )}
                </div>
                <div className="table-stats">
                  <div className="stat-item available">
                    <span className="stat-label">Available</span>
                    <span className="stat-value">{availableTables.length}</span>
                  </div>
                  <div className="stat-item reserved">
                    <span className="stat-label">Reserved</span>
                    <span className="stat-value">{reservedTables.length}</span>
                  </div>
                  <div className="stat-item occupied">
                    <span className="stat-label">Occupied</span>
                    <span className="stat-value">{occupiedTables.length}</span>
                  </div>
                </div>
                {availableTables.length > 0 && (
                  <div className="available-tables-list">
                    <p className="tables-label">Available Tables:</p>
                    <div className="tables-chips">
                      {availableTables.map((t) => (
                        <span key={t.id} className="table-chip">
                          Table {t.number} ({t.capacity}-seater)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {availableTables.length === 0 && (
                  <p className="no-tables">No available tables</p>
                )}
                <div className="location-cta">
                  <Link to="/reserve" className="btn btn-primary btn-sm">Reserve at {loc.name}</Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
