import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/client';
import './AdminPages.css';

const EMPTY = { name: '', description: '', price: '', imageUrl: '', categoryId: '', stockQuantity: 0 };

export function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | product
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);
  const PAGE_SIZE = 10;

  const load = async (p = page) => {
    setLoading(true);
    try {
      const [prod, cats] = await Promise.all([
        api.get('/api/Products', { params: { page: p, pageSize: PAGE_SIZE } }),
        api.get('/api/Categories'),
      ]);
      setProducts(prod.data.items ?? []);
      setTotal(prod.data.totalCount ?? 0);
      setCategories(cats.data ?? []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const openCreate = () => { setForm(EMPTY); setErr(null); setModal('create'); };
  const openEdit = (p) => { setForm({ name: p.name, description: p.description, price: p.price, imageUrl: p.imageUrl, categoryId: p.categoryId, stockQuantity: p.stockQuantity }); setErr(null); setModal(p); };

  const save = async () => {
    setSaving(true); setErr(null);
    try {
      const body = { ...form, price: parseFloat(form.price), categoryId: parseInt(form.categoryId), stockQuantity: parseInt(form.stockQuantity) };
      if (modal === 'create') await api.post('/api/Products', body);
      else await api.put(`/api/Products/${modal.id}`, body);
      setModal(null);
      load();
    } catch (e) { setErr(e?.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/api/Products/${id}`);
    load();
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="admin-page">
      <div className="admin-toolbar">
        <h1 className="admin-toolbar__title">Products</h1>
        <button type="button" className="btn btn--primary" onClick={openCreate}><Plus size={14} /> Add product</button>
      </div>

      {loading ? <p className="admin-loading">Loading…</p> : (
        <div className="admin-chart-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.categoryName}</td>
                  <td>${p.price}</td>
                  <td>{p.stockQuantity}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button type="button" className="btn btn--ghost" style={{ padding: '4px 8px' }} onClick={() => openEdit(p)}><Pencil size={13} /></button>
                      <button type="button" className="btn btn--ghost" style={{ padding: '4px 8px', color: 'var(--accent-3)' }} onClick={() => del(p.id)}><Trash2 size={13} /></button>
                    </div>
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

      <AnimatePresence>
        {modal && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={e => e.target === e.currentTarget && setModal(null)}>
            <motion.div className="admin-modal" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 className="admin-modal__title" style={{ margin: 0 }}>{modal === 'create' ? 'Add Product' : 'Edit Product'}</h3>
                <button type="button" onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}><X size={18} /></button>
              </div>
              {[['name', 'Name', 'text'], ['description', 'Description', 'text'], ['price', 'Price', 'number'], ['imageUrl', 'Image URL', 'text'], ['stockQuantity', 'Stock', 'number']].map(([key, label, type]) => (
                <label key={key} className="field">
                  <span className="field__label">{label}</span>
                  <input className="input" type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                </label>
              ))}
              <label className="field">
                <span className="field__label">Category</span>
                <select className="input" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
                  <option value="">Select…</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              {err && <p style={{ color: 'var(--accent-3)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{err}</p>}
              <div className="admin-modal__actions">
                <button type="button" className="btn btn--ghost" onClick={() => setModal(null)}>Cancel</button>
                <button type="button" className="btn btn--primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
