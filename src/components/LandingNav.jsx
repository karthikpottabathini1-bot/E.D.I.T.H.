export default function LandingNav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="edith-glass mt-4 rounded-full px-6 py-3 flex items-center justify-between">
          <a href="/" className="font-display text-lg tracking-wide">
            E.D.I.T.H.
          </a>
          <nav className="hidden md:flex items-center gap-8 font-mono text-xs edith-tag text-gray-300">
            <a href="#vision" className="hover:text-white transition-colors">
              VISION
            </a>
            <a href="#pipeline" className="hover:text-white transition-colors">
              HOW IT WORKS
            </a>
            <a href="#stack" className="hover:text-white transition-colors">
              STACK
            </a>
            <a href="#impact" className="hover:text-white transition-colors">
              IMPACT
            </a>
          </nav>
          <a
            href="/dashboard"
            className="font-mono text-xs edith-tag border border-white border-opacity-20 rounded-full px-4 py-2 hover:border-opacity-40 transition-colors"
          >
            OPEN E.D.I.T.H.
          </a>
        </div>
      </div>
    </header>
  );
}
