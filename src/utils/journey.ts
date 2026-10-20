import type {
  JourneySave,
  MemoryPhoto,
  MeshBridgeSpan,
  MeshNode,
  PathId,
  PathJunction,
  PlacedMemory,
} from "../types/memory";

export const PATH_ORDER: PathId[] = [
  "paris-path",
  "taj-path",
  "kyoto-path",
  "venice-path",
];

export const MESH_NODES: MeshNode[] = [
  {
    id: "node-entry",
    label: "Bridge Entrance",
    x: 0,
    z: 2,
    connectedPaths: ["paris-path"],
  },
  {
    id: "node-belvedere",
    label: "Eiffel Vista",
    x: 0,
    z: -66,
    connectedPaths: ["paris-path"],
  },
];

export const MESH_BRIDGE_SPANS: MeshBridgeSpan[] = [
  {
    id: "span-main",
    pathId: "paris-path",
    from: [0, 6],
    to: [0, -90],
    label: "Romantic Parisian Bridge",
  },
];

export function computeMeshPose(distance: number): {
  x: number;
  z: number;
  yaw: number;
} {
  return { x: 0, z: -distance, yaw: 0 };
}

export function seededRandom(seed: number) {
  let n = seed >>> 0;
  return () => {
    n += 0x6d2b79f5;
    let t = n;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function generatePhotoLayout(
  photos: MemoryPhoto[],
  seed: number,
): PlacedMemory[] {
  const ids = new Set(photos.map((p) => p.id));
  if (ids.size !== photos.length)
    throw new Error("Every memory needs a unique ID.");
  const random = seededRandom(seed);
  const shuffled = shuffle(photos, random);
  const hasExplicitPaths = photos.some((p) => p.pathId !== undefined);
  const ordered = hasExplicitPaths
    ? [...shuffled].sort(
        (a, b) =>
          PATH_ORDER.indexOf(a.pathId ?? "paris-path") -
          PATH_ORDER.indexOf(b.pathId ?? "paris-path"),
      )
    : shuffled;
  let distance = 5;
  return ordered.map((photo, i) => {
    distance += i === 0 ? 0 : 3.8 + random() * 1.8;
    const fallbackPath =
      PATH_ORDER[
        Math.min(
          PATH_ORDER.length - 1,
          Math.floor((i / Math.max(1, ordered.length)) * PATH_ORDER.length),
        )
      ];
    const x = (i % 2 ? 1 : -1) * (1.85 + random() * 0.55);
    return {
      photo,
      distance,
      x,
      y: 1.75 + random() * 0.5,
      width: 1.3 + random() * 0.35,
      rotation: (random() - 0.5) * 0.12,
      phase: random() * Math.PI * 2,
      ropeHeight: 3.6 + random() * 0.5,
      pathId: photo.pathId ?? fallbackPath,
      worldX: x,
      worldZ: -distance,
      worldYaw: 0,
    };
  });
}

export function journeyLength(layout: PlacedMemory[]) {
  return layout.length ? layout[layout.length - 1].distance + 1 : 0;
}

export function visibleMemories(layout: PlacedMemory[], distance: number) {
  return layout.filter(
    (p) => p.distance - distance > 2.8 && p.distance - distance < 11,
  );
}

export interface PathSegmentInfo {
  pathId: PathId;
  startDistance: number;
  endDistance: number;
  entryTargetDistance: number;
  memories: PlacedMemory[];
}

export function getPathSegments(layout: PlacedMemory[]): PathSegmentInfo[] {
  const totalLen = journeyLength(layout);
  return PATH_ORDER.map((pathId, idx) => {
    const memories = layout.filter((m) => m.pathId === pathId);
    if (memories.length === 0) {
      const quarter = totalLen / PATH_ORDER.length;
      return {
        pathId,
        startDistance: idx * quarter,
        endDistance: (idx + 1) * quarter,
        entryTargetDistance: Math.max(0, idx * quarter),
        memories: [],
      };
    }
    const firstDist = memories[0].distance;
    const lastDist = memories[memories.length - 1].distance;
    const prevMemories =
      idx > 0
        ? layout.filter((m) => m.pathId === PATH_ORDER[idx - 1])
        : [];
    const nextMemories =
      idx < PATH_ORDER.length - 1
        ? layout.filter((m) => m.pathId === PATH_ORDER[idx + 1])
        : [];
    const startDistance =
      idx === 0
        ? 0
        : prevMemories.length
          ? (prevMemories[prevMemories.length - 1].distance + firstDist) / 2
          : Math.max(0, firstDist - 2.5);
    const endDistance =
      idx === PATH_ORDER.length - 1
        ? totalLen
        : nextMemories.length
          ? (lastDist + nextMemories[0].distance) / 2
          : lastDist + 2.5;
    const entryTargetDistance =
      idx === 0 ? 0 : Math.max(0, firstDist - 4.2);
    return {
      pathId,
      startDistance,
      endDistance,
      entryTargetDistance,
      memories,
    };
  });
}

export function getActivePathAtDistance(
  layout: PlacedMemory[],
  distance: number,
): PathId {
  const segments = getPathSegments(layout);
  for (const seg of segments) {
    if (distance >= seg.startDistance && distance <= seg.endDistance) {
      return seg.pathId;
    }
  }
  return segments[segments.length - 1]?.pathId ?? "paris-path";
}

export function getPathJunctions(layout: PlacedMemory[]): PathJunction[] {
  const segments = getPathSegments(layout);
  if (!layout.length) return [];
  return segments.map((seg, idx) => {
    const nextIdx = (idx + 1) % PATH_ORDER.length;
    return {
      id: `junction-${seg.pathId}`,
      distance: idx === 0 ? 15.5 : seg.startDistance,
      worldX: 0,
      worldZ: -(idx === 0 ? 15.5 : seg.startDistance),
      fromPath: seg.pathId,
      leftPath: PATH_ORDER[nextIdx],
      straightPath: PATH_ORDER[nextIdx],
      rightPath: PATH_ORDER[nextIdx],
      nextPath: PATH_ORDER[nextIdx],
      label: seg.pathId,
    };
  });
}

export function restoreJourney(
  raw: string | null,
  photos: MemoryPhoto[],
): JourneySave | null {
  try {
    if (!raw) return null;
    const s = JSON.parse(raw) as JourneySave;
    const valid = new Set(photos.map((p) => p.id));
    if (
      s.version !== 1 ||
      !Number.isInteger(s.seed) ||
      !Array.isArray(s.ids) ||
      s.ids.length !== valid.size ||
      new Set(s.ids).size !== valid.size ||
      s.ids.some((id) => !valid.has(id)) ||
      !Array.isArray(s.discovered) ||
      !Number.isFinite(s.distance) ||
      s.distance < 0
    )
      return null;
    const layout = generatePhotoLayout(photos, s.seed);
    if (layout.some((p, i) => p.photo.id !== s.ids[i])) return null;
    return {
      ...s,
      distance: Math.min(s.distance, journeyLength(layout)),
      discovered: [...new Set(s.discovered.filter((id) => valid.has(id)))],
    };
  } catch {
    return null;
  }
}
