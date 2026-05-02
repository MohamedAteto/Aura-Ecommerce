import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, PackageSearch } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProductCard } from '../components/ProductCard';
import { SkeletonGrid } from '../components/SkeletonGrid';
import { SearchBar } from '../components/SearchBar';
import { EmptyState } from '../components/EmptyState';
import api from '../api/client';
import './Page.css';
import './Shop.css';

const RATINGS = [
  { label: '4★ & up', value: '4' },
  { label: '3★ & up', value: '3' },
  { label: '2★ & up', value: '2' },
];

export function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const categoryId = searchParams.get('category') || '';
  const q = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || 'asc';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minRating = searchParams.get('minRating') || '';

  const activeFilterCount = [categoryId, q, minPrice, maxPrice, minRating].filter(Boolean).length;

  useEffect(() => {
    api.get('/api/Categories').then(r => setCategories(r.data ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    api.get('/api/Products', {
      params: {
        page, pageSize: 12,
        categoryId: categoryId || undefined,
        search: q || undefined,
        sort: sort === 'high' ? 'desc' : 'asc',
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        minRating: minRating || undefined,
      },
    }).then(r => {
      if (!cancel) { setData(r.data); setErr(null); }
    }).catch(() => {
      if (!cancel) setErr('Failed to load products.');
    }).finally(() => {
      if (!cancel) setLoading(false);
    });
    return () => { cancel = true; };
  }, [page, categoryId, q, sort, minPrice, maxPrice, minRating]);

  const set = (k, v) => {
    const p = new URLSearchParams(searchParams);
    if (!v) p.delete(k); else p.set(k, v);
    if (k !== 'page') p.set('page', '1');
    setSearchParams(p);
  };

  const clearAll = () => setSearchParams({});

  return (
    <div className="page-pad">
      <header className="page-header">
        <h1>Shop</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SlidersHorizontal size={16} color="var(--muted)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Filters</span>
          {activeFilterCount > 0 && (
            <span style={{ background: 'var(--accent-hot)', color: '#fff', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, padding: '1px 7px' }}>
              {activeFilterCount}
            </span>
          )}
        </div>
      </header>

      <div className="shop-layout">
        <aside className="shop-filters">
          <SearchBar onSearch={v => set('q', v)} />

          <label className="field">
            <span className="field__label">Category</span>
            <select className="input" value={categoryId || 'all'} onChange={e => set('category', e.target.value === 'all' ? '' : e.target.value)}>
              <option value="all">All categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>

          <label className="field">
            <span className="field__label">Sort by price</span>
            <select className="input" value={sort} onChange={e => set('sort', e.target.value)}>
              <option value="asc">Low → High</option>
              <option value="high">High → Low</option>
            </select>
          </label>

          <div className="field">
            <span className="field__label">Price range ($)</span>
            <div className="shop-price-range">
              <input className="input" type="number" placeholder="Min" min="0" value={minPrice}
                onChange={e => set('minPrice', e.target.value)} />
              <span className="shop-price-range__sep">to</span>
              <input className="input" type="number" placeholder="Max" min="0" value={maxPrice}
                onChange={e => set('maxPrice', e.target.value)} />
            </div>
          </div>

          <div className="field">
            <span className="field__label">Min rating</span>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {RATINGS.map(r => (
                <motion.button key={r.value} type="button"
                  className={`shop-rating-btn ${minRating === r.value ? 'shop-rating-btn--active' : ''}`}
                  onClick={() => set('minRating', minRating === r.value ? '' : r.value)}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  {r.label}
                </motion.button>
              ))}
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button type="button" className="btn btn--ghost" style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }} onClick={clearAll}>
              Clear all filters
            </button>
          )}
        </aside>

        <div>
          {err && <p className="form-error">{err}</p>}
          {loading && <SkeletonGrid />}
          {!loading && data && (
            <>
              {data.items?.length === 0
                ? <EmptyState icon={PackageSearch} message="No products match your filters." ctaLabel="Clear filters" ctaTo="/shop" />
                : (
                  <div className="grid-products">
                    {data.items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                  </div>
                )}
              {(data.totalPages ?? 1) > 1 && (
                <div className="pagination">
                  <button type="button" className="btn btn--ghost" disabled={page <= 1} onClick={() => set('page', String(page - 1))}>Previous</button>
                  <span className="pagination__meta">Page {data.page} of {data.totalPages} ({data.totalCount} items)</span>
                  <button type="button" className="btn btn--ghost" disabled={page >= data.totalPages} onClick={() => set('page', String(page + 1))}>Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
