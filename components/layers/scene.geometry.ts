import { LAYERS, SCENE, type Point2D, type Point3D } from "./layers.data";

export type SceneState = {
  gap: number;
  rotationX: number;
  rotationZ: number;
  active: number;
  token: Point3D;
  routeProgress: number[];
  connectorProgress: number[];
  tokenOpacity: number;
};
export type SceneViewport = { width: number; height: number; scale: number };

export const clamp = (value: number) => Math.max(0, Math.min(1, value));
const mix = (from: number, to: number, ratio: number) => from + (to - from) * ratio;
const smooth = (value: number) => { const p = clamp(value); return p * p * (3 - 2 * p); };
export const layerDepth = (index: number, gap: number) => (1.5 - index) * gap;

export function alongRoute(points: readonly Point2D[], progress: number): Point2D {
  const distances = points.slice(1).map((point, index) => Math.hypot(point.x - points[index].x, point.y - points[index].y));
  let remaining = clamp(progress) * distances.reduce((sum, distance) => sum + distance, 0);
  for (let index = 0; index < distances.length; index++) {
    if (remaining <= distances[index] || index === distances.length - 1) {
      const ratio = distances[index] ? remaining / distances[index] : 0;
      return { x: mix(points[index].x, points[index + 1].x, ratio), y: mix(points[index].y, points[index + 1].y, ratio) };
    }
    remaining -= distances[index];
  }
  return points[0];
}

export function getSceneState(progress: number | null, hero = false): SceneState {
  if (progress === null) {
    const gap = hero ? SCENE.heroGap : SCENE.openGap;
    return {
      gap, rotationX: SCENE.rotationX, rotationZ: SCENE.rotationZ, active: -1,
      token: { x: 440, y: 245, z: layerDepth(1, gap) + 10 },
      routeProgress: [1, 1, 1, 1], connectorProgress: [1, 1, 1], tokenOpacity: 1,
    };
  }
  const p = clamp(progress);
  const opening = smooth(p / 0.12);
  const closing = smooth((p - 0.84) / 0.16);
  const gap = mix(mix(SCENE.compactGap, SCENE.openGap, opening), 88, closing);
  const active = p < 0.12 || p >= 0.84 ? -1 : Math.min(3, Math.floor((p - 0.12 + 0.00001) / 0.18));
  const routeProgress = LAYERS.map((layer) => clamp((p - layer.startsAt - 0.035) / 0.105));
  const connectorProgress = LAYERS.slice(1).map((layer) => clamp((p - layer.startsAt) / 0.035));
  let token: Point3D = { ...LAYERS[0].route[0], z: layerDepth(0, gap) + 10 };
  for (let index = 0; index < LAYERS.length; index++) {
    const layer = LAYERS[index];
    if (p < layer.startsAt) break;
    if (index > 0 && p < layer.startsAt + 0.035) {
      token = { ...layer.route[0], z: mix(layerDepth(index - 1, gap), layerDepth(index, gap), connectorProgress[index - 1]) + 10 };
    } else {
      token = { ...alongRoute(layer.route, routeProgress[index]), z: layerDepth(index, gap) + 10 };
    }
  }
  return {
    gap,
    rotationX: mix(61, SCENE.rotationX, opening) - closing * 2,
    rotationZ: SCENE.rotationZ + Math.sin(p * Math.PI * 2) * 2,
    active, token, routeProgress, connectorProgress,
    tokenOpacity: clamp((p - 0.12) / 0.025),
  };
}

/** Same rotation order, origin and perspective as .scene-world in scene.css. */
export function projectPoint(point: Point3D, state: SceneState, viewport: SceneViewport): Point2D {
  const rz = state.rotationZ * Math.PI / 180;
  const rx = state.rotationX * Math.PI / 180;
  const x = point.x - SCENE.width / 2;
  const y = point.y - SCENE.height / 2;
  const rotatedX = Math.cos(rz) * x - Math.sin(rz) * y;
  const rotatedY = Math.sin(rz) * x + Math.cos(rz) * y;
  const viewY = Math.cos(rx) * rotatedY - Math.sin(rx) * point.z;
  const viewZ = Math.sin(rx) * rotatedY + Math.cos(rx) * point.z;
  const perspective = SCENE.perspective / (SCENE.perspective - viewZ * viewport.scale);
  return {
    x: viewport.width / 2 + rotatedX * viewport.scale * perspective,
    y: viewport.height / 2 + viewY * viewport.scale * perspective,
  };
}
