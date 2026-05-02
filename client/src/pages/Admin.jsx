import { useEffect, useState } from 'react';
import api from '../api/client';
import { mediaUrl } from '../api/media';
import { Spinner } from '../components/Spinner';
import { ProductCard } from '../components/ProductCard';
import './Page.css';
import './Admin.css';

export function Admin() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState(null);
  const [categories, setCategories] = useState(null);
  const [err, setErr] = useState(null);

  const load = async () => {
    setErr(null);
    try {
      const [s, o, c] = await Promise.all([api.get('/api/Admin/stats'), api.get('/api/Orders/admin/all'), api.get('/api/Categories')]);
      setStats(s.data);
      setOrders(o.data);
      setCategories(c.data);
    } catch (e) {
      setErr(e?.response?.data?.error || 'Load failed');
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (err && !stats) return <p className="form-error page-pad">{err}</p>;
  if (!stats || !orders || !categories) return <Spinner />;

  return (
    <div className="page-pad admin">
      <h1>Admin</h1>
      <div className="stat-grid">
        <div className="stat-card">
          <p className="stat-label">Users</p>
          <p className="stat-val">{stats.userCount}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Orders</p>
          <p className="stat-val">{stats.orderCount}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Revenue (paid)</p>
          <p className="stat-val">
            {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(stats.revenue)}
          </p>
        </div>
      </div>

      <section className="admin__section">
        <h2>Categories</h2>
        <p className="admin__hint">Create categories first. Slug is optional (auto-generated from name). You cannot delete a category that still has products.</p>
        <CategoryManager categories={categories} onChanged={load} />
      </section>

      <section className="admin__section">
        <h2>Products</h2>
        <ProductForm categories={categories} onProductsChanged={load} />
      </section>

      <section className="admin__section">
        <h2>Bulk add products</h2>
        <p className="admin__hint">Add up to 100 items in one request. Use “Add row” for many lines, or “+10 rows” for a quick batch.</p>
        <BulkProductForm categories={categories} onDone={load} />
      </section>

      <section className="admin__section">
        <h2>All orders</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Id</th>
                <th>User</th>
                <th>Status</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.userId}</td>
                  <td>{o.status}</td>
                  <td>{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(o.totalAmount)}</td>
                  <td>{new Date(o.createdAtUtc).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function CategoryManager({ categories, onChanged }) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState(null);

  const reset = () => {
    setEditing(null);
    setName('');
    setSlug('');
  };

  const create = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      await api.post('/api/Categories', { name, slug: slug.trim() || null });
      reset();
      onChanged();
    } catch (ex) {
      setMsg(ex?.response?.data?.error || 'Failed');
    }
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      await api.put(`/api/Categories/${editing.id}`, { name, slug: slug.trim() || null });
      reset();
      onChanged();
    } catch (ex) {
      setMsg(ex?.response?.data?.error || 'Failed');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    setMsg(null);
    try {
      await api.delete(`/api/Categories/${id}`);
      onChanged();
    } catch (ex) {
      setMsg(ex?.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div className="cat-manager">
      <form className="cat-manager__form" onSubmit={editing ? saveEdit : create}>
        <label className="field">
          <span className="field__label">Name</span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} />
        </label>
        <label className="field">
          <span className="field__label">Slug (optional)</span>
          <input className="input" value={slug} onChange={(e) => setSlug(e.target.value)} maxLength={120} placeholder="auto from name" />
        </label>
        <div className="cat-manager__actions">
          {editing && (
            <button type="button" className="btn btn--ghost" onClick={reset}>
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn--primary">
            {editing ? 'Save category' : 'Add category'}
          </button>
        </div>
      </form>
      {msg && <p className="form-hint">{msg}</p>}
      <ul className="cat-list">
        {categories.map((c) => (
          <li key={c.id} className="cat-list__item">
            <div>
              <strong>{c.name}</strong>
              <span className="cat-slug">{c.slug}</span>
            </div>
            <div className="cat-list__btns">
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => {
                  setEditing(c);
                  setName(c.name);
                  setSlug(c.slug);
                  setMsg(null);
                }}
              >
                Edit
              </button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => remove(c.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

async function uploadProductImage(file) {
  const fd = new FormData();
  fd.append('file', file);
  const { data } = await api.post('/api/Media/upload', fd);
  return data.url;
}

function ProductForm({ categories, onProductsChanged }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: 'Sample product',
    description: 'Description',
    price: 9.99,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    categoryId: categories[0]?.id ?? 1,
  });
  const [products, setProducts] = useState(null);
  const [msg, setMsg] = useState(null);
  const [uploading, setUploading] = useState(false);

  const loadProducts = async () => {
    const { data } = await api.get('/api/Products', { params: { page: 1, pageSize: 200, sort: 'asc' } });
    setProducts(data.items);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const onPickImage = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setUploading(true);
    setMsg(null);
    try {
      const url = await uploadProductImage(f);
      setForm((prev) => ({ ...prev, imageUrl: url }));
      setMsg('Image uploaded — URL filled automatically.');
    } catch (ex) {
      setMsg(ex?.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      if (editing) {
        await api.put(`/api/Products/${editing.id}`, form);
        setMsg('Product updated.');
        setEditing(null);
      } else {
        await api.post('/api/Products', form);
        setMsg('Product created.');
      }
      await loadProducts();
      onProductsChanged();
    } catch (ex) {
      setMsg(ex?.response?.data?.error || 'Failed');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    setMsg(null);
    try {
      await api.delete(`/api/Products/${id}`);
      await loadProducts();
      onProductsChanged();
    } catch (ex) {
      setMsg(ex?.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div>
      {products && (
        <div className="admin-product-grid">
          {products.map((p, i) => (
            <div key={p.id} className="admin-pro-wrap">
              <ProductCard product={p} index={i} />
              <div className="admin-pro-actions">
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => {
                    setEditing(p);
                    setForm({
                      name: p.name,
                      description: p.description,
                      price: p.price,
                      imageUrl: p.imageUrl,
                      categoryId: p.categoryId,
                    });
                    setMsg(null);
                  }}
                >
                  Edit
                </button>
                <button type="button" className="btn btn--ghost admin-del" onClick={() => remove(p.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <form className="admin-form" onSubmit={submit}>
        <h3 className="admin-form__h">{editing ? `Edit #${editing.id}` : 'Add product'}</h3>
        <div className="upload-row">
          <label className="upload-drop">
            <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={onPickImage} disabled={uploading} />
            <span className="upload-drop__text">{uploading ? 'Uploading…' : 'Choose product photo'}</span>
            <span className="upload-drop__sub">JPG, PNG, GIF, WebP · max ~6MB</span>
          </label>
          <div className="upload-preview">
            {form.imageUrl && <img src={mediaUrl(form.imageUrl)} alt="" />}
          </div>
        </div>
        <div className="admin-form__row">
          <label className="field">
            <span className="field__label">Name</span>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label className="field">
            <span className="field__label">Price</span>
            <input
              className="input"
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              required
            />
          </label>
          <label className="field">
            <span className="field__label">Category</span>
            <select className="input" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="field">
          <span className="field__label">Image URL (or use upload above)</span>
          <input className="input" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} required />
        </label>
        <label className="field">
          <span className="field__label">Description</span>
          <textarea className="input input--area" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        </label>
        <div className="admin-form__actions">
          {editing && (
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setEditing(null);
                setMsg(null);
              }}
            >
              Cancel edit
            </button>
          )}
          <button type="submit" className="btn btn--primary">
            {editing ? 'Save changes' : 'Add product'}
          </button>
        </div>
        {msg && <p className="form-hint">{msg}</p>}
      </form>
    </div>
  );
}

function emptyRow(catId) {
  return {
    name: '',
    description: 'New item',
    price: 19.99,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    categoryId: catId,
  };
}

function BulkProductForm({ categories, onDone }) {
  const defCat = categories[0]?.id ?? 1;
  const [rows, setRows] = useState([emptyRow(defCat), emptyRow(defCat), emptyRow(defCat)]);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const setRow = (i, patch) => {
    setRows((r) => r.map((row, j) => (j === i ? { ...row, ...patch } : row)));
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    const items = rows.filter((r) => r.name.trim());
    if (items.length === 0) {
      setMsg('Add at least one row with a name.');
      return;
    }
    setBusy(true);
    try {
      await api.post('/api/Products/bulk', { items });
      setMsg(`Created ${items.length} products.`);
      setRows([emptyRow(defCat), emptyRow(defCat), emptyRow(defCat)]);
      onDone();
    } catch (ex) {
      setMsg(ex?.response?.data?.error || ex?.response?.data?.errors ? JSON.stringify(ex.response.data.errors) : 'Bulk create failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="bulk-form" onSubmit={submit}>
      <div className="bulk-toolbar">
        <button type="button" className="btn btn--ghost" onClick={() => setRows((r) => [...r, emptyRow(defCat)])}>
          + Add row
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => setRows((r) => [...r, ...Array.from({ length: 10 }, () => emptyRow(defCat))])}>
          +10 rows
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => setRows([emptyRow(defCat)])}>
          Clear all
        </button>
      </div>
      <div className="bulk-scroll">
        <table className="bulk-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Price</th>
              <th>Category</th>
              <th>Description</th>
              <th>Image URL</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>
                  <input className="input input--table" value={row.name} onChange={(e) => setRow(i, { name: e.target.value })} placeholder="Product name" />
                </td>
                <td>
                  <input
                    className="input input--table"
                    type="number"
                    step="0.01"
                    value={row.price}
                    onChange={(e) => setRow(i, { price: Number(e.target.value) })}
                  />
                </td>
                <td>
                  <select className="input input--table" value={row.categoryId} onChange={(e) => setRow(i, { categoryId: Number(e.target.value) })}>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input className="input input--table" value={row.description} onChange={(e) => setRow(i, { description: e.target.value })} />
                </td>
                <td>
                  <input className="input input--table" value={row.imageUrl} onChange={(e) => setRow(i, { imageUrl: e.target.value })} />
                </td>
                <td>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => setRows((r) => r.filter((_, j) => j !== i))}>
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="submit" className="btn btn--primary" disabled={busy}>
        {busy ? 'Saving…' : 'Create all filled rows'}
      </button>
      {msg && <p className="form-hint">{msg}</p>}
    </form>
  );
}
