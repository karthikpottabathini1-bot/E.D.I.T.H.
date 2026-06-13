import { useState, useEffect } from "react";
import { HardDrive, Shield, Trash2, Check, Send } from "lucide-react";
import GlassCard from "../components/GlassCard";
import { generateSummary } from "../utils/memoryStore";

const SCRIPT_URL = import.meta.env.VITE_EMAIL_SCRIPT_URL || "";
const CAL_URL = import.meta.env.VITE_CALENDAR_SCRIPT_URL || "";

export default function Settings() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("edith_openrouter_key") || "");
  const [saved, setSaved] = useState(false);
  const [email, setEmail] = useState(() => localStorage.getItem("edith_email") || "");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState("");
  const [calendarUrl, setCalendarUrl] = useState(() => localStorage.getItem("edith_calendar_url") || CAL_URL);
  const [calConnected, setCalConnected] = useState(false);
  const [elevenKey, setElevenKey] = useState(() => localStorage.getItem("edith_elevenlabs_key") || "");
  const [backboardKey, setBackboardKey] = useState(() => localStorage.getItem("edith_backboard_key") || "");

  useEffect(() => {
    fetch(calendarUrl + "?period=today").then(r => r.json()).then(d => {
      setCalConnected(!!d.events);
    }).catch(() => {});
  }, []);

  const handleSave = () => {
    localStorage.setItem("edith_openrouter_key", apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveEmail = () => {
    localStorage.setItem("edith_email", email);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sendNow = async (period) => {
    if (!email) {
      setSendResult("Enter your email address first");
      setTimeout(() => setSendResult(""), 3000);
      return;
    }
    setSending(true);
    setSendResult("Sending...");
    const summary = generateSummary(period);
    const label = period === "today" ? "Daily" : "Weekly";
    const subject = `E.D.I.T.H. ${label} Summary - ${new Date().toLocaleDateString()}`;

    try {
      const payload = JSON.stringify({ to: email, subject, body: summary });
      const r = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "data=" + encodeURIComponent(payload),
      });
      const d = await r.json();
      if (d.success) {
        setSendResult("Email sent.");
      } else {
        setSendResult("Failed: " + (d.error || "unknown"));
      }
    } catch (e) {
      setSendResult("Send failed. Is the script deployed as Anyone?");
    }
    setSending(false);
    setTimeout(() => setSendResult(""), 5000);
  };

  return (
    <div className="p-6 lg:p-8 pb-24 lg:pb-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-semibold mb-1">Settings</h1>
          <p className="text-gray-400 text-sm">Configure E.D.I.T.H. to work the way you do.</p>
        </div>

        <GlassCard className="!p-6">
          <h2 className="font-mono text-xs tracking-[0.2em] text-gray-500 mb-4">EMAIL SUMMARIES</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <input type="email" placeholder="your@gmail.com" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors" />
              <button onClick={handleSaveEmail}
                className={`font-mono text-xs tracking-[0.2em] rounded-xl px-5 py-3 transition-all ${saved ? "bg-green-500 text-white scale-95" : "bg-white text-black hover:bg-gray-200"}`}>
                {saved ? <span className="flex items-center gap-1.5"><Check size={14} className="animate-bounce" /> SAVED</span> : "SAVE"}
              </button>
            </div>
            <div className="flex gap-3">
              <button onClick={() => sendNow("today")} disabled={sending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:border-white/20 transition-colors font-mono text-xs tracking-[0.2em]">
                <Send size={14} /> SEND DAILY
              </button>
              <button onClick={() => sendNow("week")} disabled={sending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:border-white/20 transition-colors font-mono text-xs tracking-[0.2em]">
                <Send size={14} /> SEND WEEKLY
              </button>
            </div>
            {sendResult && <p className={`text-xs font-mono ${sendResult.includes("Failed") || sendResult.includes("Could not") ? "text-red-400" : "text-green-400"}`}>{sendResult}</p>}
          </div>
          <p className="text-xs text-gray-600 mt-3 leading-relaxed">Sends a bullet-point summary of your day directly to your email via Gmail.</p>
        </GlassCard>

        <GlassCard className="!p-6">
          <h2 className="font-mono text-xs tracking-[0.2em] text-gray-500 mb-4">GOOGLE CALENDAR</h2>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-2 h-2 rounded-full ${calConnected ? "bg-green-400" : "bg-gray-600"}`} />
            <span className="text-sm text-gray-300">{calConnected ? "Connected" : "Not connected"}</span>
            <button
              onClick={async () => {
                try {
                  const r = await fetch(calendarUrl + "?period=today");
                  const d = await r.json();
                  setCalConnected(!!d.events);
                  setSendResult(d.events ? `Found ${d.events.length} events today.` : "Connected but no events.");
                  setTimeout(() => setSendResult(""), 4000);
                } catch { setCalConnected(false); setSendResult("Connection failed."); setTimeout(() => setSendResult(""), 4000); }
              }}
              className="text-xs font-mono text-gray-400 hover:text-white transition-colors">TEST</button>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">Connected via Apps Script. Say "EDITH create a meeting tomorrow at 3pm" or "what's on my calendar". Reads and writes your real Google Calendar.</p>
        </GlassCard>

        <GlassCard className="!p-6">
          <h2 className="font-mono text-xs tracking-[0.2em] text-gray-500 mb-4">OPENROUTER API KEY</h2>
          <div className="flex gap-3">
            <input type="password" placeholder="sk-or-v1-..." value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setSaved(false); }}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors" />
            <button onClick={handleSave}
              className={`font-mono text-xs tracking-[0.2em] rounded-xl px-5 py-3 transition-all ${saved ? "bg-green-500 text-white scale-95" : "bg-white text-black hover:bg-gray-200"}`}>
              {saved ? <span className="flex items-center gap-1.5"><Check size={14} className="animate-bounce" /> SAVED</span> : "SAVE"}
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-3 leading-relaxed">Uses Gemini 2.5 Flash via OpenRouter. Key stored in your browser only.</p>
        </GlassCard>

        <GlassCard className="!p-6">
          <h2 className="font-mono text-xs tracking-[0.2em] text-gray-500 mb-4">BACKBOARD.IO API KEY</h2>
          <div className="flex gap-3">
            <input type="password" placeholder="bb-..." value={backboardKey}
              onChange={(e) => { setBackboardKey(e.target.value); setSaved(false); }}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors" />
            <button onClick={() => { localStorage.setItem("edith_backboard_key", backboardKey); setSaved(true); setTimeout(() => setSaved(false), 2000); }}
              className={`font-mono text-xs tracking-[0.2em] rounded-xl px-5 py-3 transition-all ${saved ? "bg-green-500 text-white scale-95" : "bg-white text-black hover:bg-gray-200"}`}>
              {saved ? <span className="flex items-center gap-1.5"><Check size={14} className="animate-bounce" /> SAVED</span> : "SAVE"}
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-3 leading-relaxed">AI via Backboard.io — wraps OpenRouter with threading, memory, and tool calling. If set, used as primary AI provider.</p>
        </GlassCard>

        <GlassCard className="!p-6">
          <h2 className="font-mono text-xs tracking-[0.2em] text-gray-500 mb-4">LANGSEARCH API KEY</h2>
          <div className="flex gap-3">
            <input type="password" placeholder="sk-..." defaultValue="sk-8fa9940842a54134a5b95332184b4548" disabled
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-500 placeholder-gray-600 focus:outline-none transition-colors cursor-not-allowed" />
          </div>
          <p className="text-xs text-gray-600 mt-3 leading-relaxed">Powers web search capability. Built-in key provided.</p>
        </GlassCard>

        <GlassCard className="!p-6">
          <h2 className="font-mono text-xs tracking-[0.2em] text-gray-500 mb-4">DATA</h2>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <HardDrive size={16} className="text-gray-400" />
              <div><p className="text-sm">Stored faces</p><p className="text-xs text-gray-500">Face descriptors in localStorage</p></div>
            </div>
            <button onClick={() => { localStorage.removeItem("edith_known_faces"); window.location.reload(); }}
              className="text-xs text-red-400/60 hover:text-red-400 transition-colors font-mono">CLEAR</button>
          </div>
          <div className="flex items-center justify-between py-2 mt-2">
            <div className="flex items-center gap-3">
              <Shield size={16} className="text-gray-400" />
              <div><p className="text-sm">Memory data</p><p className="text-xs text-gray-500">Conversations and facts</p></div>
            </div>
            <button onClick={() => { localStorage.removeItem("edith_memories"); window.location.reload(); }}
              className="text-xs text-red-400/60 hover:text-red-400 transition-colors font-mono">CLEAR</button>
          </div>
          <div className="flex items-center justify-between py-2 mt-2">
            <div className="flex items-center gap-3">
              <Trash2 size={16} className="text-red-400/60" />
              <div><p className="text-sm text-red-400/80">Reset all data</p><p className="text-xs text-gray-500">Clear everything</p></div>
            </div>
            <button onClick={() => { localStorage.clear(); window.location.reload(); }}
              className="text-xs text-red-400 hover:text-red-300 transition-colors font-mono">RESET ALL</button>
          </div>
        </GlassCard>

        <div className="pt-4">
          <p className="text-[10px] font-mono tracking-[0.2em] text-gray-600 text-center">
            Powered by Vercel, Backboard.io, Omi, ElevenLabs, LangSearch, OpenRouter, Google Apps Script
          </p>
        </div>

      </div>
    </div>
  );
}
