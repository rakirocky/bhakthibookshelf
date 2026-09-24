// Placeholder layouts shown by loading.tsx while a page's data loads —
// the gold shimmer (.skeleton, modern.css) instead of a blank screen.

export function LibrarySkeleton() {
  return (
    <div className="skeleton-page" aria-busy="true" aria-label="Loading books">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton-grid">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="skeleton skeleton-card" />
        ))}
      </div>
    </div>
  );
}

export function BookSkeleton() {
  return (
    <div className="skeleton-page" aria-busy="true" aria-label="Loading book">
      <div className="skeleton-book">
        <div className="skeleton skeleton-cover" />
        <div className="skeleton-lines">
          <div className="skeleton" style={{ height: 44, width: "70%" }} />
          <div className="skeleton" style={{ height: 20, width: "45%" }} />
          <div className="skeleton" style={{ height: 16, width: "35%" }} />
          <div className="skeleton" style={{ height: 16, width: "40%" }} />
          <div className="skeleton" style={{ height: 48, width: 220, marginTop: 20 }} />
        </div>
      </div>
    </div>
  );
}
