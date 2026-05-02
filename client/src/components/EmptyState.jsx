import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './EmptyState.css';

export function EmptyState({ icon: Icon, message, ctaLabel, ctaTo }) {
  return (
    <motion.div
      className="empty-state"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {Icon && <div className="empty-state__icon"><Icon size={48} strokeWidth={1.2} /></div>}
      <p className="empty-state__msg">{message}</p>
      {ctaLabel && ctaTo && (
        <Link to={ctaTo} className="btn btn--primary">{ctaLabel}</Link>
      )}
    </motion.div>
  );
}
