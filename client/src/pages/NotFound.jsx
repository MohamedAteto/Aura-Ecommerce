import { Link } from 'react-router-dom';
import './Page.css';

export function NotFound() {
  return (
    <div className="page-pad" style={{ textAlign: 'center' }}>
      <h1>404</h1>
      <p className="page-lead" style={{ margin: '0 auto' }}>
        This page drifted off the map.
      </p>
      <Link to="/" className="btn btn--primary" style={{ marginTop: '1.25rem' }}>
        Back home
      </Link>
    </div>
  );
}
