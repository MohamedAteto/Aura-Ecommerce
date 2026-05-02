import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';
import './SearchBar.css';

export function SearchBar({ onSearch }) {
  const [q, setQ] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get('/api/Products/suggestions', { params: { q } });
        setSuggestions(Array.isArray(data) ? data : []);
        setOpen(true);
      } catch { setSuggestions([]); }
    }, 300);
  }, [q]);

  const go = (term) => {
    setQ(term);
    setOpen(false);
    setSuggestions([]);
    if (onSearch) onSearch(term);
    else navigate(`/shop?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="searchbar">
      <div className="searchbar__input-wrap">
        <Search size={16} className="searchbar__icon" />
        <input
          className="searchbar__input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onKeyDown={(e) => e.key === 'Enter' && q.trim() && go(q.trim())}
          placeholder="Search products…"
        />
        {q && (
          <button type="button" className="searchbar__clear" onClick={() => { setQ(''); setSuggestions([]); setOpen(false); }}>
            <X size={14} />
          </button>
        )}
      </div>
      <AnimatePresence>
        {open && suggestions.length > 0 && (
          <motion.ul
            className="searchbar__dropdown"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {suggestions.map((s) => (
              <li key={s.id}>
                <button type="button" className="searchbar__suggestion" onClick={() => go(s.name)}>
                  <Search size={12} />
                  {s.name}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
