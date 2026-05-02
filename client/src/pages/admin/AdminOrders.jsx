import { useEffect, useState } from 'react';
import api from '../../api/client';
import './AdminPages.css';

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Failed'];

export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const PAGE_SIZE = 15;

  const load = async (p = page) => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/Admin/orders', { params: { page: p, pageSize: PAGE_SIZE, status: filter || undefined } });
      setOrders(data.items ?? []);
      setTotal(data.totalCount ?? 0);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, filter]);

  const advance = async (id, status) => {
    try {
      await api.patch(`/api/Admin/orders/${id}/status`, { status });
      load();
    } catch (e) { alert(e?.response?.data?.message || 'Failed'); }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  return (
    <div className="admin-page">
      <div className="admin-toolbar">
        <h1 className="admin-toolbar__title">Orders</h1>
        <select className="input" style={{ width: 160 }} value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? <p className="admin-loading">Loading…</p> : (
        <div className="admin-chart-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="admin-table">
            <thead><tr><th>#</th><th>User</th><th>Total</th><th>Status</th><th>Date</th><th>Advance</th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{o.userEmail}</td>
                  <td>{fmt(o.totalAmount)}</td>
                  <td><span className={`admin-badge admin-badge--${o.status?.toLowerCase()}`}>{o.status}</span></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{new Date(o.createdAtUtc).toLocaleDateString()}</td>
                  <td>
                    <select className="input" style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                      value={o.status}
                      onChange={e => advance(o.id, e.target.value)}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="admin-pagination">
          <button type="button" className="btn btn--ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
          <span className="admin-pagination__meta">Page {page} of {totalPages}</span>
          <button type="button" className="btn btn--ghost" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
