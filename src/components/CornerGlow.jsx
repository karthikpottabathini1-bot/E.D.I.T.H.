export default function CornerGlow({ className = "", color = "#6FB7FF" }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-full ${className}`}
      style={{
        background: `radial-gradient(circle, ${color}33, transparent 70%)`,
        filter: "blur(60px)",
      }}
    />
  );
}
