import { useState, useEffect } from "react";
import { Search, Brain, ChevronDown, X, User, MessageSquare } from "lucide-react";
import GlassCard from "../components/GlassCard";
import { getRecentMemories, searchMemories, getMemoriesForDate } from "../utils/memoryStore";
import { getKnownFaces } from "../utils/faceRecognition";

function timeAgo(ts) {
  const now = Date.now();
  const diff = now - ts;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return Math.floor(diff / 60000) + "m ago";
  if (diff < 86400000) return Math.floor(diff / 3600000) + "h ago";
  return new Date(ts).toLocaleDateString();
}

export default function Memory() {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [memories, setMemories] = useState([]);
  const [knownFaces, setKnownFaces] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (search) {
      setMemories(searchMemories(search));
    } else {
      setMemories(getRecentMemories(50));
    }
  }, [search]);

  useEffect(() => {
    setKnownFaces(getKnownFaces());
  }, []);

  const filtered = filter === "all" ? memories : memories.filter(m => {
    if (filter === "faces" && m.faces && m.faces.length > 0) return true;
    if (filter === "conversations") return m.type === "conversation";
    return true;
  });

  const tags = [
    { id: "all", label: "All", icon: Brain },
    { id: "conversations", label: "Conversations", icon: MessageSquare },
    { id: "faces", label: "Face encounters", icon: User },
  ];

  return (
    <div className="p-6 lg:p-8 pb-24 lg:pb-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-semibold mb-1">Memory</h1>
            <p className="text-gray-400 text-sm">{memories.length} entries logged across {knownFaces.length} known faces.</p>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search memories..." className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-8 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors w-56" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                <X size={14} /></button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {tags.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setFilter(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${filter === id ? "bg-white/10 text-white border border-white/10" : "text-gray-500 hover:text-gray-300 border border-transparent"}`}>
              <Icon size={14} />{label}</button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Brain size={32} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">{search ? "No memories match your search." : "No memories yet. Start talking to E.D.I.T.H."}</p>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map(m => (
            <GlassCard key={m.id}
              className={`!p-5 cursor-pointer transition-colors ${expanded === m.id ? "border-white/20" : ""}`}
              onClick={() => setExpanded(expanded === m.id ? null : m.id)}>
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                  <Brain size={16} className="text-gray-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-medium truncate">{m.text}</h3>
                      {m.faces && m.faces.length > 0 && (
                        <p className="text-xs text-green-400/60 mt-0.5">with: {m.faces.join(", ")}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] font-mono text-gray-600">{timeAgo(m.timestamp)}</span>
                      <ChevronDown size={14} className={`text-gray-500 transition-transform ${expanded === m.id ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                  {expanded === m.id && (
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-[10px] font-mono tracking-[0.2em] text-gray-500 mb-1">E.D.I.T.H. REPLIED</p>
                        <p className="text-sm text-gray-300">{m.aiResponse}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {m.tags && m.tags.slice(0, 5).map(tag => (
                          <span key={tag} className="text-[10px] font-mono px-2 py-1 rounded-full bg-white/5 text-gray-500 border border-white/5">{tag}</span>
                        ))}
                        {m.faces && m.faces.map(f => (
                          <span key={f} className="text-[10px] font-mono px-2 py-1 rounded-full bg-green-500/10 text-green-400/70 border border-green-500/20">{f}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
