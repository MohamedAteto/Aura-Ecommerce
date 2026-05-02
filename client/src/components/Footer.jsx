import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Send } from 'lucide-react';
import api from '../api/client';
import './Footer.css';

const shopLinks = [
  { label: 'All Products', to: '/shop' },
  { label: 'Electronics', to: '/shop?category=1' },
  { label: 'Clothing', to: '/shop?category=2' },
  { label: 'Books', to: '/shop?category=3' },
  { label: 'Sports', to: '/shop?category=5' },
];

const accountLinks = [
  { label: 'Login', to: '/login' },
  { label: 'Register', to: '/register' },
  { label: 'My Orders', to: '/orders' },
  { label: 'Cart', to: '/cart' },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true); setMsg(null);
    try {
      const { data } = await api.post('/api/Newsletter/subscribe', { email: email.trim() });
      setMsg({ text: data?.message || 'Thank you for subscribing!', ok: true });
      setEmail('');
    } catch (ex) {
      setMsg({ text: ex?.response?.data?.message || 'Something went wrong.', ok: false });
    } finally { setLoading(false); }
  };

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        {/* Brand */}
        <div className="site-footer__brand">
          <Link to="/" className="site-footer__logo">
            <span className="site-footer__mark" />
            AURA
          </Link>
          <p className="site-footer__tagline">
            Premium products, glass-smooth experience. Built with React + ASP.NET Core.
          </p>
        </div>

        {/* Shop links */}
        <div className="site-footer__col">
          <h4 className="site-footer__heading">Shop</h4>
          <ul className="site-footer__list">
            {shopLinks.map(l => (
              <li key={l.label}><Link to={l.to} className="site-footer__link">{l.label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Account links */}
        <div className="site-footer__col">
          <h4 className="site-footer__heading">Account</h4>
          <ul className="site-footer__list">
            {accountLinks.map(l => (
              <li key={l.label}><Link to={l.to} className="site-footer__link">{l.label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div className="site-footer__col">
          <h4 className="site-footer__heading">Newsletter</h4>
          <p className="site-footer__sub">Get the latest drops and deals.</p>
          <form className="site-footer__form" onSubmit={subscribe}>
            <div className="site-footer__input-wrap">
              <input
                className="site-footer__input"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <motion.button type="submit" className="site-footer__submit" disabled={loading} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Send size={14} />
              </motion.button>
            </div>
            {msg && <p className="site-footer__msg" style={{ color: msg.ok ? '#4ade80' : 'var(--accent-3)' }}>{msg.text}</p>}
          </form>
        </div>
      </div>

      <div className="site-footer__bottom">
        <p>© {new Date().getFullYear()} AURA. All rights reserved.</p>
        <p className="site-footer__fine">Local demo · SQL Server + ASP.NET Core + React</p>
      </div>
    </footer>
  );
}
