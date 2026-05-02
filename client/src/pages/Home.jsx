import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { HeroSection } from '../components/HeroSection';
import { PromoShowcase } from '../components/PromoShowcase';
import { ProductCard } from '../components/ProductCard';
import { SkeletonGrid } from '../components/SkeletonGrid';
import api from '../api/client';
import './Page.css';

export function Home() {
  const [products, setProducts] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const { data } = await api.get('/api/Products', { params: { page: 1, pageSize: 4, sort: 'asc' } });
        if (!cancel) setProducts(data.items);
      } catch (e) {
        if (!cancel) setErr('Could not load products. Is the API running?');
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  return (
    <div>
      <HeroSection />
      <section className="section">
        <div className="section__head">
          <h2 className="section__title">Spotlight</h2>
          <Link to="/shop" className="text-link">
            View all
          </Link>
        </div>
        {err && <p className="form-error form-error--banner">{err}</p>}
        {products == null && <SkeletonGrid count={4} />}
        {products && (
          <div className="grid-products">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>
      <PromoShowcase />
    </div>
  );
}
