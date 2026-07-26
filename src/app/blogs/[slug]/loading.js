// Shimmering skeleton shown while a blog post loads / during navigation.
export default function BlogPostLoading() {
  return (
    <div className="section-1200" style={{ padding: "40px 20px" }}>
      <div className="blog-layout">
        <div className="blog-main">
          <div className="skel skel-line w60" style={{ marginBottom: "24px" }} />
          <div
            className="skel"
            style={{ height: "320px", borderRadius: "16px", marginBottom: "20px" }}
          />
          <div className="skel" style={{ height: "34px", width: "85%", marginBottom: "14px" }} />
          <div className="skel skel-line w40" style={{ marginBottom: "28px" }} />
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="skel skel-line"
              style={{ width: i % 3 === 2 ? "70%" : "100%" }}
            />
          ))}
        </div>
        <aside className="blog-sidebar">
          <div className="skel" style={{ height: "220px", borderRadius: "14px", marginBottom: "20px" }} />
          <div className="skel" style={{ height: "260px", borderRadius: "14px" }} />
        </aside>
      </div>
    </div>
  );
}
