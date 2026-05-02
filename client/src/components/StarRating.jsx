import { Star, StarHalf } from 'lucide-react';

export function StarRating({ rating = 0, size = 14 }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.25 && rating - full < 0.75;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f${i}`} size={size} fill="#fbbf24" color="#fbbf24" strokeWidth={0} />
      ))}
      {half && <StarHalf size={size} fill="#fbbf24" color="#fbbf24" strokeWidth={0} />}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e${i}`} size={size} fill="none" color="var(--line-bright)" strokeWidth={1.5} />
      ))}
    </span>
  );
}
