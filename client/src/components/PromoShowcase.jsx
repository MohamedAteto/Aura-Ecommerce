import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Headphones, Shirt, BookOpen, Home, Zap, Rocket, Lock, RotateCcw, MessageCircle } from 'lucide-react';
import './PromoShowcase.css';

const categories = [
  { label: 'Audio', icon: Headphones, desc: 'Premium sound', c: 'linear-gradient(135deg,#0ea5e9,#6366f1)', link: '/shop?category=1' },
  { label: 'Fashion', icon: Shirt, desc: 'Latest trends', c: 'linear-gradient(135deg,#f472b6,#a855f7)', link: '/shop?category=2' },
  { label: 'Books', icon: BookOpen, desc: 'Expand your mind', c: 'linear-gradient(135deg,#34d399,#0d9488)', link: '/shop?category=3' },
  { label: 'Home', icon: Home, desc: 'Smart living', c: 'linear-gradient(135deg,#f97316,#eab308)', link: '/shop?category=4' },
  { label: 'Sports', icon: Zap, desc: 'Peak performance', c: 'linear-gradient(135deg,#ef4444,#f97316)', link: '/shop?category=5' },
];

const features = [
  { icon: Rocket, title: 'Fast Delivery', desc: 'Same-day shipping on orders over $50', color: 'var(--accent-2)' },
  { icon: Lock, title: 'Secure Payment', desc: 'Bank-grade encryption on all transactions', color: 'var(--accent-hot)' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '30-day hassle-free return policy', color: '#34d399' },
  { icon: MessageCircle, title: '24/7 Support', desc: 'Always here when you need us', color: '#f97316' },
];

const floatingIcons = [Headphones, Shirt, Zap, BookOpen, Home];

export function PromoShowcase() {
  return (
    <>
      {/* Category cards */}
      <section className="promo" aria-label="Shop by category">
        <div className="promo__inner">
          <motion.div className="promo__header" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="promo__title">Shop by Category</h2>
            <Link to="/shop" className="text-link">Browse all →</Link>
          </motion.div>
          <div className="promo__grid">
            {categories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <motion.div key={cat.label}
                  initial={{ opacity: 0, y: 40, rotate: -4 }}
                  whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 * i, type: 'spring', stiffness: 80 }}
                  whileHover={{ y: -12, scale: 1.04, rotate: 1 }}>
                  <Link to={cat.link} className="promo__card" style={{ background: cat.c }}>
                    <Icon size={32} color="rgba(255,255,255,0.9)" strokeWidth={1.5} />
                    <span className="promo__label">{cat.label}</span>
                    <span className="promo__desc">{cat.desc}</span>
                    <span className="promo__arrow">→</span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Animated sale banner */}
      <section className="promo-banner">
        <div className="promo-banner__inner">
          <motion.div className="promo-banner__text"
            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <span className="promo-banner__tag">Limited Time</span>
            <h2 className="promo-banner__title">Up to <span className="promo-banner__highlight">50% OFF</span></h2>
            <p className="promo-banner__sub">On selected items this season. Don't miss out.</p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link to="/shop" className="btn btn--primary btn--lg">Shop the sale</Link>
            </motion.div>
          </motion.div>
          <div className="promo-banner__visual" aria-hidden>
            {floatingIcons.map((Icon, i) => (
              <motion.div key={i} className="promo-banner__float-icon"
                animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}>
                <Icon size={36} color="rgba(255,255,255,0.7)" strokeWidth={1.2} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features row */}
      <section className="features">
        <div className="features__inner">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title} className="feature"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.1 * i }}
                whileHover={{ y: -4 }}>
                <div className="feature__icon-wrap" style={{ background: `color-mix(in srgb, ${f.color} 15%, transparent)`, color: f.color }}>
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <div>
                  <h4 className="feature__title">{f.title}</h4>
                  <p className="feature__desc">{f.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </>
  );
}
