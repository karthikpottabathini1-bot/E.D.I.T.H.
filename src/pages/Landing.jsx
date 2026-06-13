import {
  Eye,
  Brain,
  Volume2,
  Database,
  Search,
  Sigma,
  Headphones,
  Cpu,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import HeroArt from "../components/HeroArt";
import CornerGlow from "../components/CornerGlow";
import GlassCard from "../components/GlassCard";
import Section from "../components/Section";
import LandingNav from "../components/LandingNav";

export default function Landing() {
  const pipeline = [
    {
      icon: Eye,
      tag: "01 · SEE",
      title: "Capture the moment",
      body:
        "A camera and mic take in the room — faces, objects, conversation — the raw signal E.D.I.T.H. needs to understand what's happening around you.",
    },
    {
      icon: Brain,
      tag: "02 · REMEMBER",
      title: "Think with context",
      body:
        "Backboard holds E.D.I.T.H.'s long-term memory and routes the moment through the right tools — Wolfram for hard numbers, live search for fresh facts.",
    },
    {
      icon: Volume2,
      tag: "03 · ADVISE",
      title: "Respond in the moment",
      body:
        "An on-screen overlay and a calm spoken voice deliver the advice — right as you need it, not ten minutes later.",
    },
  ];

  const stack = [
    {
      icon: Database,
      name: "Backboard.io",
      role: "Memory & reasoning",
      body:
        "One API for the language model, persistent memory, tool-calling, and live web search. This is where E.D.I.T.H. remembers you.",
    },
    {
      icon: Sparkles,
      name: "Vercel",
      role: "Deployment",
      body:
        "Ships the overlay the moment it's ready — E.D.I.T.H. is always one link away, on any device.",
    },
    {
      icon: Sigma,
      name: "Wolfram",
      role: "Calculation",
      body:
        "Turns fuzzy questions into exact answers. The calculator working quietly behind E.D.I.T.H.'s advice.",
    },
    {
      icon: Headphones,
      name: "Omi",
      role: "Ambient audio",
      body:
        "A wearable mic that keeps listening — feeding E.D.I.T.H. what it hears throughout the day.",
    },
    {
      icon: Cpu,
      name: "ASUS · Analog Devices",
      role: "Hardware",
      body:
        "The machines and sensors E.D.I.T.H. runs on — from a laptop on your desk to a sensor on your wrist.",
    },
    {
      icon: Search,
      name: "Live search",
      role: "Fresh facts",
      body:
        "When E.D.I.T.H.'s memory isn't enough, it reaches out to the web — folded into the same conversation, the same voice.",
    },
  ];

  const impact = [
    {
      title: "For ADHD minds",
      body: "Gentle, timely nudges instead of deadlines that slip by unnoticed.",
    },
    {
      title: "For social anxiety",
      body: "Quiet context on who you're talking to — and what mattered to them last time.",
    },
    {
      title: "For everyone",
      body: "A memory that doesn't reset every time you open a new tab.",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#020203] text-white">
      <LandingNav />

      {/* Hero */}
      <section className="relative h-screen w-full overflow-hidden flex flex-col justify-end">
        <HeroArt />
        <div className="absolute inset-0 edith-hero-fade" />

        <div className="relative z-10 px-6 md:px-10 pb-20 md:pb-28">
          <div className="max-w-6xl mx-auto w-full">
            <p className="font-mono text-xs edith-tag text-blue-200/70 mb-6">
              MILPITAS HACKS 3 · 06.13.2026
            </p>
            <h1 className="font-display text-7xl md:text-9xl font-semibold leading-none mb-6">
              E.D.I.T.H.
            </h1>
            <p className="font-display text-2xl md:text-4xl text-gray-200 mb-6 max-w-xl">
              Your second brain. Better than your first.
            </p>
            <p className="text-gray-400 text-base md:text-lg max-w-md mb-10 leading-relaxed">
              E.D.I.T.H. watches what you see, listens to what you hear, and
              remembers what you forget — turning every glance and conversation
              into advice you can actually use.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#pipeline"
                className="font-mono text-xs edith-tag inline-flex items-center gap-2 bg-white text-black rounded-full px-6 py-3 hover:bg-gray-200 transition-colors"
              >
                HOW E.D.I.T.H. THINKS <ArrowRight size={14} />
              </a>
              <a
                href="/dashboard"
                className="font-mono text-xs edith-tag inline-flex items-center gap-2 border border-white/20 rounded-full px-6 py-3 hover:border-white/40 transition-colors"
              >
                OPEN E.D.I.T.H.
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <Section id="vision" className="relative px-6 md:px-10 py-24 md:py-32 overflow-hidden">
        <CornerGlow className="w-96 h-96 -top-32 -left-32" color="#FF9D5C" />
        <div className="max-w-6xl mx-auto relative z-10">
          <p className="font-mono text-xs edith-tag text-orange-200/70 mb-4">
            THE PROBLEM
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mb-16 max-w-2xl">
            Your brain has bad RAM.
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <GlassCard>
              <h3 className="font-display text-xl mb-3">You forget names.</h3>
              <p className="text-gray-400 leading-relaxed">
                Met someone last week? E.D.I.T.H. didn't forget — it never does.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="font-display text-xl mb-3">You miss the moment.</h3>
              <p className="text-gray-400 leading-relaxed">
                The right advice usually arrives ten minutes too late. E.D.I.T.H.
                gives it to you while it still matters.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="font-display text-xl mb-3">Your tools reset.</h3>
              <p className="text-gray-400 leading-relaxed">
                Every chat starts from zero. E.D.I.T.H. carries context forward — a
                brain that actually accumulates.
              </p>
            </GlassCard>
          </div>
        </div>
      </Section>

      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="edith-glow-line" />
      </div>

      {/* Pipeline */}
      <Section id="pipeline" className="relative px-6 md:px-10 py-24 md:py-32 overflow-hidden">
        <CornerGlow className="w-96 h-96 -top-32 -right-32" color="#6FB7FF" />
        <div className="max-w-6xl mx-auto relative z-10">
          <p className="font-mono text-xs edith-tag text-blue-200/70 mb-4">
            HOW E.D.I.T.H. THINKS
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mb-16 max-w-2xl">
            See. Remember. Advise.
          </h2>

          <div className="grid md:grid-cols-3 gap-6 md:gap-4 relative">
            {pipeline.map((step, i) => (
              <div key={step.title} className="relative">
                <GlassCard className="h-full">
                  <step.icon size={28} className="mb-6 text-gray-200" />
                  <p className="font-mono text-xs edith-tag text-gray-500 mb-3">
                    {step.tag}
                  </p>
                  <h3 className="font-display text-xl mb-3">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">
                    {step.body}
                  </p>
                </GlassCard>
                {i < pipeline.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px edith-glow-line z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Stack */}
      <Section id="stack" className="relative px-6 md:px-10 py-24 md:py-32 overflow-hidden">
        <CornerGlow className="w-96 h-96 -bottom-32 -left-32" color="#FF9D5C" />
        <div className="max-w-6xl mx-auto relative z-10">
          <p className="font-mono text-xs edith-tag text-orange-200/70 mb-4">
            THE STACK
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mb-16 max-w-2xl">
            Six tools. One brain.
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stack.map((item) => (
              <GlassCard key={item.name}>
                <item.icon size={24} className="mb-5 text-gray-200" />
                <h3 className="font-display text-lg mb-1">{item.name}</h3>
                <p className="font-mono text-xs edith-tag text-gray-500 mb-4">
                  {item.role.toUpperCase()}
                </p>
                <p className="text-gray-400 leading-relaxed text-sm">
                  {item.body}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </Section>

      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="edith-glow-line" />
      </div>

      {/* Impact */}
      <Section id="impact" className="relative px-6 md:px-10 py-24 md:py-32 overflow-hidden">
        <CornerGlow className="w-96 h-96 -top-32 -right-32" color="#6FB7FF" />
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start relative z-10">
          <div>
            <p className="font-mono text-xs edith-tag text-blue-200/70 mb-4">
              WHY IT MATTERS
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold mb-6">
              Built for real brains.
            </h2>
            <p className="text-gray-400 leading-relaxed max-w-md">
              E.D.I.T.H. isn't just a gadget — it's quiet cognitive support for the
              moments your attention can't stretch far enough.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {impact.map((item) => (
              <GlassCard key={item.title} className="py-5 px-6">
                <h3 className="font-display text-base mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {item.body}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="px-6 md:px-10 py-16 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <p className="font-display text-2xl mb-2">E.D.I.T.H.</p>
            <p className="text-gray-500 text-sm">
              An AI second brain — built at Milpitas Hacks 3.
            </p>
          </div>
          <nav className="flex gap-6 font-mono text-xs edith-tag text-gray-400">
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
        </div>
      </footer>
    </div>
  );
}
