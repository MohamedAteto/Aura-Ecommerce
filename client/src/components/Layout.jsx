import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import './Layout.css';

export function Layout() {
  const { pathname } = useLocation();
  return (
    <div className="app-root">
      <div className="app-bg" aria-hidden />
      <Navbar />
      <main className="app-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            className="page"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
