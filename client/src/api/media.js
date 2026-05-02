/** Resolve product image URL (supports absolute URLs and API-relative /uploads/... paths). */
export function mediaUrl(path) {
  if (!path) return '';
  const p = String(path).trim();
  if (p.startsWith('http://') || p.startsWith('https://')) return p;
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  if (!base) return p.startsWith('/') ? p : `/${p}`;
  return `${base}${p.startsWith('/') ? p : `/${p}`}`;
}
