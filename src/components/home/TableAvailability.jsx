import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Link } from 'react-router-dom';
import './TableAvailability.css';

export default function TableAvailability() {
  const { tables, locations } = useApp();

  return (
    <section className="table-availability section">
      <div className="container">
        <div className="section-head">
          <h2>Table Availability by Location</h2>
          <p>Check real-time table availability at our locations</p>
        </div>
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
                <div className="location-details">
                  <p><strong>Address:</strong> {loc.address}</p>
                  <p><strong>Phone:</strong> {loc.phone}</p>
                  {loc.email && <p><strong>Email:</strong> {loc.email}</p>}
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
    </section>
  );
}
