// Shown while the blogs index loads / during navigation — a shimmering
// skeleton that mirrors the real layout (hero + card grid).
export default function BlogsLoading() {
  return (
    <div className="section-1200 blog-index">
      <div className="blog-index-head">
        <div className="skel skel-title" />
        <div className="skel skel-sub" />
      </div>

      {/* Hero skeleton */}
      <div className="blog-hero skel-hero">
        <div className="skel skel-hero-media" />
        <div className="blog-hero-body">
          <div className="skel skel-line w40" />
          <div className="skel skel-line w90" />
          <div className="skel skel-line w80" />
          <div className="skel skel-line w60" />
        </div>
      </div>

      {/* Card grid skeleton */}
      <div className="blog-card-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="blog-card">
            <div className="skel skel-card-media" />
            <div className="blog-card-body">
              <div className="skel skel-line w30" />
              <div className="skel skel-line w90" />
              <div className="skel skel-line w70" />
              <div className="skel skel-line w40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
