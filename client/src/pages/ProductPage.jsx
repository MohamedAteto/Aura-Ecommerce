import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, PackageSearch } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StarRating } from '../components/StarRating';
import { ReviewForm } from '../components/ReviewForm';
import { ProductCard } from '../components/ProductCard';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import api from '../api/client';
import { mediaUrl } from '../api/media';
import './Page.css';
import './ProductPage.css';

export function ProductPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [p, setP] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const [prod, revs, rel] = await Promise.all([
        api.get(`/api/Products/${id}`),
        api.get(`/api/Products/${id}/reviews`),
        api.get(`/api/Products/${id}/related`, { params: { limit: 4 } }),
      ]);
      setP(prod.data);
      setReviews(Array.isArray(revs.data) ? revs.data : []);
      setRelated(Array.isArray(rel.data) ? rel.data : []);
    } catch { setP(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadProduct(); setSelectedVariation(null); setMsg(null); }, [id]);

  const add = async () => {
    if (!isAuthenticated) { setMsg('Log in to add items to your cart.'); return; }
    setAdding(true); setMsg(null);
    try {
      await api.post('/api/Cart', { productId: Number(id), quantity: qty, variationId: selectedVariation?.id ?? null });
      setMsg('Added to your cart!');
    } catch (e) { setMsg(e?.response?.data?.message || 'Could not add to cart.'); }
    finally { setAdding(false); }
  };

  if (loading) return <Spinner />;
  if (!p) return <div className="page-pad"><EmptyState icon={PackageSearch} message="Product not found." ctaLabel="Back to shop" ctaTo="/shop" /></div>;

  const displayPrice = selectedVariation ? p.price + selectedVariation.priceDelta : p.price;
  const fmt = (n) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n);
  const sizes = [...new Set(p.variations?.map(v => v.size).filter(Boolean))];
  const colors = [...new Set(p.variations?.map(v => v.color).filter(Boolean))];

  return (
    <div className="page-pad">
      <motion.div className="product-detail__grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <div className="product-detail__img">
          <img src={mediaUrl(p.imageUrl)} alt={p.name} />
          {!p.inStock && <div className="product-detail__oos">Out of stock</div>}
        </div>
        <div className="product-detail__info">
          <p className="eyebrow">{p.categoryName}</p>
          <h1 className="product-detail__title">{p.name}</h1>
          <div className="product-detail__rating">
            <StarRating rating={p.averageRating ?? 0} size={16} />
            <span className="product-detail__rating-val">{(p.averageRating ?? 0).toFixed(1)}</span>
            <span className="product-detail__reviews">({p.reviewCount ?? 0} reviews)</span>
          </div>
          <p className="product-detail__price">{fmt(displayPrice)}</p>
          <p className="product-detail__desc">{p.description}</p>

          {/* Variations */}
          {sizes.length > 0 && (
            <div className="product-detail__variations">
              <p className="product-detail__var-label">Size</p>
              <div className="product-detail__var-options">
                {sizes.map(size => {
                  const v = p.variations.find(x => x.size === size && (!selectedVariation?.color || x.color === selectedVariation?.color));
                  const oos = v?.stockQuantity === 0;
                  return (
                    <button key={size} type="button"
                      className={`product-detail__var-btn ${selectedVariation?.size === size ? 'product-detail__var-btn--active' : ''} ${oos ? 'product-detail__var-btn--oos' : ''}`}
                      disabled={oos}
                      onClick={() => setSelectedVariation(v ?? null)}>
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {colors.length > 0 && (
            <div className="product-detail__variations">
              <p className="product-detail__var-label">Color</p>
              <div className="product-detail__var-options">
                {colors.map(color => {
                  const v = p.variations.find(x => x.color === color && (!selectedVariation?.size || x.size === selectedVariation?.size));
                  const oos = v?.stockQuantity === 0;
                  return (
                    <button key={color} type="button"
                      className={`product-detail__var-btn ${selectedVariation?.color === color ? 'product-detail__var-btn--active' : ''} ${oos ? 'product-detail__var-btn--oos' : ''}`}
                      disabled={oos}
                      onClick={() => setSelectedVariation(v ?? null)}>
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="product-detail__row">
            <label className="field" style={{ marginBottom: 0 }}>
              <span className="field__label">Qty</span>
              <input className="input input--sm" type="number" min={1} max={99} value={qty} onChange={e => setQty(Math.max(1, Number(e.target.value) || 1))} style={{ width: 70 }} />
            </label>
            <motion.button type="button" className="btn btn--primary" onClick={add} disabled={adding || !p.inStock} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <ShoppingCart size={15} /> {adding ? 'Adding…' : 'Add to cart'}
            </motion.button>
          </div>
          {msg && <p className="form-hint" style={{ color: msg.includes('!') ? '#4ade80' : 'var(--accent-3)' }}>{msg}</p>}
        </div>
      </motion.div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="section" style={{ marginTop: '3rem' }}>
          <div className="section__head">
            <h2 className="section__title">Related Products</h2>
          </div>
          <div className="grid-products">
            {related.map((rp, i) => <ProductCard key={rp.id} product={rp} index={i} />)}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="section" style={{ marginTop: '3rem' }}>
        <h2 className="section__title">Reviews</h2>
        {isAuthenticated && !hasReviewed && (
          <ReviewForm productId={Number(id)} onSubmitted={() => { setHasReviewed(true); loadProduct(); }} />
        )}
        {reviews.length === 0
          ? <EmptyState icon={PackageSearch} message="No reviews yet. Be the first to share your experience!" />
          : (
            <div className="reviews-list">
              {reviews.map(r => (
                <div key={r.id} className="review-item">
                  <div className="review-item__head">
                    <span className="review-item__author">{r.userName ?? 'User'}</span>
                    <StarRating rating={r.rating} size={13} />
                    <span className="review-item__date">{new Date(r.createdAtUtc).toLocaleDateString()}</span>
                  </div>
                  {r.comment && <p className="review-item__comment">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
      </section>
    </div>
  );
}
