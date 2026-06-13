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

export function getGroupedMemories() {
  const memories = loadMemories();
  const groups = [];

  memories.reverse().forEach(m => {
    const d = new Date(m.timestamp);
    const day = d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

    let group = groups.find(g => g.label === day);
    if (!group) {
      group = { label: day, timestamp: m.timestamp, items: [], faces: [], topics: new Set() };
      groups.push(group);
    }
    group.items.push(m);
    (m.faces || []).forEach(f => { if (!group.faces.includes(f)) group.faces.push(f); });
    if (m.type === "conversation" && m.text) {
      const topic = m.text.slice(0, 60);
      group.topics.add(topic);
    }
  });

  return groups.map(g => ({
    ...g,
    topics: [...g.topics],
    summary: `${g.items.length} interactions${g.faces.length ? " with " + g.faces.join(", ") : ""}`,
  }));
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
    return `[${date} ${time}] User: "${m.text}" -> E.D.I.T.H.: "${m.aiResponse}"${faces}`;
  }).join("\n") + "\n\nUse these memories to answer contextually. Reference past conversations naturally.";
}

export function getSuggestedNudge() {
  const memories = loadMemories();
  if (!memories.length) return null;

  const now = new Date();
  const hour = now.getHours();
  const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0);

  // Find patterns: similar queries at similar times on other days
  const sameHourConv = memories.filter(m => {
    const d = new Date(m.timestamp);
    return m.type === "conversation" && d.getHours() === hour && d.getTime() < dayStart.getTime();
  });

  if (sameHourConv.length >= 2) {
    const mostRecent = sameHourConv[sameHourConv.length - 1];
    return `You often ask about ${mostRecent.text.slice(0, 60)} around this time. Need anything?`;
  }

  return null;
}

export function generateSummary(period) {
  const memories = loadMemories();
  const now = Date.now();
  let start;

  if (period === "today") {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    start = d.getTime();
  } else if (period === "week") {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    d.setHours(0, 0, 0, 0);
    start = d.getTime();
  } else {
    start = 0;
  }

  const relevant = memories.filter(m => m.timestamp >= start).reverse();

  if (!relevant.length) return "No activity today.";

  const label = period === "today" ? "Daily" : "Weekly";
  const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const convos = relevant.filter(m => m.type === "conversation");
  const obs = relevant.filter(m => m.type === "observation");
  const faces = [...new Set(relevant.flatMap(m => m.faces || []))];

  // Build one-sentence summary
  let line = `Today you had ${convos.length} conversation${convos.length !== 1 ? "s" : ""} with E.D.I.T.H.`;
  if (obs.length) line += ` and did ${obs.length} action${obs.length !== 1 ? "s" : ""} (photos, videos, etc).`;
  else line += ".";
  if (faces.length) line += ` People you saw: ${faces.join(", ")}.`;

  // Pick 2-4 highlight topics
  const topics = [...new Set(convos.map(m => m.text))];
  const highlights = [];

  if (topics.length) highlights.push(`- Talked about ${topics[0]}`);
  if (topics.length > 1) highlights.push(`- Also discussed ${topics[1]}`);

  // Add notable actions
  const tookPhotos = obs.filter(m => /photo|picture|snap/i.test(m.text));
  const namedFaces = obs.filter(m => /face|name/i.test(m.text));
  const recorded = obs.filter(m => /video|record/i.test(m.text));

  if (tookPhotos.length) highlights.push(`- Took ${tookPhotos.length} photo${tookPhotos.length > 1 ? "s" : ""}`);
  if (namedFaces.length) highlights.push(`- Met someone new: ${namedFaces.map(m => m.aiResponse).join(", ")}`);

  // Cap at 4
  const display = highlights.slice(0, 4);

  return `E.D.I.T.H. ${label} - ${dateStr}\n\n${line}\n\n${display.join("\n")}`;
}
