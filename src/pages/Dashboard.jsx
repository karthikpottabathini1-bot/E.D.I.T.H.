import { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic, MicOff, Camera, CameraOff, ArrowRight, ChevronDown,
  Volume2, Sparkles, Send, UserCheck, Clock, MessageCircle,
} from "lucide-react";
import CornerGlow from "../components/CornerGlow";
import GlassCard from "../components/GlassCard";
import { loadModels, detectFaces, getKnownFaces, saveKnownFaces, matchFace, renameLastNewFace } from "../utils/faceRecognition";
import { addMemory, searchMemories, formatMemoriesForAI, generateSummary, getSuggestedNudge } from "../utils/memoryStore";
import { addMedia } from "../utils/mediaStore";
import { addReminder, parseReminder, requestNotificationPermission } from "../utils/reminders";
import { startLocationTracking, formatLocationsForAI } from "../utils/locationTracker";
import { observeFace, getWorkplaceObservation, getWorkContext } from "../utils/workplaceAssistant";

const SR_W = window.SpeechRecognition || window.webkitSpeechRecognition;
const FALLBACK_KEY = import.meta.env.VITE_OPENROUTER_KEY || "";
const SCRIPT_URL = import.meta.env.VITE_EMAIL_SCRIPT_URL || "";
const CALENDAR_URL = import.meta.env.VITE_CALENDAR_SCRIPT_URL || "";
const ELEVENLABS_KEY = import.meta.env.VITE_ELEVENLABS_KEY || "";

function DeviceSelect({ devices, value, onChange, kind }) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)}
        className="appearance-none bg-white/5 border border-white/10 rounded-lg pl-3 pr-8 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-white/20 transition-colors cursor-pointer w-full">
        {devices.length === 0 && <option value="">No {kind}</option>}
        {devices.map((d, i) => (
          <option key={d.deviceId || i} value={d.deviceId} className="bg-[#1a1a1e]">
            {d.label || kind[0].toUpperCase() + kind.slice(1) + " " + (i + 1)}
          </option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
    </div>
  );
}

async function speakText(text, onEnd) {
  const ttsKey = localStorage.getItem("edith_elevenlabs_key") || ELEVENLABS_KEY;

  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 10000);
    const voiceId = localStorage.getItem("edith_elevenlabs_voice") || "JBFqnCBsd6RMkjVDRZzb";
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST", signal: ctrl.signal,
      headers: { "Content-Type": "application/json", "xi-api-key": ttsKey.trim() },
      body: JSON.stringify({ text, model_id: "eleven_turbo_v2_5", voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
    });
    if (r.ok) {
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.volume = 1.0;
      if (onEnd) audio.onended = onEnd;
      await audio.play();
      return;
    }
  } catch {}

  // Fallback to browser speech
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1.0; u.pitch = 1.05;
  const voices = window.speechSynthesis.getVoices();
  const pf = voices.find(v => v.name.includes("Samantha") || v.name.includes("Karen"))
    || voices.find(v => v.lang.startsWith("en") && v.name.includes("Female"));
  if (pf) u.voice = pf;
  if (onEnd) u.onend = onEnd;
  window.speechSynthesis.speak(u);
}

function captureFrame(el) {
  if (!el || !el.videoWidth) return null;
  try {
    const c = document.createElement("canvas");
    c.width = el.videoWidth; c.height = el.videoHeight;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(el, 0, 0);
    return { dataUrl: c.toDataURL("image/jpeg", 0.85), canvas: c };
  } catch { return null; }
}

async function takePhoto(videoEl) {
  const frame = captureFrame(videoEl);
  if (!frame) return null;
  const blob = await new Promise(resolve => frame.canvas.toBlob(resolve, "image/jpeg", 0.85));
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "edith-photo-" + Date.now() + ".jpg"; a.click();
  return { dataUrl: frame.dataUrl };
}

function startRecording(stream, chunksRef) {
  try {
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" });
    chunksRef.current = [];
    recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.start(1000);
    return recorder;
  } catch { return null; }
}

function stopRecording(recorder, chunksRef) {
  return new Promise(resolve => {
    if (!recorder || recorder.state === "inactive") { resolve(null); return; }
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "edith-video-" + Date.now() + ".webm"; a.click();
      resolve(url);
    };
    recorder.stop();
  });
}

