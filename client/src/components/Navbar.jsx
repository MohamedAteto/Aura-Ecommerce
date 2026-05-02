import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { ShoppingCart, User, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const linkMotion = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.04, y: -2, transition: { type: 'spring', stiffness: 400, damping: 22 } },
  tap: { scale: 0.97 },
};

export function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [loc.pathname]);

  const links = [
    { to: '/', end: true, label: 'Home' },
    { to: '/shop', end: false, label: 'Shop' },
    ...(isAuthenticated ? [
      { to: '/cart', end: false, label: 'Cart', icon: ShoppingCart },
      { to: '/orders', end: false, label: 'Orders' },
    ] : []),
    ...(isAdmin ? [{ to: '/admin', end: false, label: 'Admin' }] : []),
  ];

  return (
    <motion.header
      className={`nav-shell ${scrolled ? 'nav-shell--scrolled' : ''}`}
      initial={false}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="nav-inner">
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
          <Link to="/" className="nav-brand">
            <span className="nav-mark" />
            AURA
          </Link>
        </motion.div>

        <button type="button" className={`nav-burger ${open ? 'nav-burger--open' : ''}`} aria-label="Menu" aria-expanded={open} onClick={() => setOpen(v => !v)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>

        <nav className={`nav-links ${open ? 'nav-links--open' : ''}`}>
          <LayoutGroup id="main-nav">
            {links.map(item => (
              <motion.div key={item.to + (item.end ? 'e' : '')} className="nav-link-wrap" initial="rest" whileHover="hover" whileTap="tap" variants={linkMotion}>
                <NavLink to={item.to} end={item.end} className={({ isActive }) => `nav-a ${isActive ? 'nav-a--active' : ''}`}>
                  {({ isActive }) => (
                    <>
                      {isActive && <motion.span className="nav-a__pill" layoutId="nav-active-pill" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                      <span className="nav-a__label">
                        {item.icon && <item.icon size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              </motion.div>
            ))}
          </LayoutGroup>
        </nav>

        <div className={`nav-auth ${open ? 'nav-auth--open' : ''}`}>
          <AnimatePresence mode="wait">
            {isAuthenticated ? (
              <motion.div key="in" className="nav-auth__row" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
                <span className="nav-user">
                  <User size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  {user?.fullName}
                </span>
                <motion.button type="button" className="btn btn--ghost" onClick={logout} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                  Log out
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key="out" className="nav-auth__row" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
                <Link to="/login" className="btn btn--ghost">Log in</Link>
                <Link to="/register" className="btn btn--primary">Sign up</Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}
