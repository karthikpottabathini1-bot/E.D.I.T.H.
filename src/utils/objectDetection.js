import * as cocoSsd from "@tensorflow-models/coco-ssd";

let model = null;
let objectsRef = [];

export async function loadObjectModel() {
  if (model) return;
  model = await cocoSsd.load({ base: "mobilenet_v2" });
}

export async function detectObjects(videoEl) {
  if (!model || !videoEl || !videoEl.videoWidth) return [];
  const predictions = await model.detect(videoEl);
  objectsRef = predictions;
  return predictions;
}

export function getCurrentObjects() {
  return objectsRef;
}

export function formatObjectsForAI() {
  if (!objectsRef.length) return "";
  const items = objectsRef.map(o => o.class).filter((v, i, a) => a.indexOf(v) === i);
  return "Objects in view: " + items.join(", ") + ".";
}
