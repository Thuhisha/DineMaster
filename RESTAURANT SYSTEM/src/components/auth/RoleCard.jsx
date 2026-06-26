import { motion } from 'framer-motion';
import './RoleCard.css';

export default function RoleCard({ role, selected, onSelect }) {
  const Icon = role.icon;

  return (
    <motion.button
      type="button"
      className={`role-card ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(role.id)}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      style={{ '--role-gradient': role.gradient }}
    >
      <span className="role-card-icon">
        <Icon />
      </span>
      <span className="role-card-title">{role.title}</span>
      <span className="role-card-sub">{role.subtitle}</span>
      {selected && <span className="role-card-check">✓</span>}
    </motion.button>
  );
}