async function searchWeb(query) {
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 4000);
    const r = await fetch("https://api.langsearch.com/v1/search", {
      method: "POST", signal: ctrl.signal,
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + (import.meta.env.VITE_LANGSEARCH_KEY || "sk-8fa9940842a54134a5b95332184b4548") },
      body: JSON.stringify({ query }),
    });
    const d = await r.json();
    const pages = d?.data?.webPages?.value;
    if (!pages || !pages.length) return "";
    return pages.slice(0, 3).map((p, i) => `[${i + 1}] ${p.name || p.title || ""}: ${p.snippet || p.description || ""}`).join("\n");
  } catch { return ""; }
}

async function fetchAI(text, key, img, faceData) {
  if (!key || !key.startsWith("sk-")) return "Invalid API key.";
  const [webResults, memoryContext] = await Promise.all([searchWeb(text), Promise.resolve(formatMemoriesForAI(text))]);
  let sysMsg = "You are E.D.I.T.H., an AI second brain and workplace assistant. Keep responses short (1-2 sentences), conversational, and helpful.";
  if (memoryContext) sysMsg += "\n\n" + memoryContext;
  sysMsg += "\n\n" + getWorkContext();
  if (img) sysMsg += " You can see the user through the camera.";
  const locContext = formatLocationsForAI();
  if (locContext) sysMsg += "\n\n" + locContext;
  if (faceData && faceData.length > 0) {
    const faceLines = faceData.map(f => {
      const t = new Date(f.firstSeen);
      const mood = f.expression ? ` (looks ${f.expression})` : "";
      if (f.known) return `- ${f.name}: met ${f.encounters} times, first met ${t.toLocaleDateString()}${mood}`;
      return `- ${f.name}: new person${mood} (say "save as [name]" to remember)`;
    }).join("\n");
    sysMsg += "\n\nPEOPLE IN VIEW:\n" + faceLines;
  }
  if (faceData && faceData.length > 0 && faceData.some(f => f.expression)) {
    sysMsg += "\n\nMoods: " + faceData.map(f => `${f.name}: ${f.expression}`).join(", ") + ".";
  }
  if (webResults) sysMsg += "\n\nWEB SEARCH:\n" + webResults;
  const calUrl = localStorage.getItem("edith_calendar_url") || CALENDAR_URL;
  if (calUrl) {
    try {
      const r = await fetch(calUrl + "?period=today");
      const d = await r.json();
      if (d.events && d.events.length) {
        sysMsg += "\n\nCALENDAR:\n" + d.events.map(e => `- ${new Date(e.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}: ${e.title}`).join("\n");
      }
    } catch {}
  }
  sysMsg += "\n\nNever use emojis. Plain text only.";

  const fullMsg = `${sysMsg}\n\nUser: ${text}`;

  // Try Backboard.io first
  const backboardKey = localStorage.getItem("edith_backboard_key");
  if (backboardKey) {
    try {
      const ctrl = new AbortController();
      setTimeout(() => ctrl.abort(), 10000);
      const threadId = localStorage.getItem("edith_backboard_thread") || "";
      const r = await fetch("https://app.backboard.io/api/threads/messages", {
        method: "POST", signal: ctrl.signal,
        headers: { "Content-Type": "application/json", "X-API-Key": backboardKey.trim() },
        body: JSON.stringify({ content: fullMsg, llm_provider: "openrouter", model_name: "google/gemini-2.5-flash", stream: false, ...(threadId ? { thread_id: threadId } : {}) }),
      });
      const d = await r.json();
      if (d.content) {
        if (d.thread_id) localStorage.setItem("edith_backboard_thread", d.thread_id);
        return d.content;
      }
    } catch {}
  }

  // Fallback to OpenRouter
  const userContent = img ? [{ type: "image_url", image_url: { url: img } }, { type: "text", text }] : text;
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 10000);
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST", signal: ctrl.signal,
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + key.trim(), "HTTP-Referer": window.location.origin, "X-Title": "E.D.I.T.H." },
      body: JSON.stringify({ model: "google/gemini-2.5-flash", messages: [{ role: "system", content: sysMsg }, { role: "user", content: userContent }], max_tokens: 300, temperature: 0.7 }),
    });
    const d = await r.json();
    if (d.error) return "API error: " + (d.error.message || d.error.code);
    return d.choices?.[0]?.message?.content || "(empty)";
  } catch (e) {
    if (e.name === "AbortError") return "Timed out.";
    return "Network error.";
  }
}

