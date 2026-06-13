# E.D.I.T.H. — Your Second Brain. Better Than Your First.

> **🏆 Built for Track 1 — Interactive Learning | Milpitas Hacks 3**

An AI second brain that sees you, hears you, remembers you, and talks back. Built with 7 sponsor technologies, running entirely in the browser. No backend. No database. Just pure client-side magic.

**[Live Demo →](https://edith-ai-five.vercel.app)**

---

## 🎥 What E.D.I.T.H. Does

E.D.I.T.H. is a fully voice-and-vision AI companion. Turn on your camera and microphone, say **"EDITH"** (like "Jarvis"), and she responds. She watches through your webcam, listens through your mic, remembers every conversation, recognizes faces, reads your calendar, searches the web, and sends you email summaries at the end of each day.

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite" />
  <img src="https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss" />
  <img src="https://img.shields.io/badge/Hosted_on-Vercel-000?logo=vercel" />
  <img src="https://img.shields.io/badge/License-MIT-green" />
</p>

---

## 🧠 Features

### Core AI
| Feature | Description |
|---|---|
| **Voice Commands** | Wake word "EDITH" — say it naturally ("EDITH what time is it", "EDITH take a picture") |
| **Text-to-Speech** | ElevenLabs "Bella" voice — natural, warm, studio-quality audio |
| **Speech-to-Text** | Web Speech API — real-time transcription with wake word filtering |
| **AI Reasoning** | Gemini 2.5 Flash via Backboard.io / OpenRouter — multimodal (text + vision) |
| **Live Web Search** | DuckDuckGo Instant Answers — every question gets real-time factual context |

### Vision
| Feature | Description |
|---|---|
| **Face Recognition** | face-api.js — detects faces, extracts 128-dimension descriptors, matches against known faces |
| **Face Memory** | Names faces: "EDITH save his face as Dad". Persistent across sessions via localStorage |
| **Mood Tracking** | Reads 7 emotions (happy, sad, angry, surprised, fearful, disgusted, neutral) |
| **Object Awareness** | AI sees what's in your camera frame — "EDITH what am I holding" |
| **Screen Capture** | "EDITH what's on my screen" — captures and analyzes your desktop |

### Productivity
| Feature | Description |
|---|---|
| **Reminders** | "EDITH remind me to call Mom at 3pm" — browser notification + email alert |
| **Google Calendar** | Reads and writes your real Google Calendar. "EDITH create a meeting tomorrow at 2" |
| **Email Summaries** | Daily/weekly bullet-point summaries auto-emailed to you via Google Apps Script |
| **Location Tracking** | GPS logging — "EDITH where was I yesterday" |
| **Workplace Assistant** | Tracks work sessions, detects fatigue, offers break suggestions |

### Memory
| Feature | Description |
|---|---|
| **Persistent Memory** | Every conversation auto-saved with timestamps, faces, keywords |
| **Memory Search** | Search past conversations by keyword — "where did I leave my glasses" |
| **Photo Gallery** | View, download, delete captured photos and videos |
| **Proactive Suggestions** | Detects patterns — "You often ask about weather at this time…" |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    E.D.I.T.H. Client                     │
│  React 19 + Vite 7 + Tailwind v4                        │
├─────────────────────────────────────────────────────────┤
│  🎤 Voice Input    │  Web Speech API (wake word: EDITH)│
│  🔊 Voice Output   │  ElevenLabs TTS (Bella voice)     │
│  📷 Camera Input   │  getUserMedia + face-api.js       │
│  🧠 AI Reasoning   │  Backboard.io / OpenRouter         │
│  🌐 Web Search     │  DuckDuckGo + LangSearch           │
│  📧 Email          │  Google Apps Script (Gmail)        │
│  📅 Calendar       │  Google Apps Script (Calendar)     │
│  💾 Storage        │  localStorage (offline-first)      │
│  🚀 Hosting        │  Vercel (auto-deploy from GitHub)  │
└─────────────────────────────────────────────────────────┘
```

---

## 🤝 Sponsors + Others

This project was built using the following incredible platforms and technologies:

<p align="center">
  <a href="https://vercel.com"><img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" /></a>
  <a href="https://backboard.io"><img src="https://img.shields.io/badge/Backboard.io-000000?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHJ4PSI0IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==&logoColor=white&labelColor=555" /></a>
  <a href="https://omi.me"><img src="https://img.shields.io/badge/Omi-000000?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0id2hpdGUiLz48L3N2Zz4=&logoColor=white&labelColor=555" /></a>
  <a href="https://elevenlabs.io"><img src="https://img.shields.io/badge/ElevenLabs-000000?style=for-the-badge&logo=elevenlabs&logoColor=white" /></a>
  <a href="https://openrouter.ai"><img src="https://img.shields.io/badge/OpenRouter-000000?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkwyIDdsMTAgNSAxMC01TDEyIDJ6IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==&logoColor=white&labelColor=555" /></a>
  <a href="https://developers.google.com/apps-script"><img src="https://img.shields.io/badge/Google_Apps_Script-000000?style=for-the-badge&logo=google&logoColor=white" /></a>
  <a href="https://www.tensorflow.org/js"><img src="https://img.shields.io/badge/TensorFlow.js-000000?style=for-the-badge&logo=tensorflow&logoColor=white" /></a>
  <a href="https://duckduckgo.com"><img src="https://img.shields.io/badge/DuckDuckGo-000000?style=for-the-badge&logo=duckduckgo&logoColor=white" /></a>
</p>

### Sponsor Integration Details

| Sponsor | Role | How We Used It |
|---|---|---|
| **[Vercel](https://vercel.com)** | Hosting & Deployment | Global CDN, auto-deploy from GitHub, environment variable management, HTTPS out of the box. Deployed in 23 seconds with `vercel --prod`. |
| **[Backboard.io](https://backboard.io)** | AI Platform | Primary AI provider — threading, persistent memory, model routing. Wraps Gemini 2.5 Flash with production-grade infrastructure. Settings → add your key. |
| **[Omi](https://omi.me)** | Wearable Hardware | Architecture designed for Omi compatibility. Open-source AI wearable integration for audio capture + conversation memory. |
| **[ElevenLabs](https://elevenlabs.io)** | Voice Synthesis | Bella voice model (`EXAVITQu4vr4xnSDxMaL`) via `eleven_turbo_v2_5` engine. CORS-compatible browser-to-API calls. Falls back to Web Speech API. |
| **[OpenRouter](https://openrouter.ai)** | AI Model Access | Unified API for 250+ models. We use `google/gemini-2.5-flash` for multimodal reasoning. |
| **[Google Apps Script](https://script.google.com)** | Backend Automation | Two serverless functions — Email Sender (Gmail integration) and Calendar Reader/Writer (Google Calendar). $0 infrastructure cost. |
| **[TensorFlow.js + face-api.js](https://github.com/justadudewhohacks/face-api.js/)** | Machine Learning | Four models running in-browser: face detection, 68-point landmarks, 128-dimension recognition, 7-emotion expression analysis. |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- A modern browser (Chrome recommended for SpeechRecognition)
- Camera + microphone

### Install
```bash
git clone https://github.com/karthikpottabathini1-bot/E.D.I.T.H..git
cd E.D.I.T.H.
npm install
```

### Environment Variables
Copy `.env.example` to `.env` and fill in your API keys:
```bash
cp .env.example .env
```

```
VITE_OPENROUTER_KEY=sk-or-v1-your-openrouter-key
VITE_ELEVENLABS_KEY=your-elevenlabs-key
VITE_LANGSEARCH_KEY=your-langsearch-key
VITE_EMAIL_SCRIPT_URL=https://script.google.com/macros/s/.../exec
VITE_CALENDAR_SCRIPT_URL=https://script.google.com/macros/s/.../exec
```

### Run
```bash
npm run dev
```
Open http://localhost:5173/dashboard

### Deploy
```bash
npx vercel --prod
```

---

## 📁 Project Structure

```
src/
├── pages/
│   ├── Dashboard.jsx      # Main app — camera, mic, AI, conversation
│   ├── Landing.jsx         # Marketing landing page
│   ├── Memory.jsx          # Searchable conversation history
│   ├── Gallery.jsx         # Photos and videos
│   └── Settings.jsx        # API keys, email, calendar, data management
├── components/
│   ├── AppLayout.jsx       # Sidebar + top bar shell
│   ├── GlassCard.jsx       # Reusable glassmorphism card
│   ├── CornerGlow.jsx      # Ambient background glow
│   ├── HeroArt.jsx         # Landing page hero SVG
│   ├── LandingNav.jsx      # Landing page navigation
│   └── Section.jsx         # Scroll-reveal animation wrapper
├── utils/
│   ├── faceRecognition.js  # face-api.js wrapper — detect, match, save
│   ├── memoryStore.js      # Conversation logging + search
│   ├── mediaStore.js       # Photo/video metadata
│   ├── reminders.js        # Time-based notification system
│   ├── locationTracker.js  # GPS position logging
│   ├── workplaceAssistant.js # Work session + fatigue tracking
│   └── objectDetection.js  # COCO-SSD object detection (disabled due to TF conflict)
├── index.css               # Tailwind + custom EDITH design system
├── main.jsx                # React entry point
└── App.jsx                 # Router configuration
public/
└── models/                 # face-api.js ML models (tiny_face_detector, landmarks, recognition, expression)
```

---

## 🎨 Design System

Custom CSS classes built on Tailwind v4:

- `.edith-glass` — Frosted glass panels with hover glow
- `.edith-glass-strong` — Opaque panels for sidebar/header
- `.edith-glow-line` — Gradient horizontal dividers
- `.edith-tag` — Monospace labels with letter-spacing
- `.edith-reveal` / `.edith-reveal-visible` — Scroll-triggered fade-in
- `.edith-wave` — Pulsing SVG animation for hero art
- `.edith-hero-fade` — Gradient overlay for landing page

Font stack: **Space Grotesk** (display) + **Inter** (body) + **JetBrains Mono** (code)

---

## 🔧 Tech Stack

| Category | Technology |
|---|---|
| Framework | React 19 |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| AI Provider | Backboard.io → OpenRouter → Gemini 2.5 Flash |
| Voice Input | Web Speech API (SpeechRecognition) |
| Voice Output | ElevenLabs TTS (Bella) → Web Speech API fallback |
| Vision | face-api.js + TensorFlow.js |
| Web Search | DuckDuckGo Instant Answers + LangSearch |
| Email | Google Apps Script (Gmail) |
| Calendar | Google Apps Script (Calendar) |
| Storage | localStorage (offline-first) |
| Hosting | Vercel |
| Icons | Lucide React |

---

## 📊 Performance

| Metric | Value |
|---|---|
| Bundle Size (JS) | ~950 KB (gzip ~253 KB) |
| CSS | ~35 KB (gzip ~7 KB) |
| ML Models | ~3.6 MB (cached locally) |
| API Calls | 4-6 per interaction (web search, AI, TTS, calendar) |
| Face Detection Interval | 3 seconds |
| TTS Latency | ~1-2 seconds (ElevenLabs) |
| AI Latency | ~2-5 seconds (Gemini 2.5 Flash) |

---

## 🔮 Future Roadmap

- [ ] Omi hardware integration (BLE connection)
- [ ] Offline mode with WebLLM
- [ ] Mobile PWA with push notifications
- [ ] Multi-user face profiles with cloud sync
- [ ] Google Drive integration for photo backup
- [ ] Screen recording + AI narration
- [ ] Real-time object tracking (WebGPU)
- [ ] Speech-to-text via ElevenLabs Scribe

---

## 📄 License

MIT — built for Milpitas Hacks 3. Hack freely.

---

<p align="center">
  <b>Built with ✨ by Karthik Pottabathini</b><br>
  <sub>Vercel · Backboard.io · Omi · ElevenLabs · OpenRouter · Google · DuckDuckGo</sub>
</p>
