import './SkeletonGrid.css';

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="sk-grid">
      {Array.from({ length: count }).map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={i} className="sk-card" />
      ))}
    </div>
  );
}
