import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, LogOut, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/coupons', icon: Tag, label: 'Coupons' },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="admin-layout">
      <motion.aside
        className="admin-sidebar"
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        <div className="admin-sidebar__brand">
          <Store size={20} />
          <span>AURA Admin</span>
        </div>
        <nav className="admin-sidebar__nav">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'admin-nav-item--active' : ''}`}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <div className="admin-sidebar__avatar">{user?.fullName?.[0]?.toUpperCase() ?? 'A'}</div>
            <div>
              <div className="admin-sidebar__name">{user?.fullName}</div>
              <div className="admin-sidebar__role">Administrator</div>
            </div>
          </div>
          <button type="button" className="admin-sidebar__logout" onClick={handleLogout}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </motion.aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
