import * as faceapi from "face-api.js";

const MODEL_URL = "/models";

let modelsLoaded = false;

export async function loadModels() {
  if (modelsLoaded) return;
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
  modelsLoaded = true;
}

export async function detectFaces(videoEl) {
  if (!videoEl || !videoEl.videoWidth) return [];

  const detections = await faceapi
    .detectAllFaces(videoEl, new faceapi.TinyFaceDetectorOptions({ inputSize: 320 }))
    .withFaceLandmarks()
    .withFaceDescriptors();

  return detections;
}

export function getKnownFaces() {
  try {
    const raw = localStorage.getItem("edith_known_faces");
    if (!raw) return [];
    return JSON.parse(raw).map((f) => ({
      name: f.name,
      firstSeen: f.firstSeen,
      lastSeen: f.lastSeen,
      encounterCount: f.encounterCount,
      photo: f.photo || null,
      descriptor: new Float32Array(f.descriptor),
    }));
  } catch {
    return [];
  }
}

export function saveKnownFaces(faces) {
  const clean = faces.map((f) => ({
    name: f.name,
    firstSeen: f.firstSeen,
    lastSeen: f.lastSeen,
    encounterCount: f.encounterCount,
    photo: f.photo || null,
    descriptor: Array.from(f.descriptor),
  }));
  localStorage.setItem("edith_known_faces", JSON.stringify(clean));
}

export function renameFace(oldName, newName, photo) {
  const faces = getKnownFaces();
  const idx = faces.findIndex(f => f.name === oldName);
  if (idx < 0) return false;
  faces[idx].name = newName;
  if (photo) faces[idx].photo = photo;
  saveKnownFaces(faces);
  return true;
}

export function renameLastNewFace(newName, photo) {
  const faces = getKnownFaces();
  let idx = -1;
  for (let i = faces.length - 1; i >= 0; i--) {
    if (/^Person \d+$/.test(faces[i].name)) { idx = i; break; }
  }
  if (idx < 0) return false;
  faces[idx].name = newName;
  if (photo) faces[idx].photo = photo;
  saveKnownFaces(faces);
  return faces[idx];
}

export function matchFace(descriptor, knownFaces, threshold = 0.6) {
  if (!knownFaces.length) return null;
  const labeled = knownFaces.map(
    (f) => new faceapi.LabeledFaceDescriptors(f.name, [f.descriptor])
  );
  const matcher = new faceapi.FaceMatcher(labeled, threshold);
  return matcher.findBestMatch(descriptor);
}

export function drawDetections(canvasEl, detections, knownFaces) {
  const ctx = canvasEl.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

  const now = Date.now();

  detections.forEach((det) => {
    const match = matchFace(det.descriptor, knownFaces, 0.55);
    const label =
      match && match.label !== "unknown"
        ? match.label
        : "New Face " + (knownFaces.length + 1);

    const box = det.detection.box;
    const drawBox = new faceapi.draw.DrawBox(box, { label, boxColor: match && match.label !== "unknown" ? "rgba(0,255,0,0.6)" : "rgba(255,157,92,0.6)" });
    drawBox.draw(canvasEl);
  });
}
