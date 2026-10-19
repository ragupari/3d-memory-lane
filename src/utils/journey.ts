import type { JourneySave, MemoryPhoto, PlacedMemory } from "../types/memory";
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
  const ordered = shuffle(photos, random);
  let distance = 5;
  return ordered.map((photo, i) => {
    distance += i === 0 ? 0 : 3.8 + random() * 1.8;
    return {
      photo,
      distance,
      x: (i % 2 ? 1 : -1) * (1.85 + random() * 0.65),
      y: 1.75 + random() * 0.55,
      width: 1.3 + random() * 0.4,
      rotation: (random() - 0.5) * 0.15,
      phase: random() * Math.PI * 2,
      ropeHeight: 3.6 + random() * 0.5,
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
