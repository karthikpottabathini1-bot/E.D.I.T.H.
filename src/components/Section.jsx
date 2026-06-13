import { useReveal } from "../hooks/useReveal";

export default function Section({ id, children, className = "" }) {
  const [ref, visible] = useReveal();
  return (
    <section
      id={id}
      ref={ref}
      className={`edith-reveal ${visible ? "edith-reveal-visible" : ""} ${className}`}
    >
      {children}
    </section>
  );
}
