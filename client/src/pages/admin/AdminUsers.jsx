import { useEffect, useState } from 'react';
import api from '../../api/client';
import './AdminPages.css';

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const PAGE_SIZE = 20;

  useEffect(() => {
    setLoading(true);
    api.get('/api/Admin/users', { params: { page, pageSize: PAGE_SIZE } })
      .then(r => { setUsers(r.data.items ?? []); setTotal(r.data.totalCount ?? 0); })
      .finally(() => setLoading(false));
  }, [page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="admin-page">
      <div className="admin-toolbar">
        <h1 className="admin-toolbar__title">Users</h1>
        <span className="admin-pagination__meta">{total} total</span>
      </div>

      {loading ? <p className="admin-loading">Loading…</p> : (
        <div className="admin-chart-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Orders</th><th>Joined</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.fullName}</td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{u.email}</td>
                  <td><span className={`admin-badge ${u.role === 'Admin' ? 'admin-badge--shipped' : 'admin-badge--pending'}`}>{u.role}</span></td>
                  <td>{u.orderCount}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{new Date(u.createdAtUtc).toLocaleDateString()}</td>
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
