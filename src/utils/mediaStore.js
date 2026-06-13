const STORE_KEY = "edith_media";

let sessionMedia = [];

export function loadMedia() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveMeta(entries) {
  const trimmed = entries.slice(-500);
  localStorage.setItem(STORE_KEY, JSON.stringify(trimmed));
}

export function addMedia({ type, dataUrl, fileName, tags }) {
  const entries = loadMedia();
  const entry = {
    id: "media_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
    timestamp: Date.now(),
    type, dataUrl, fileName, tags: tags || [],
  };
  entries.push(entry);
  sessionMedia.unshift(entry);
  saveMeta(entries);
  return entry;
}

export function getSessionMedia() {
  return sessionMedia;
}

export function getStoredMedia() {
  const entries = loadMedia();
  return entries.reverse();
}

export function deleteMedia(id) {
  const entries = loadMedia().filter(e => e.id !== id);
  localStorage.setItem(STORE_KEY, JSON.stringify(entries));
  sessionMedia = sessionMedia.filter(e => e.id !== id);
}

export function clearAllMedia() {
  localStorage.removeItem(STORE_KEY);
  sessionMedia = [];
}
