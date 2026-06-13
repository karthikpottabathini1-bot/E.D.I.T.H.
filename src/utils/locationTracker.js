const STORE_KEY = "edith_locations";

let watchId = null;
let currentPosition = null;

export function startLocationTracking() {
  if (!navigator.geolocation) return;
  if (watchId) return;

  navigator.geolocation.getCurrentPosition(
    pos => { currentPosition = pos; },
    () => {},
    { enableHighAccuracy: true, timeout: 5000 }
  );

  watchId = navigator.geolocation.watchPosition(
    pos => {
      currentPosition = pos;
      logPosition(pos);
    },
    () => {},
    { enableHighAccuracy: false, timeout: 30000, maximumAge: 60000 }
  );
}

export function stopLocationTracking() {
  if (watchId) { navigator.geolocation.clearWatch(watchId); watchId = null; }
}

function logPosition(pos) {
  const locations = getLocations();
  const last = locations[locations.length - 1];

  // Only log if moved significantly (~100m) or it's been 5+ minutes
  if (last) {
    const dist = getDistance(last.lat, last.lng, pos.coords.latitude, pos.coords.longitude);
    const timeDiff = Date.now() - last.timestamp;
    if (dist < 0.1 && timeDiff < 300000) return;
  }

  locations.push({
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
    timestamp: Date.now(),
  });

  const trimmed = locations.slice(-500);
  localStorage.setItem(STORE_KEY, JSON.stringify(trimmed));
}

export function getLocations() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || "[]"); } catch { return []; }
}

export function getCurrentPosition() {
  return currentPosition;
}

export function getLocationsForPeriod(period) {
  const locations = getLocations();
  const now = Date.now();
  let start;
  if (period === "today") {
    const d = new Date(); d.setHours(0, 0, 0, 0); start = d.getTime();
  } else if (period === "week") {
    const d = new Date(); d.setDate(d.getDate() - 7); d.setHours(0, 0, 0, 0); start = d.getTime();
  } else start = 0;
  return locations.filter(l => l.timestamp >= start);
}

function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatLocationsForAI() {
  const locs = getLocationsForPeriod("today");
  if (!locs.length) return "";

  const unique = [];
  locs.forEach(l => {
    const last = unique[unique.length - 1];
    if (!last || getDistance(last.lat, last.lng, l.lat, l.lng) > 0.5) {
      unique.push(l);
    }
  });

  return "Location log today:\n" + unique.map(l => {
    const t = new Date(l.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return `- ${t}: (${l.lat.toFixed(4)}, ${l.lng.toFixed(4)})`;
  }).join("\n");
}