export default function Dashboard() {
  const [listening, setListening] = useState(false);
  const [watching, setWatching] = useState(() => localStorage.getItem("edith_cam_on") === "true");
  const [camReady, setCamReady] = useState(false);
  const [micDevices, setMicDevices] = useState([]);
  const [camDevices, setCamDevices] = useState([]);
  const [selectedMic, setSelectedMic] = useState("");
  const [selectedCam, setSelectedCam] = useState("");
  const [messages, setMessages] = useState([]);
  const [thinking, setThinking] = useState(false);
  const [partial, setPartial] = useState("");
  const [err, setErr] = useState("");
  const [inputText, setInputText] = useState("");
  const [recording, setRecording] = useState(false);
  const [faceCount, setFaceCount] = useState(0);
  const [detectedFaces, setDetectedFaces] = useState([]);
  const [modelsReady, setModelsReady] = useState(false);
  const [micPref, setMicPref] = useState(() => localStorage.getItem("edith_mic_on") === "true");
  const [micInitialized, setMicInitialized] = useState(false);

  const videoRef = useRef(null);
  const camStreamRef = useRef(null);
  const recRef = useRef(null);
  const faceIntervalRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const facesRef = useRef([]);
  const messagesEndRef = useRef(null);
  const restartAbortRef = useRef(false);
  const listeningRef = useRef(false);

  const apikey = (localStorage.getItem("edith_openrouter_key") || "").trim() || FALLBACK_KEY;
  listeningRef.current = listening;

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, partial]);
  useEffect(() => { localStorage.setItem("edith_cam_on", watching ? "true" : "false"); }, [watching]);
  useEffect(() => { localStorage.setItem("edith_mic_on", listening ? "true" : "false"); }, [listening]);

  useEffect(() => {
    if (micPref && !micInitialized && SR_W && selectedMic) {
      setMicInitialized(true);
      setTimeout(() => toggleMic(), 500);
    }
  }, [micPref, micInitialized, selectedMic]);

  useEffect(() => { loadModels().then(() => setModelsReady(true)).catch(() => {}); window.speechSynthesis.getVoices(); startLocationTracking(); requestNotificationPermission(); }, []);

  useEffect(() => {
    (async () => {
      let m = [], c = [];
      try { await navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(s => { s.getTracks().forEach(t => t.stop()); }); } catch {}
      try { const all = await navigator.mediaDevices.enumerateDevices(); m = all.filter(d => d.kind === "audioinput"); c = all.filter(d => d.kind === "videoinput"); } catch {}
      if (m.length === 0) m = [{ deviceId: "default", label: "Microphone", kind: "audioinput" }];
      if (c.length === 0) c = [{ deviceId: "default", label: "Camera", kind: "videoinput" }];
      setMicDevices(m); setCamDevices(c); setSelectedMic(m[0].deviceId); setSelectedCam(c[0].deviceId);
    })();
  }, []);

  useEffect(() => {
    if (!watching || !selectedCam) {
      if (camStreamRef.current) { camStreamRef.current.getTracks().forEach(t => t.stop()); camStreamRef.current = null; }
      setCamReady(false); if (faceIntervalRef.current) { clearInterval(faceIntervalRef.current); faceIntervalRef.current = null; } return;
    }
    let done = false;
    (async () => {
      let s = null;
      if (selectedCam && selectedCam !== "default") { try { s = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: selectedCam } } }); } catch {} }
      if (!s) { try { s = await navigator.mediaDevices.getUserMedia({ video: true }); } catch {} }
      if (!s) { if (!done) setWatching(false); return; }
      if (done) { s.getTracks().forEach(t => t.stop()); return; }
      camStreamRef.current = s;
      const el = videoRef.current;
      if (el) { el.srcObject = s; try { await el.play(); } catch {} }
      if (!done) setCamReady(true);
    })();
    return () => { done = true; if (camStreamRef.current) { camStreamRef.current.getTracks().forEach(t => t.stop()); camStreamRef.current = null; } setCamReady(false); };
  }, [watching, selectedCam]);

  useEffect(() => {
    if (!camReady || !modelsReady || !watching) return;
    const run = async () => {
      try {
        const detections = await detectFaces(videoRef.current);
        if (detections.length > 0) {
          const knownFaces = getKnownFaces();
          const inView = [];
          let updated = false;
          detections.forEach(d => {
            const match = matchFace(d.descriptor, knownFaces, 0.55);
            const idx = match && match.label !== "unknown" ? knownFaces.findIndex(f => f.name === match.label) : -1;
            const expr = d.expressions ? Object.entries(d.expressions).sort((a, b) => b[1] - a[1])[0] : null;
            if (idx >= 0) {
              knownFaces[idx].lastSeen = Date.now(); knownFaces[idx].encounterCount = (knownFaces[idx].encounterCount || 0) + 1; updated = true;
              inView.push({ name: knownFaces[idx].name, known: true, encounters: knownFaces[idx].encounterCount, firstSeen: knownFaces[idx].firstSeen, photo: knownFaces[idx].photo, expression: expr ? expr[0] : "neutral" });
            } else {
              const n = "Person " + (knownFaces.length + 1);
              knownFaces.push({ name: n, firstSeen: Date.now(), lastSeen: Date.now(), encounterCount: 1, photo: null, descriptor: d.descriptor }); updated = true;
              inView.push({ name: n, known: false, encounters: 1, firstSeen: Date.now(), photo: null, expression: expr ? expr[0] : "neutral" });
            }
          });
          if (updated) saveKnownFaces(knownFaces);
          facesRef.current = inView; setFaceCount(knownFaces.length); setDetectedFaces(detections);
          observeFace(true, detections.length > 0 ? detections[0].expressions : null, null);
        } else { facesRef.current = []; setDetectedFaces([]); observeFace(false, null, null); }
      } catch {}
    };
    faceIntervalRef.current = setInterval(run, 3000); run();
    return () => { if (faceIntervalRef.current) { clearInterval(faceIntervalRef.current); faceIntervalRef.current = null; } };
  }, [camReady, modelsReady, watching]);

  const doReply = useCallback(async (text) => {
    const t = text.toLowerCase();
    // Wake word: matches "edith", "eat it", "e.d.i.t.h", "edit", etc.
    const hasWake = /\b(?:e[\s.]*d[\s.]*i[\s.]*t[\s.]*(?:h|f|s)?)\b/i.test(t)
      || /\b(?:eat\s*it|each\s*it|e\s*dith)\b/i.test(t)
      || /\b(?:he\s*did|he\s*dish)\b/i.test(t)
      || /e\s*\.?\s*d\s*\.?\s*i\s*\.?\s*t\s*\.?\s*h\s*\.?/i.test(t);
    if (!hasWake) return;
    const cleaned = text
      .replace(/.*?\b(?:e[\s.]*d[\s.]*i[\s.]*t[\s.]*(?:h|f|s)?)\b\s*/i, "")
      .replace(/.*?\b(?:eat\s*it|each\s*it|e\s*dith)\b\s*/i, "")
      .replace(/.*?\b(?:he\s*did|he\s*dish)\b\s*/i, "")
      .replace(/.*?e\s*\.?\s*d\s*\.?\s*i\s*\.?\s*t\s*\.?\s*h\s*\.?\s*/i, "")
      .trim();
    if (!cleaned) return;

    const nameMatch = t.match(/(?:save|remember|call|name)\s+(?:his|her|their|this|that|the)\s+(?:face|person|guy|man|woman|lady|dude)?\s*(?:as\s+)?([a-z]+(?:\s+[a-z]+)?)/i) || t.match(/(?:this|that)\s+is\s+([a-z]+(?:\s+[a-z]+)?)/i) || t.match(/(?:his|her|their)\s+name\s+is\s+([a-z]+(?:\s+[a-z]+)?)/i);
    if (nameMatch && nameMatch[1] && nameMatch[1].length > 1 && camReady) {
      const name = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1).toLowerCase();
      const frame = captureFrame(videoRef.current);
      const result = renameLastNewFace(name, frame ? frame.dataUrl : null);
      if (result) { setMessages(p => [...p, { role: "edith", text: "Got it. I'll remember " + result.name + " from now on." }]); addMemory({ type: "observation", text: "Named face: " + name, aiResponse: "Face saved as " + name, faces: [name], tags: ["face", "saved"] }); speakText("Got it. I'll remember " + name + "."); }
      return;
    }

    const reminder = parseReminder(cleaned);
    if (reminder) {
      addReminder({ text: reminder.task, triggerAt: reminder.triggerAt, email: localStorage.getItem("edith_email") || "" });
      const time = new Date(reminder.triggerAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setMessages(p => [...p, { role: "edith", text: `I'll remind you to ${reminder.task} at ${time}.` }]); speakText(`I'll remind you to ${reminder.task} at ${time}.`);
      return;
    }

    // Calendar: create event
    const calMatch = cleaned.match(/(?:create|add|schedule|make|set\s+up)\s+(?:a\s+|an\s+)?(?:new\s+)?(?:event|meeting|appointment|call|reminder)?\s*(?:called|titled|named)?\s*(.+)/i);
    if (calMatch) {
      const calUrl = localStorage.getItem("edith_calendar_url") || CALENDAR_URL;
      const details = calMatch[1].trim();
      const timeMatch = details.match(/(?:at\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?(?:\s*tomorrow)?|tomorrow\s*(?:at\s+)?\d{1,2}(?::\d{2})?\s*(?:am|pm)?|next\s+\w+\s*(?:at\s+)?\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
      let title = details, startStr = null;
      if (timeMatch) { startStr = timeMatch[0]; title = details.replace(timeMatch[0], "").replace(/\s+/g, " ").trim().replace(/[,\s]*$/, ""); }
      if (!title && startStr) title = "Event";
      try {
        const r = await fetch(calUrl, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "data=" + encodeURIComponent(JSON.stringify({ title, startStr, location: "", description: "" })) });
        const d = await r.json();
        if (d.success) {
          setMessages(p => [...p, { role: "edith", text: `Added to calendar: ${title}.` }]);
          speakText(`Added ${title} to your calendar.`);
        } else {
          setMessages(p => [...p, { role: "edith", text: `Could not create: ${d.error || "check script deployment"}.` }]);
        }
      } catch (e) { setMessages(p => [...p, { role: "edith", text: `Calendar error: ${e.message || "check URL"}` }]); }
      return;
    }

    // Calendar: delete event
    const delMatch = cleaned.match(/(?:delete|remove|cancel|clear)\s+(?:the\s+)?(?:my\s+)?(?:event|meeting|appointment|call)?\s*(?:called|titled|named)?\s*(.+)/i);
    if (delMatch) {
      const calUrl = localStorage.getItem("edith_calendar_url") || CALENDAR_URL;
      const searchTitle = delMatch[1].trim().toLowerCase();
      try {
        const r = await fetch(calUrl + "?period=today");
        const d = await r.json();
        if (d.events) {
          const match = d.events.find(e => e.title.toLowerCase().includes(searchTitle));
          if (match) {
            await fetch(calUrl, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "data=" + encodeURIComponent(JSON.stringify({ action: "delete", eventId: match.id })) });
            setMessages(p => [...p, { role: "edith", text: `Deleted: ${match.title}.` }]);
            speakText(`Deleted ${match.title} from your calendar.`);
          } else {
            setMessages(p => [...p, { role: "edith", text: `No event matching "${delMatch[1]}" found today.` }]);
          }
        }
      } catch { setMessages(p => [...p, { role: "edith", text: "Calendar service unavailable." }]); }
      return;
    }

    if (/take (a )?(picture|photo|snap|snapshot)/.test(t) || /capture (a )?(picture|photo)/.test(t)) {
      if (!camReady) { setMessages(p => [...p, { role: "edith", text: "Camera is off." }]); return; }
      const result = await takePhoto(videoRef.current);
      if (result) addMedia({ type: "photo", dataUrl: result.dataUrl, fileName: "photo-" + Date.now() + ".jpg", tags: ["photo"] });
      setMessages(p => [...p, { role: "edith", text: result ? "Photo taken." : "Failed." }]);
      return;
    }
    if (/(start|begin|take) (a )?(video|recording)/.test(t) || /record (a )?video/.test(t)) {
      if (!camReady) { setMessages(p => [...p, { role: "edith", text: "Camera is off." }]); return; }
      if (recording) return;
      const rec = startRecording(camStreamRef.current, recordedChunksRef);
      if (!rec) return;
      mediaRecorderRef.current = rec; setRecording(true);
      setMessages(p => [...p, { role: "edith", text: "Recording started." }]);
      return;
    }
    if (/(stop|end|finish) (a )?(video|recording)/.test(t)) {
      if (!recording) return;
      const url = await stopRecording(mediaRecorderRef.current, recordedChunksRef);
      mediaRecorderRef.current = null; setRecording(false);
      if (url) addMedia({ type: "video", dataUrl: url, fileName: "video-" + Date.now() + ".webm", tags: ["video"] });
      setMessages(p => [...p, { role: "edith", text: url ? "Video saved." : "Failed." }]);
      return;
    }

    // Screen capture
    if (/(what'?s\s+on\s+)?(my\s+)?screen|share\s+(your\s+)?screen|look\s+at\s+(my\s+)?screen|capture\s+screen/i.test(t)) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const v = document.createElement("video");
        v.srcObject = stream;
        await v.play();
        await new Promise(r => setTimeout(r, 500));
        const c = document.createElement("canvas");
        c.width = v.videoWidth; c.height = v.videoHeight;
        c.getContext("2d").drawImage(v, 0, 0);
        const dataUrl = c.toDataURL("image/jpeg", 0.8);
        stream.getTracks().forEach(t => t.stop());
        setThinking(true);
        const reply = await fetchAI("What do you see on my screen? Describe what I'm looking at and help me with it.", apikey, dataUrl, facesRef.current);
        setMessages(p => [...p, { role: "edith", text: reply }]);
        setThinking(false);
        speakText(reply);
        addMemory({ type: "observation", text: "Screen captured", aiResponse: reply.slice(0, 80), tags: ["screen"] });
      } catch { setMessages(p => [...p, { role: "edith", text: "Screen capture cancelled." }]); }
      return;
    }

    setThinking(true);
    const frame = camReady ? (captureFrame(videoRef.current) || {}).dataUrl : null;
    const faceData = facesRef.current;
    const faceNames = faceData.map(f => f.name);
    const tags = cleaned.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const reply = await fetchAI(cleaned, apikey, frame, faceData);
    setMessages(p => [...p, { role: "edith", text: reply }]);
    setThinking(false);
    addMemory({ type: "conversation", text: cleaned, aiResponse: reply, faces: faceNames, tags });

    restartAbortRef.current = true;
    if (recRef.current) { recRef.current.stop(); recRef.current = null; }
    speakText(reply, () => {
      restartAbortRef.current = false;
      if (listeningRef.current) {
        const rec = new SR_W(); rec.continuous = false; rec.interimResults = true; rec.lang = "en-US"; rec.onstart = () => {};
        rec.onresult = (e) => recResultRef.current(e);
        rec.onerror = (e) => { if (e.error === "not-allowed") { stopMic(); setErr("Mic blocked"); } };
        rec.onend = () => { if (recRef.current !== rec || restartAbortRef.current) return; setTimeout(() => { if (recRef.current !== rec) return; try { rec.start(); } catch {} }, 150); };
        rec.start(); recRef.current = rec;
      }
    });
  }, [apikey, camReady, recording]);

  const recResultRef = useRef(null);
  recResultRef.current = (e) => {
    let final = "", interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) final += e.results[i][0].transcript;
      else interim += e.results[i][0].transcript;
    }
    if (interim) setPartial(interim);
    if (final.trim()) { setPartial(""); setMessages(p => [...p, { role: "user", text: final.trim() }]); doReply(final.trim()); }
  };

  const stopMic = () => { const r = recRef.current; recRef.current = null; if (r) r.stop(); setListening(false); setPartial(""); };
  const toggleMic = () => {
    if (!SR_W) { setErr("Speech recognition not supported. Try Chrome."); return; }
    if (recRef.current) { stopMic(); return; }
    const rec = new SR_W(); rec.continuous = false; rec.interimResults = true; rec.lang = "en-US";
    rec.onstart = () => { setListening(true); setErr(""); };
    rec.onresult = (e) => recResultRef.current(e);
    rec.onerror = (e) => { if (e.error === "not-allowed" && recRef.current === rec) { stopMic(); setErr("Mic blocked."); } };
    rec.onend = () => { if (recRef.current !== rec || restartAbortRef.current) return; setTimeout(() => { if (recRef.current !== rec || restartAbortRef.current) return; try { rec.start(); } catch { stopMic(); } }, 150); };
    rec.start(); recRef.current = rec;
  };

  const handleSend = () => { const text = inputText.trim(); if (!text) return; setInputText(""); setMessages(p => [...p, { role: "user", text }]); doReply(text); };

  useEffect(() => {
    const check = () => { const email = localStorage.getItem("edith_email"); if (!email) return; const last = localStorage.getItem("edith_last_daily_sent"); const today = new Date().toDateString(); if (last === today) return; if (new Date().getHours() < 21) return; const summary = generateSummary("today"); const payload = JSON.stringify({ to: email, subject: "E.D.I.T.H. Daily - " + today, body: summary }); fetch(SCRIPT_URL, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "data=" + encodeURIComponent(payload) }).catch(() => {}); localStorage.setItem("edith_last_daily_sent", today); };
    check(); const interval = setInterval(check, 60000); return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const check = () => { if (messages.length === 0 || thinking) return; const nudge = getSuggestedNudge(); const workObs = getWorkplaceObservation(camReady, facesRef.current, null, []); const msg = workObs || nudge; if (msg) { setMessages(p => [...p, { role: "edith", text: msg }]); speakText(msg); } };
    const interval = setInterval(check, 300000); return () => clearInterval(interval);
  }, [messages.length, thinking, camReady]);

  const stats = [
    { label: "Faces known", value: faceCount, icon: UserCheck },
    { label: "Conversations", value: messages.filter(m => m.role === "edith").length, icon: MessageCircle },
    { label: "Recognized", value: detectedFaces.length, icon: UserCheck },
    { label: "Camera", value: camReady ? "Live" : "Off", icon: Clock },
  ];

  return (
    <div className="p-6 lg:p-8 relative min-h-screen flex flex-col">
      <CornerGlow className="w-96 h-96 -top-32 -right-32" color="#6FB7FF" />
      <CornerGlow className="w-64 h-64 -bottom-16 -left-16" color="#FF9D5C" />
      <div className="max-w-6xl mx-auto relative z-10 flex flex-col flex-1 w-full gap-6">
        <div className="flex items-center justify-between">
          <div><h1 className="font-display text-2xl lg:text-3xl font-semibold mb-2">E.D.I.T.H.</h1><p className="text-gray-400">Your second brain. Better than your first.</p></div>
          {err && <span className="text-xs text-red-400/80 font-mono max-w-[240px] text-right">{err}</span>}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <GlassCard className="lg:col-span-2 relative overflow-hidden !p-0 min-h-[300px] bg-black">
            <video ref={videoRef} autoPlay playsInline muted className={`absolute inset-0 w-full h-full object-cover scale-x-[-1] ${watching && camReady ? "opacity-100" : "opacity-0"}`} />
            {watching && camReady && (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none z-10" />
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] tracking-[0.2em] text-red-400 bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20 backdrop-blur-sm">LVE</span>
                  {recording && <span className="font-mono text-[10px] tracking-[0.2em] text-red-300 bg-red-600/20 px-2 py-1 rounded-full border border-red-600/30 backdrop-blur-sm animate-pulse">REC</span>}
                  {detectedFaces.length > 0 && <span className="font-mono text-[10px] tracking-[0.2em] text-green-400 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20 backdrop-blur-sm">{detectedFaces.length} FACE{detectedFaces.length > 1 ? "S" : ""}</span>}
                </div>
              </>
            )}
            {(!watching || !camReady) && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-[#020203] flex items-center justify-center">
                <div className="text-center space-y-4">
                  {watching && selectedCam ? (<><div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto animate-pulse"><Camera size={28} className="text-red-400" /></div><p className="text-sm text-gray-500 font-mono">STARTING CAMERA...</p></>) : (<><CameraOff size={32} className="text-gray-600 mx-auto" /><p className="text-sm text-gray-600 font-mono">CAMERA OFF</p><button onClick={() => setWatching(true)} className="text-xs font-mono tracking-[0.2em] text-gray-400 hover:text-white transition-colors">Click to enable</button></>)}
                </div>
              </div>
            )}
          </GlassCard>
          <div className="space-y-4">
            <GlassCard className="!p-5 space-y-5">
              <div><div className="flex items-center justify-between mb-3"><div className="flex items-center gap-3"><div className={`w-9 h-9 rounded-full flex items-center justify-center ${listening ? "bg-[#FF9D5C]/10 border border-[#FF9D5C]/20" : "bg-white/5 border border-white/10"}`}>{listening ? <Mic size={16} className="text-[#FF9D5C]" /> : <MicOff size={16} className="text-gray-500" />}</div><p className="text-sm font-medium">Microphone</p></div><button onClick={toggleMic} className={`w-10 h-6 rounded-full transition-colors relative ${listening ? "bg-[#FF9D5C]" : "bg-white/10"}`}><div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${listening ? "translate-x-4" : "translate-x-0"}`} /></button></div><DeviceSelect devices={micDevices} value={selectedMic} onChange={setSelectedMic} kind="mic" /></div>
              <div><div className="flex items-center justify-between mb-3"><div className="flex items-center gap-3"><div className={`w-9 h-9 rounded-full flex items-center justify-center ${watching ? "bg-red-500/10 border border-red-500/20" : "bg-white/5 border border-white/10"}`}>{watching ? <Camera size={16} className="text-red-400" /> : <CameraOff size={16} className="text-gray-500" />}</div><p className="text-sm font-medium">Camera</p></div><button onClick={() => setWatching(!watching)} className={`w-10 h-6 rounded-full transition-colors relative ${watching ? "bg-red-500" : "bg-white/10"}`}><div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${watching ? "translate-x-4" : "translate-x-0"}`} /></button></div><DeviceSelect devices={camDevices} value={selectedCam} onChange={setSelectedCam} kind="cam" /></div>
              {modelsReady && <p className="text-[10px] font-mono text-green-400/60">AI vision ready</p>}
            </GlassCard>
            <GlassCard className="!p-3 flex items-center gap-3"><div className={`w-2 h-2 rounded-full ${apikey ? "bg-green-400" : "bg-red-400"}`} /><span className="text-xs font-mono text-gray-400 flex-1 truncate">{apikey ? `API: ${apikey.slice(0, 12)}...` : "No API key"}</span></GlassCard>
            <GlassCard className="!p-4"><div className="grid grid-cols-2 gap-y-4 gap-x-2">{stats.map(({ label, value, icon: Icon }) => (<div key={label}><div className="flex items-center gap-2 mb-1"><Icon size={12} className="text-gray-500 shrink-0" /><p className="text-[10px] font-mono tracking-[0.2em] text-gray-500 truncate">{label.toUpperCase()}</p></div><p className="font-display text-lg font-semibold">{value}</p></div>))}</div></GlassCard>
          </div>
        </div>
        <GlassCard className="!p-0 overflow-hidden flex flex-col min-h-[300px]">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3"><div className={`w-2 h-2 rounded-full ${listening ? "bg-green-400 animate-pulse" : "bg-gray-600"}`} /><h2 className="font-display text-sm font-semibold">{listening ? "Listening" : "Mic off"}</h2>{thinking && <span className="flex items-center gap-1.5 text-xs text-blue-300 font-mono"><Volume2 size={12} className="animate-pulse" /> Speaking</span>}</div>
            <div className="flex items-center gap-3">
              {messages.length > 0 && (
                <button onClick={() => setMessages([])} className="text-[10px] font-mono tracking-[0.2em] text-gray-500 hover:text-red-400 transition-colors">CLEAR</button>
              )}
              <a href="/memory" className="flex items-center gap-1 text-xs font-mono tracking-[0.2em] text-gray-500 hover:text-white transition-colors">MEMORY <ArrowRight size={12} /></a>
            </div>
          </div>
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.length === 0 && !partial && !thinking && (<div className="text-center py-12"><Sparkles size={32} className="text-gray-600 mx-auto mb-4" /><p className="text-gray-500 text-sm mb-1">Turn on the mic and start talking</p><p className="text-gray-600 text-xs">Or type below</p></div>)}
            {messages.map((m, i) => (<div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[75%] rounded-2xl px-4 py-3 ${m.role === "user" ? "bg-white/10 rounded-br-md" : "bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/10 rounded-bl-md"}`}><p className="text-[10px] font-mono tracking-[0.2em] mb-1 text-gray-500">{m.role === "user" ? "YOU" : "E.D.I.T.H."}</p><p className="text-sm leading-relaxed">{m.text}</p></div></div>))}
            {partial && (<div className="flex justify-end"><div className="max-w-[75%] rounded-2xl rounded-br-md px-4 py-3 bg-white/5 border border-white/5"><p className="text-[10px] font-mono tracking-[0.2em] mb-1 text-gray-500">YOU</p><p className="text-sm text-gray-400 italic">{partial}</p></div></div>)}
            {thinking && (<div className="flex justify-start"><div className="flex items-center gap-2 px-4 py-3"><div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" /><div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:150ms]" /><div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:300ms]" /><span className="text-xs text-gray-500 font-mono">thinking...</span></div></div>)}
            <div ref={messagesEndRef} />
          </div>
          <div className="px-6 py-4 border-t border-white/5">
            <div className="flex gap-3">
              <input value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleSend(); }} placeholder="Type a message..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/20 transition-colors" />
              <button onClick={handleSend} disabled={!inputText.trim()} className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/15 transition-colors disabled:opacity-30"><Send size={16} className="text-gray-300" /></button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
