import { motion } from 'framer-motion';
import './BarChart.css';

export default function BarChart({ title, data = [], valuePrefix = '' }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <motion.div
      className="bar-chart glass-panel"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {title && <h3 className="chart-title">{title}</h3>}
      <div className="bar-chart-bars">
        {data.map((d, i) => (
          <div key={d.label} className="bar-col">
            <motion.div
              className="bar-fill"
              initial={{ height: 0 }}
              animate={{ height: `${(d.value / max) * 100}%` }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              title={`${valuePrefix}${d.value}`}
            />
            <span className="bar-label">{d.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
