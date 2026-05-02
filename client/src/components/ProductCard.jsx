import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { StarRating } from './StarRating';
import { mediaUrl } from '../api/media';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import './ProductCard.css';

export function ProductCard({ product, index = 0 }) {
  const { isAuthenticated } = useAuth();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const addToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { window.location.href = '/login'; return; }
    setAdding(true);
    try {
      await api.post('/api/Cart', { productId: product.id, quantity: 1 });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch { /* ignore */ }
    finally { setAdding(false); }
  };

  const isNew = product.id % 5 === 0;
  const isSale = product.id % 7 === 0;

  return (
    <motion.article
      className="pcard"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to={`/shop/${product.id}`} className="pcard__link">
        <div className="pcard__img-wrap">
          <img src={mediaUrl(product.imageUrl)} alt={product.name} className="pcard__img" loading="lazy" />
          <div className="pcard__shine" />
          <div className="pcard__badges">
            {!product.inStock && <span className="pcard__badge pcard__badge--oos">Out of stock</span>}
            {isNew && product.inStock && <span className="pcard__badge pcard__badge--new">New</span>}
            {isSale && product.inStock && <span className="pcard__badge pcard__badge--sale">Sale</span>}
          </div>
          <div className="pcard__overlay"><span className="pcard__quick">Quick view →</span></div>
        </div>
        <div className="pcard__body">
          <p className="pcard__cat">{product.categoryName}</p>
          <h3 className="pcard__title">{product.name}</h3>
          <div className="pcard__rating">
            <StarRating rating={product.averageRating ?? 0} size={12} />
            <span className="pcard__rating-val">{(product.averageRating ?? 0).toFixed(1)}</span>
            <span className="pcard__reviews">({product.reviewCount ?? 0})</span>
          </div>
          <div className="pcard__footer">
            <p className="pcard__price">
              {isSale && <span className="pcard__price-old">${(product.price * 1.2).toFixed(2)}</span>}
              ${product.price}
            </p>
          </div>
        </div>
      </Link>
      <motion.button
        className={`pcard__add ${added ? 'pcard__add--done' : ''}`}
        onClick={addToCart}
        disabled={adding || !product.inStock}
        whileHover={{ scale: product.inStock ? 1.02 : 1 }}
        whileTap={{ scale: product.inStock ? 0.97 : 1 }}
      >
        {added ? '✓ Added!' : adding ? '…' : (
          <><ShoppingCart size={13} /> {product.inStock ? 'Add to cart' : 'Out of stock'}</>
        )}
      </motion.button>
    </motion.article>
  );
}
