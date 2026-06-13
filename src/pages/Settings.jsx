import { useState } from "react";
import { HardDrive, Shield, Trash2, Check } from "lucide-react";
import GlassCard from "../components/GlassCard";

export default function Settings() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("edith_openrouter_key") || "");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem("edith_openrouter_key", apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 lg:p-8 pb-24 lg:pb-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-semibold mb-1">Settings</h1>
          <p className="text-gray-400 text-sm">Configure E.D.I.T.H. to work the way you do.</p>
        </div>

        <GlassCard className="!p-6">
          <h2 className="font-mono text-xs tracking-[0.2em] text-gray-500 mb-4">OPENROUTER API KEY</h2>
          <div className="flex gap-3">
            <input
              type="password"
              placeholder="sk-or-v1-..."
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setSaved(false); }}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors"
            />
            <button
              onClick={handleSave}
              className={`font-mono text-xs tracking-[0.2em] rounded-xl px-5 py-3 transition-all ${
                saved
                  ? "bg-green-500 text-white scale-95"
                  : "bg-white text-black hover:bg-gray-200"
              }`}>
              {saved ? (
                <span className="flex items-center gap-1.5">
                  <Check size={14} className="animate-bounce" /> SAVED
                </span>
              ) : "SAVE"}
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-3 leading-relaxed">
            Uses Gemini 2.5 Flash via OpenRouter. Key stored in your browser only. Never sent to our servers.
          </p>
        </GlassCard>

        <GlassCard className="!p-6">
          <h2 className="font-mono text-xs tracking-[0.2em] text-gray-500 mb-4">LANGSEARCH API KEY</h2>
          <div className="flex gap-3">
            <input
              type="password"
              placeholder="sk-..."
              defaultValue="sk-8fa9940842a54134a5b95332184b4548"
              disabled
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-500 placeholder-gray-600 focus:outline-none transition-colors cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-gray-600 mt-3 leading-relaxed">
            Powers web search capability. Built-in key provided.
          </p>
        </GlassCard>

        <GlassCard className="!p-6">
          <h2 className="font-mono text-xs tracking-[0.2em] text-gray-500 mb-4">FACE RECOGNITION DATA</h2>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <HardDrive size={16} className="text-gray-400" />
              <div>
                <p className="text-sm">Stored faces</p>
                <p className="text-xs text-gray-500">Face descriptors saved in browser localStorage</p>
              </div>
            </div>
            <button
              onClick={() => { localStorage.removeItem("edith_known_faces"); window.location.reload(); }}
              className="text-xs text-red-400/60 hover:text-red-400 transition-colors font-mono">
              CLEAR
            </button>
          </div>
          <div className="flex items-center justify-between py-2 mt-2">
            <div className="flex items-center gap-3">
              <Shield size={16} className="text-gray-400" />
              <div>
                <p className="text-sm">Memory data</p>
                <p className="text-xs text-gray-500">Conversations and facts saved in browser</p>
              </div>
            </div>
            <button
              onClick={() => { localStorage.removeItem("edith_memories"); window.location.reload(); }}
              className="text-xs text-red-400/60 hover:text-red-400 transition-colors font-mono">
              CLEAR
            </button>
          </div>
          <div className="flex items-center justify-between py-2 mt-2">
            <div className="flex items-center gap-3">
              <Trash2 size={16} className="text-red-400/60" />
              <div>
                <p className="text-sm text-red-400/80">Reset all data</p>
                <p className="text-xs text-gray-500">Clear faces, memories, and settings</p>
              </div>
            </div>
            <button
              onClick={() => { localStorage.clear(); window.location.reload(); }}
              className="text-xs text-red-400 hover:text-red-300 transition-colors font-mono">
              RESET ALL
            </button>
          </div>
        </GlassCard>

      </div>
    </div>
  );
}
