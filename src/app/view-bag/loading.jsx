import BookLoader from "@/components/UI/BookLoader";

export default function Loading() {
  return (
    <div className="section-1200" style={{ padding: "60px 16px" }}>
      <BookLoader label="Loading shared bag…" />
    </div>
  );
}
