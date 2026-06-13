export default function GlassCard({ children, className = "", strong = false }) {
  return (
    <div
      className={`rounded-2xl p-6 md:p-8 ${strong ? "edith-glass-strong" : "edith-glass"} ${className}`}
    >
      {children}
    </div>
  );
}
