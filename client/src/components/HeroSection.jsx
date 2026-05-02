import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Headphones, Footprints, Smartphone, Laptop, Sparkles } from 'lucide-react';
import './HeroSection.css';

const words = ['Style', 'that', 'moves', 'with', 'you'];

const floatingCards = [
  { icon: Headphones, label: 'Audio', price: '$349', color: 'linear-gradient(135deg,#0ea5e9,#6366f1)', delay: 0 },
  { icon: Footprints, label: 'Sneakers', price: '$150', color: 'linear-gradient(135deg,#f472b6,#a855f7)', delay: 0.15 },
  { icon: Smartphone, label: 'Phones', price: '$999', color: 'linear-gradient(135deg,#34d399,#0d9488)', delay: 0.3 },
  { icon: Laptop, label: 'Laptops', price: '$1999', color: 'linear-gradient(135deg,#f97316,#eab308)', delay: 0.45 },
];

const stats = [
  { value: '10K+', label: 'Products' },
  { value: '50K+', label: 'Customers' },
  { value: '4.9★', label: 'Rating' },
];

const tickerItems = ['Free Shipping', 'New Arrivals', 'Premium Quality', 'Easy Returns', 'Secure Checkout', 'Top Brands'];

export function HeroSection() {
  const [typeIndex, setTypeIndex] = useState(0);
  const typeWords = ['Premium', 'Curated', 'Exclusive', 'Trending'];

  useEffect(() => {
    const t = setInterval(() => setTypeIndex(i => (i + 1) % typeWords.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="hero">
      <div className="hero__particles" aria-hidden>
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={i} className="particle" style={{ '--i': i }} />
        ))}
      </div>
      <div className="hero__glow" />
      <div className="hero__orbs" aria-hidden>
        <span className="orb orb-1" /><span className="orb orb-2" />
        <span className="orb orb-3" /><span className="orb orb-4" />
      </div>

      <div className="hero__layout">
        <div className="hero__content">
          <motion.div className="hero__badge" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}>
            <span className="hero__badge-dot" />
            New season · limited drops
          </motion.div>

          <h1 className="hero__title">
            <span className="hero__title-line">
              {words.slice(0, 2).map((w, i) => (
                <motion.span key={i} className="hero__word" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}>
                  {w}{' '}
                </motion.span>
              ))}
            </span>
            <span className="hero__title-line">
              <motion.span className="hero__typewriter" key={typeIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                {typeWords[typeIndex]}
              </motion.span>
            </span>
            <span className="hero__title-line">
              {words.slice(2).map((w, i) => (
                <motion.span key={i} className="hero__word" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + 0.08 * i, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}>
                  {w}{' '}
                </motion.span>
              ))}
            </span>
          </h1>

          <motion.p className="hero__sub" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.45 }}>
            Curated products, glass-smooth checkout, and a cart that stays with you.
          </motion.p>

          <motion.div className="hero__actions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, duration: 0.4 }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link to="/shop" className="btn btn--primary btn--lg hero__cta">
                <span>Start shopping</span><span className="hero__cta-arrow">→</span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link to="/register" className="btn btn--ghost btn--lg">Create account</Link>
            </motion.div>
          </motion.div>

          <motion.div className="hero__stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.5 }}>
            {stats.map((s, i) => (
              <motion.div key={s.label} className="hero__stat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 + i * 0.1 }}>
                <span className="hero__stat-value">{s.value}</span>
                <span className="hero__stat-label">{s.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="hero__cards" aria-hidden>
          {floatingCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.label} className="hero__float-card" style={{ background: card.color }}
                initial={{ opacity: 0, x: 60, rotate: 8 }} animate={{ opacity: 1, x: 0, rotate: i % 2 === 0 ? -3 : 3 }}
                transition={{ delay: 0.4 + card.delay, type: 'spring', stiffness: 80, damping: 15 }}
                whileHover={{ y: -12, scale: 1.06, rotate: 0, zIndex: 10 }}>
                <Icon size={28} color="rgba(255,255,255,0.9)" strokeWidth={1.5} />
                <div>
                  <div className="hero__float-label">{card.label}</div>
                  <div className="hero__float-price">{card.price}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="hero__ticker" aria-hidden>
        <div className="hero__ticker-track">
          {[...tickerItems, ...tickerItems].map((t, i) => (
            <span key={i} className="hero__ticker-item">
              <Sparkles size={10} color="var(--accent-hot)" /> {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
