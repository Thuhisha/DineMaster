import './LoadingSpinner.css';

export default function LoadingSpinner({ size = 'md', label = 'Loading...' }) {
  return (
    <div className={`spinner-wrap spinner-${size}`} role="status">
      <div className="spinner" />
      {label && <span className="spinner-label">{label}</span>}
    </div>
  );
}
