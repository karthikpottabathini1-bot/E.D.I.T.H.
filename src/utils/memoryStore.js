const STORE_KEY = "edith_memories";

export function loadMemories() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveMemories(memories) {
  try {
    const trimmed = memories.slice(-2000);
    localStorage.setItem(STORE_KEY, JSON.stringify(trimmed));
  } catch {}
}

export function addMemory({ type, text, aiResponse, faces, tags }) {
  const memories = loadMemories();
  const entry = {
    id: "m_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
    timestamp: Date.now(),
    type: type || "conversation",
    text: text || "",
    aiResponse: aiResponse || "",
    faces: faces || [],
    tags: tags || [],
  };
  memories.push(entry);
  saveMemories(memories);
}

export function searchMemories(query) {
  if (!query) return [];
  const memories = loadMemories();
  const q = query.toLowerCase();
  const words = q.split(/\s+/).filter(w => w.length > 2);

  return memories
    .filter(m => {
      if (!words.length) return false;
      const haystack = (m.text + " " + m.aiResponse + " " + (m.tags || []).join(" ")).toLowerCase();
      return words.some(w => haystack.includes(w));
    })
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);
}

export function getRecentMemories(count = 20) {
  const memories = loadMemories();
  return memories.slice(-count).reverse();
}

export function getTodayMemories() {
  const memories = loadMemories();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const t = today.getTime();
  return memories.filter(m => m.timestamp >= t).reverse();
}

export function getMemoriesForDate(date) {
  const memories = loadMemories();
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const start = d.getTime();
  const end = start + 86400000;
  return memories.filter(m => m.timestamp >= start && m.timestamp < end).reverse();
}

export function formatMemoriesForAI(query) {
  const results = searchMemories(query);
  if (!results.length) return "";

  return "RELEVANT MEMORIES:\n" + results.map(m => {
    const d = new Date(m.timestamp);
    const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const date = d.toLocaleDateString();
    const faces = m.faces && m.faces.length ? ` (faces: ${m.faces.join(", ")})` : "";
    return `[${date} ${time}] User: "${m.text}" → E.D.I.T.H.: "${m.aiResponse}"${faces}`;
  }).join("\n") + "\n\nUse these memories to answer contextually. Reference past conversations naturally.";
}
