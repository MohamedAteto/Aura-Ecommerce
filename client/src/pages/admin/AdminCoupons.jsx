import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/client';
import './AdminPages.css';

const EMPTY = { code: '', type: 'Percentage', value: '', minOrderAmount: 0, maxUses: '', isActive: true };

export function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/api/Admin/coupons').then(r => setCoupons(r.data ?? [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setErr(null); setModal('create'); };
  const openEdit = (c) => { setForm({ code: c.code, type: c.type, value: c.value, minOrderAmount: c.minOrderAmount, maxUses: c.maxUses ?? '', isActive: c.isActive }); setErr(null); setModal(c); };

  const save = async () => {
    setSaving(true); setErr(null);
    try {
      const body = { ...form, value: parseFloat(form.value), minOrderAmount: parseFloat(form.minOrderAmount) || 0, maxUses: form.maxUses ? parseInt(form.maxUses) : null };
      if (modal === 'create') await api.post('/api/Admin/coupons', body);
      else await api.put(`/api/Admin/coupons/${modal.id}`, body);
      setModal(null); load();
    } catch (e) { setErr(e?.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    await api.delete(`/api/Admin/coupons/${id}`);
    load();
  };

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  return (
    <div className="admin-page">
      <div className="admin-toolbar">
        <h1 className="admin-toolbar__title">Coupons</h1>
        <button type="button" className="btn btn--primary" onClick={openCreate}><Plus size={14} /> Add coupon</button>
      </div>

      {loading ? <p className="admin-loading">Loading…</p> : (
        <div className="admin-chart-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="admin-table">
            <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Min Order</th><th>Uses</th><th>Active</th><th></th></tr></thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id}>
                  <td><code style={{ background: 'var(--bg-elev)', padding: '2px 6px', borderRadius: 4, fontSize: '0.85rem' }}>{c.code}</code></td>
                  <td>{c.type}</td>
                  <td>{c.type === 'Percentage' ? `${c.value}%` : fmt(c.value)}</td>
                  <td>{fmt(c.minOrderAmount)}</td>
                  <td>{c.usedCount}{c.maxUses ? `/${c.maxUses}` : ''}</td>
                  <td><span className={`admin-badge ${c.isActive ? 'admin-badge--delivered' : 'admin-badge--cancelled'}`}>{c.isActive ? 'Active' : 'Off'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button type="button" className="btn btn--ghost" style={{ padding: '4px 8px' }} onClick={() => openEdit(c)}><Pencil size={13} /></button>
                      <button type="button" className="btn btn--ghost" style={{ padding: '4px 8px', color: 'var(--accent-3)' }} onClick={() => del(c.id)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={e => e.target === e.currentTarget && setModal(null)}>
            <motion.div className="admin-modal" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 className="admin-modal__title" style={{ margin: 0 }}>{modal === 'create' ? 'Add Coupon' : 'Edit Coupon'}</h3>
                <button type="button" onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}><X size={18} /></button>
              </div>
              <label className="field"><span className="field__label">Code</span><input className="input" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} /></label>
              <label className="field"><span className="field__label">Type</span>
                <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="Percentage">Percentage</option>
                  <option value="FixedAmount">Fixed Amount</option>
                </select>
              </label>
              <label className="field"><span className="field__label">Value ({form.type === 'Percentage' ? '%' : '$'})</span><input className="input" type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} /></label>
              <label className="field"><span className="field__label">Min Order ($)</span><input className="input" type="number" value={form.minOrderAmount} onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))} /></label>
              <label className="field"><span className="field__label">Max Uses (blank = unlimited)</span><input className="input" type="number" value={form.maxUses} onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))} /></label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                <span style={{ fontSize: '0.88rem', color: 'var(--text)' }}>Active</span>
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
