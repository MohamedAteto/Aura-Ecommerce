import { motion } from 'framer-motion';
import './KpiCard.css';

export function KpiCard({ icon: Icon, label, value, trend, color = 'var(--accent-hot)' }) {
  return (
    <motion.div
      className="kpi-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -3 }}
    >
      <div className="kpi-card__icon" style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}>
        {Icon && <Icon size={22} />}
      </div>
      <div>
        <p className="kpi-card__label">{label}</p>
        <p className="kpi-card__value">{value}</p>
        {trend && <p className="kpi-card__trend">{trend}</p>}
      </div>
    </motion.div>
  );
}
