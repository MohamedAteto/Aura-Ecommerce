import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusStepper } from '../components/StatusStepper';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import './Page.css';
import './Orders.css';

export function Orders() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [err, setErr] = useState(null);
  const [expanded, setExpanded] = useState({});

  const load = async (p = page) => {
    try {
      const { data } = await api.get('/api/Orders/my', { params: { page: p, pageSize: 10 } });
      setOrders(data.items ?? data ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch (e) { setErr(e?.response?.data?.message || 'Failed to load'); }
  };

  useEffect(() => { if (isAuthenticated) load(); }, [isAuthenticated, page]);

  if (!isAuthenticated) return (
    <div className="page-pad">
      <h1>Orders</h1>
      <p><Link to="/login">Log in</Link> to see your history.</p>
    </div>
  );

  if (orders == null) return <Spinner />;

  const fmt = (n) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n);
  const toggle = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  return (
    <div className="page-pad">
      <h1>Order history</h1>
      {err && <p className="form-error">{err}</p>}
      {orders.length === 0
        ? <EmptyState icon={ShoppingBag} message="You haven't placed any orders yet." ctaLabel="Start shopping" ctaTo="/shop" />
        : (
          <div className="order-list">
            {orders.map(o => (
              <motion.div key={o.id} className="order-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div className="order-card__head" onClick={() => toggle(o.id)} style={{ cursor: 'pointer' }}>
                  <div>
                    <p className="eyebrow">Order #{o.id}</p>
                    <p className="order-meta">{new Date(o.createdAtUtc).toLocaleString()}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <p className="order-total">{fmt(o.totalAmount)}</p>
                    {expanded[o.id] ? <ChevronUp size={16} color="var(--muted)" /> : <ChevronDown size={16} color="var(--muted)" />}
                  </div>
                </div>

                <StatusStepper status={o.status} />

                <AnimatePresence>
                  {expanded[o.id] && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                      <ul className="order-items">
                        {o.items?.map(it => (
                          <li key={`${o.id}-${it.productId}`} className="order-item">
                            <span>{it.productName}</span>
                            <span>×{it.quantity}</span>
                            <span>{fmt(it.unitPrice * it.quantity)}</span>
                          </li>
                        ))}
                      </ul>
                      {o.couponCode && (
                        <p style={{ fontSize: '0.82rem', color: '#4ade80', marginTop: '0.5rem' }}>
                          Coupon <code>{o.couponCode}</code> applied — saved {fmt(o.discountAmount)}
                        </p>
                      )}
                      {o.status === 'Pending' && <PayBlock orderId={o.id} onDone={() => load()} />}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem' }}>
          <button type="button" className="btn btn--ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span style={{ fontSize: '0.85rem', color: 'var(--muted)', alignSelf: 'center' }}>Page {page} of {totalPages}</span>
          <button type="button" className="btn btn--ghost" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}

function PayBlock({ orderId, onDone }) {
  const [msg, setMsg] = useState(null);
  return (
    <div className="pay-block">
      <p className="form-hint">Simulate card payment (demo only)</p>
      <div className="pay-row">
        <button type="button" className="btn btn--primary" onClick={async () => {
          try { await api.post(`/api/Orders/${orderId}/pay`, { succeed: true }); setMsg('Payment succeeded!'); onDone(); }
          catch (e) { setMsg(e?.response?.data?.message || 'Failed'); }
        }}>Pay (success)</button>
        <button type="button" className="btn btn--ghost" onClick={async () => {
          try { await api.post(`/api/Orders/${orderId}/pay`, { succeed: false }); setMsg('Payment declined.'); onDone(); }
          catch (e) { setMsg(e?.response?.data?.message || 'Failed'); }
        }}>Pay (fail)</button>
      </div>
      {msg && <p className="form-hint">{msg}</p>}
    </div>
  );
}
