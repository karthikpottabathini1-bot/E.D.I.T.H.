import { useState, useEffect } from "react";
import { Search, Brain, ChevronDown, X, User, MessageSquare, Image, Calendar } from "lucide-react";
import GlassCard from "../components/GlassCard";
import { getGroupedMemories } from "../utils/memoryStore";

export default function Memory() {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [groups, setGroups] = useState([]);

  useEffect(() => { setGroups(getGroupedMemories()); }, []);

  const filtered = search
    ? groups.filter(g => {
        const haystack = g.label + " " + g.items.map(i => i.text + " " + i.aiResponse).join(" ");
        return haystack.toLowerCase().includes(search.toLowerCase());
      })
    : groups;

  return (
    <div className="p-6 lg:p-8 pb-24 lg:pb-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-semibold mb-1">Memory</h1>
            <p className="text-gray-400 text-sm">{groups.reduce((s, g) => s + g.items.length, 0)} total interactions across {groups.length} sessions.</p>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search memories..." className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-8 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors w-56" />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"><X size={14} /></button>}
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Brain size={32} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">{search ? "Nothing matches your search." : "No memories yet. Start talking to E.D.I.T.H."}</p>
          </div>
        )}

        <div className="space-y-4">
          {filtered.map((group, gi) => (
            <GlassCard key={gi} className={`!p-0 overflow-hidden ${expanded === gi ? "border-white/20" : ""}`}>
              <button className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-white/[0.02] transition-colors"
                onClick={() => setExpanded(expanded === gi ? null : gi)}>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <Calendar size={18} className="text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-sm font-semibold">{group.label}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {group.summary}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-gray-600">{group.items.length}</span>
                  <ChevronDown size={14} className={`text-gray-500 transition-transform ${expanded === gi ? "rotate-180" : ""}`} />
                </div>
              </button>

              {expanded === gi && (
                <div className="border-t border-white/5">
                  {group.topics.length > 0 && (
                    <div className="px-5 py-3 border-b border-white/5">
                      <p className="text-[10px] font-mono tracking-[0.2em] text-gray-600 mb-2">TOPICS</p>
                      <div className="flex flex-wrap gap-1.5">
                        {group.topics.map((t, i) => (
                          <span key={i} className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-gray-400 border border-white/5">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {group.faces.length > 0 && (
                    <div className="px-5 py-2 border-b border-white/5 flex items-center gap-2">
                      <User size={12} className="text-gray-500" />
                      <p className="text-xs text-gray-500">People seen: {group.faces.join(", ")}</p>
                    </div>
                  )}
                  <div className="divide-y divide-white/[0.03]">
                    {group.items.map((m, i) => (
                      <div key={i} className="px-5 py-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {m.type === "conversation" ? <MessageSquare size={12} className="text-gray-600" /> : <Image size={12} className="text-gray-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-400">{m.text}</p>
                            {m.aiResponse && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-1">{m.aiResponse}</p>
                            )}
                            <p className="text-[10px] font-mono text-gray-600 mt-1">
                              {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
