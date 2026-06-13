const STORE_KEY = "edith_reminders";

let timeouts = {};

export function loadReminders() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
  } catch { return []; }
}

function saveReminders(list) {
  localStorage.setItem(STORE_KEY, JSON.stringify(list));
}

export function addReminder({ text, triggerAt, email }) {
  const reminders = loadReminders();
  const entry = { id: Date.now(), text, triggerAt, email, done: false };
  reminders.push(entry);
  saveReminders(reminders);
  scheduleReminder(entry, email);
  return entry;
}

export function scheduleReminder(r, email) {
  const now = Date.now();
  const delay = r.triggerAt - now;
  if (delay <= 0) return;

  const id = setTimeout(() => {
    triggerReminder(r, email);
    markDone(r.id);
  }, delay);

  timeouts[r.id] = id;
}

function triggerReminder(r, email) {
  const body = `Reminder: ${r.text}`;

  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("E.D.I.T.H. Reminder", { body, icon: "/vite.svg" });
  }

  const scriptUrl = "https://script.google.com/macros/s/AKfycbwd7Vdgyo7Ij01MNIr7qq2jHG0jdljrK-bazktTf6-y6E0RJ8LhVT7z9NNTHFmWnSPk_Q/exec";
  if (email) {
    fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "data=" + encodeURIComponent(JSON.stringify({ to: email, subject: "E.D.I.T.H. Reminder", body })),
    }).catch(() => {});
  }
}

function markDone(id) {
  const reminders = loadReminders();
  const idx = reminders.findIndex(r => r.id === id);
  if (idx >= 0) reminders[idx].done = true;
  saveReminders(reminders);
  delete timeouts[id];
}

export function parseReminder(text) {
  const t = text.toLowerCase();

  // "remind me to call mom at 3pm"
  let match = t.match(/remind\s+(?:me\s+)?(?:to\s+)?(.+?)\s+(?:at|in)\s+(.+)/i);
  if (!match) {
    // "remind me in 30 minutes to call mom"
    match = t.match(/remind\s+(?:me\s+)?(?:in\s+)?(.+?)\s+(?:at|in)\s+(.+)/i);
  }
  if (!match) return null;

  const task = match[1].trim();
  const timeStr = match[2].trim().toLowerCase();
  const triggerAt = parseTime(timeStr);
  if (!triggerAt || triggerAt <= Date.now()) return null;

  return { task, triggerAt };
}

function parseTime(str) {
  const now = new Date();

  // "in 30 minutes" / "in 5 mins"
  let m = str.match(/in\s+(\d+)\s*(minute|min|mins|m)/i);
  if (m) return now.getTime() + parseInt(m[1]) * 60000;

  // "in 2 hours"
  m = str.match(/in\s+(\d+)\s*(hour|hr|hrs|h)/i);
  if (m) return now.getTime() + parseInt(m[1]) * 3600000;

  // "in 1 hour 30 minutes"
  m = str.match(/in\s+(\d+)\s*h(?:our)?\s*(?:and\s*)?(\d+)?\s*(?:min)?/i);
  if (m) {
    const h = parseInt(m[1]) * 3600000;
    const mins = m[2] ? parseInt(m[2]) * 60000 : 0;
    return now.getTime() + h + mins;
  }

  // "at 3pm" / "at 3:30pm" / "at 15:00"
  m = str.match(/at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (m) {
    let hour = parseInt(m[1]);
    const minute = m[2] ? parseInt(m[2]) : 0;
    const period = m[3] ? m[3].toLowerCase() : null;
    if (period === "pm" && hour < 12) hour += 12;
    if (period === "am" && hour === 12) hour = 0;
    const d = new Date();
    d.setHours(hour, minute, 0, 0);
    if (d.getTime() <= now.getTime()) d.setDate(d.getDate() + 1);
    return d.getTime();
  }

  // "tomorrow at 8am"
  m = str.match(/tomorrow\s+(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (m) {
    let hour = parseInt(m[1]);
    const minute = m[2] ? parseInt(m[2]) : 0;
    const period = m[3] ? m[3].toLowerCase() : null;
    if (period === "pm" && hour < 12) hour += 12;
    if (period === "am" && hour === 12) hour = 0;
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(hour, minute, 0, 0);
    return d.getTime();
  }

  return null;
}

// Request notification permission on first reminder
export function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}
