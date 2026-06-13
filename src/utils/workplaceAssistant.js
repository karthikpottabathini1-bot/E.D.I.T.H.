// Workplace assistant - tracks work sessions, focus, and provides proactive help

const STORE_KEY = "edith_work_sessions";
let sessionStart = null;
let lastObserved = 0;
let faceVisibleHistory = [];
let expressionHistory = [];
let distractionCount = 0;
let _milestoneSent = {};

export function startWorkSession() {
  if (sessionStart) return;
  sessionStart = Date.now();
  saveSession({ start: sessionStart });
}

export function endWorkSession() {
  if (!sessionStart) return 0;
  const duration = Date.now() - sessionStart;
  const session = { start: sessionStart, end: Date.now(), duration };
  saveSession(session);
  sessionStart = null;
  return duration;
}

function saveSession(session) {
  try {
    const sessions = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
    sessions.push(session);
    localStorage.setItem(STORE_KEY, JSON.stringify(sessions.slice(-50)));
  } catch {}
}

export function getSessions() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || "[]"); } catch { return []; }
}

export function getSessionDuration() {
  if (!sessionStart) return 0;
  return Date.now() - sessionStart;
}

export function getTodayWorkMinutes() {
  const sessions = getSessions();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let total = 0;
  sessions.forEach(s => {
    if (s.start >= today.getTime()) {
      total += s.duration || (Date.now() - s.start);
    }
  });
  if (sessionStart && sessionStart >= today.getTime()) {
    total += Date.now() - sessionStart;
  }
  return Math.round(total / 60000);
}

export function observeFace(visible, expressions, objects) {
  const now = Date.now();
  
  faceVisibleHistory.push(visible);
  if (faceVisibleHistory.length > 30) faceVisibleHistory.shift();

  if (expressions) {
    expressionHistory.push({ time: now, expressions });
    if (expressionHistory.length > 30) expressionHistory.shift();
  }

  // Start/end session based on face visibility
  // If face visible for 3+ seconds, consider it a work session
  if (visible && faceVisibleHistory.filter(Boolean).length >= 2) {
    if (!sessionStart) startWorkSession();
  }

  return now;
}

export function getWorkplaceObservation(camReady, faces, expressions, objects) {
  const now = Date.now();
  
  // Don't observe more than once per 5 minutes
  if (now - lastObserved < 300000) return null;
  lastObserved = now;

  if (!camReady) return null;

  // Face not visible = user stepped away
  const recentVisible = faceVisibleHistory.slice(-5);
  const visibleCount = recentVisible.filter(Boolean).length;

  const duration = getSessionDuration();
  const hours = Math.floor(duration / 3600000);
  const mins = Math.floor((duration % 3600000) / 60000);

  const observations = [];

  // Work session milestone (only fire once per hour)
  if (hours >= 1 && !_milestoneSent[hours]) {
    _milestoneSent[hours] = true;
    observations.push(`You've been working for ${hours} hour${hours > 1 ? "s" : ""}. How are you feeling?`);
  }

  // Distraction detection: phone visible while working
  if (objects && objects.includes("cell phone") && duration > 1800000) {
    distractionCount++;
    if (distractionCount >= 3) {
      observations.push("I've noticed your phone is often visible during work. Want to try a focus session?");
      distractionCount = 0;
    }
  }

  // Fatigue detection: sad/tired expression history
  if (expressionHistory.length >= 5 && duration > 3600000) {
    const recentMoods = expressionHistory.slice(-5).map(e => {
      if (!e.expressions) return "neutral";
      const top = Object.entries(e.expressions).sort((a, b) => b[1] - a[1])[0];
      return top ? top[0] : "neutral";
    });
    const tired = recentMoods.filter(m => m === "sad" || m === "angry" || m === "disgusted").length;
    const happy = recentMoods.filter(m => m === "happy").length;
    
    if (tired >= 3) {
      observations.push("You seem a bit stressed. Maybe take a 5 minute break?");
    } else if (happy === 0 && tired === 0) {
      // all neutral - deep focus
    }
  }

  // User came back after being away
  if (visibleCount === 1 && recentVisible.length === 5 && !recentVisible[0] && !recentVisible[1]) {
    observations.push("Welcome back. You were away for a few minutes.");
  }

  if (observations.length === 0) return null;
  return observations[0]; // Return most important observation
}

export function getWorkContext() {
  const mins = getTodayWorkMinutes();
  const hours = Math.floor(mins / 60);
  const remaining = mins % 60;
  
  let ctx = `Work session: ${hours}h ${remaining}m today. `;
  
  if (mins > 120) ctx += "The user has been working for a while. Be supportive and offer check-ins. ";
  if (expressionHistory.length) {
    const recent = expressionHistory.slice(-3);
    const moods = recent.map(e => {
      if (!e.expressions) return "neutral";
      const top = Object.entries(e.expressions).sort((a, b) => b[1] - a[1])[0];
      return top ? top[0] : "neutral";
    });
    const unique = [...new Set(moods)];
    if (unique.length === 1 && unique[0] !== "neutral") {
      ctx += `Recent mood: ${unique[0]}. `;
    }
  }
  
  return ctx;
}
