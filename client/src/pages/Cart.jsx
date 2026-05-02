import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { mediaUrl } from '../api/media';
import './Page.css';
import './Cart.css';

export function Cart() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponErr, setCouponErr] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/Cart');
      setItems(Array.isArray(data) ? data : (data?.items ?? []));
      setErr(null);
    } catch (e) { setItems([]); setErr(e?.response?.data?.message || 'Failed to load cart'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (isAuthenticated) load(); }, [isAuthenticated]);

  const update = async (id, quantity) => { await api.put(`/api/Cart/${id}`, { quantity }); load(); };
  const remove = async (id) => { await api.delete(`/api/Cart/${id}`); load(); };

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setApplyingCoupon(true); setCouponErr(null);
    try {
      const { data } = await api.post('/api/Cart/apply-coupon', { code: coupon.trim() });
      setCouponApplied(data);
    } catch (e) { setCouponErr(e?.response?.data?.message || 'Invalid coupon'); }
    finally { setApplyingCoupon(false); }
  };

  const checkout = async () => {
    setErr(null);
    try {
      const { data } = await api.post('/api/Orders/checkout', { couponCode: couponApplied?.couponCode ?? null });
      return data;
    } catch (e) { setErr(e?.response?.data?.message || 'Checkout failed'); return null; }
  };

  if (!isAuthenticated) return (
    <div className="page-pad">
      <h1>Cart</h1>
      <p>Please <Link to="/login">log in</Link> to view your saved cart.</p>
    </div>
  );

  if (loading) return <Spinner />;

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const discount = couponApplied?.discountAmount ?? 0;
  const total = subtotal - discount;
  const fmt = (n) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n);

  return (
    <div className="page-pad">
      <h1>Your cart</h1>
      {err && <p className="form-error">{err}</p>}

      {items.length === 0
        ? <EmptyState icon={ShoppingBag} message="Your cart is empty." ctaLabel="Continue shopping" ctaTo="/shop" />
        : (
          <div className="cart-layout">
            <ul className="cart-list">
              {items.map(i => (
                <motion.li key={i.id} className="cart-line" layout exit={{ opacity: 0, x: -20 }}>
                  <img src={mediaUrl(i.imageUrl)} alt="" className="cart-line__img" />
                  <div className="cart-line__info">
                    <p className="cart-line__name">{i.productName}</p>
                    {i.variationLabel && <p className="cart-line__variant">{i.variationLabel}</p>}
                    <p className="cart-line__meta">{fmt(i.unitPrice)} each</p>
                  </div>
                  <input className="input input--sm cart-line__qty" type="number" min={1} max={999} value={i.quantity}
                    onChange={e => update(i.id, Math.max(1, Number(e.target.value) || 1))} />
                  <p className="cart-line__sum">{fmt(i.lineTotal ?? i.unitPrice * i.quantity)}</p>
                  <button type="button" className="btn btn--ghost cart-line__remove" onClick={() => remove(i.id)}>✕</button>
                </motion.li>
              ))}
            </ul>

            <div className="cart-summary">
              {/* Coupon */}
              <div className="cart-coupon">
                <div className="cart-coupon__row">
                  <Tag size={14} color="var(--muted)" />
                  <input className="input" placeholder="Coupon code" value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())} style={{ flex: 1 }} />
                  <button type="button" className="btn btn--ghost" onClick={applyCoupon} disabled={applyingCoupon}>
                    {applyingCoupon ? '…' : 'Apply'}
                  </button>
                </div>
                {couponErr && <p style={{ color: 'var(--accent-3)', fontSize: '0.82rem', marginTop: '0.35rem' }}>{couponErr}</p>}
                {couponApplied && <p style={{ color: '#4ade80', fontSize: '0.82rem', marginTop: '0.35rem' }}>✓ {couponApplied.couponCode} — saving {fmt(couponApplied.discountAmount)}</p>}
              </div>

              {/* Totals */}
              <div className="cart-totals">
                <div className="cart-totals__row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                {discount > 0 && <div className="cart-totals__row cart-totals__row--discount"><span>Discount</span><span>−{fmt(discount)}</span></div>}
                <div className="cart-totals__row cart-totals__row--total"><span>Total</span><span>{fmt(total)}</span></div>
              </div>

              <CheckOutButton onCheckout={checkout} />
            </div>
          </div>
        )}
    </div>
  );
}

function CheckOutButton({ onCheckout }) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(null);
  return (
    <div>
      {note && <p className="form-hint" style={{ color: '#4ade80' }}>{note}</p>}
      <motion.button type="button" className="btn btn--primary" style={{ width: '100%', justifyContent: 'center' }}
        disabled={busy} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={async () => {
          setBusy(true); setNote(null);
          const order = await onCheckout();
          if (order) setNote(`Order #${order.id} placed! View your orders to pay.`);
          setBusy(false);
        }}>
        {busy ? 'Processing…' : 'Checkout'}
      </motion.button>
    </div>
  );
}
