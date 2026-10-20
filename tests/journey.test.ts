import { describe, expect, it } from "vitest";
import {
  generatePhotoLayout,
  journeyLength,
  restoreJourney,
  seededRandom,
  shuffle,
  visibleMemories,
} from "../src/utils/journey";
import type { MemoryPhoto } from "../src/types/memory";
const sample = (n: number): MemoryPhoto[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `photo-${i}`,
    src: `/photos/${i}.jpg`,
  }));
describe("non-repeating Fisher–Yates shuffle", () => {
  it("preserves every element exactly once without mutating input", () => {
    const input = sample(100);
    const copy = [...input];
    const result = shuffle(input, seededRandom(42));
    expect(result).toHaveLength(100);
    expect(new Set(result.map((p) => p.id)).size).toBe(100);
    expect([...result].sort((a, b) => a.id.localeCompare(b.id))).toEqual(
      [...input].sort((a, b) => a.id.localeCompare(b.id)),
    );
    expect(input).toEqual(copy);
    expect(result).not.toEqual(input);
  });
  it("is reproducible, and different seeds create different orders", () => {
    expect(shuffle(sample(100), seededRandom(5))).toEqual(
      shuffle(sample(100), seededRandom(5)),
    );
    expect(shuffle(sample(100), seededRandom(5))).not.toEqual(
      shuffle(sample(100), seededRandom(6)),
    );
  });
  it("handles an empty list and a single item", () => {
    expect(shuffle([])).toEqual([]);
    expect(shuffle([1])).toEqual([1]);
  });
});
describe("stable, navigable spatial layout", () => {
  it.each([0, 1, 12, 100, 1000])(
    "places all %i photographs once with safe spacing",
    (n) => {
      const layout = generatePhotoLayout(sample(n), 191);
      expect(layout).toHaveLength(n);
      expect(new Set(layout.map((p) => p.photo.id)).size).toBe(n);
      for (let i = 0; i < n; i++) {
        const p = layout[i];
        expect(Math.abs(p.x) - p.width / 2).toBeGreaterThan(0.9);
        expect(Math.abs(p.x) + p.width / 2).toBeLessThan(3.8);
        expect(p.y).toBeGreaterThan(1.7);
        if (i) expect(p.distance - layout[i - 1].distance).toBeGreaterThan(3.7);
      }
      expect(journeyLength(layout)).toBe(n ? layout[n - 1].distance + 1 : 0);
    },
  );
  it("keeps positions stable when revisiting", () => {
    const first = generatePhotoLayout(sample(100), 12);
    const before = JSON.stringify(first);
    visibleMemories(first, 25);
    visibleMemories(first, 60);
    visibleMemories(first, 25);
    expect(JSON.stringify(first)).toBe(before);
    expect(first).toEqual(generatePhotoLayout(sample(100), 12));
  });
  it("rejects duplicate IDs", () =>
    expect(() =>
      generatePhotoLayout(
        [
          { id: "a", src: "a" },
          { id: "a", src: "b" },
        ],
        1,
      ),
    ).toThrow("unique ID"));
  it("allows every photograph to enter a discovery region", () => {
    const l = generatePhotoLayout(sample(100), 12);
    const seen = new Set<string>();
    for (let d = 0; d <= journeyLength(l); d += 0.5)
      visibleMemories(l, d).forEach((p) => seen.add(p.photo.id));
    expect(seen.size).toBe(100);
  });
});
describe("saved journey validation", () => {
  const photos = sample(12),
    seed = 42;
  const ids = generatePhotoLayout(photos, seed).map((p) => p.photo.id);
  const save = {
    version: 1,
    seed,
    ids,
    distance: 12,
    discovered: [ids[0], ids[1]],
  };
  it("restores the same sequence, discovery and position", () =>
    expect(restoreJourney(JSON.stringify(save), photos)).toEqual(save));
  it("rejects stale manifests, invalid seeds, corrupt data and invalid order", () => {
    expect(restoreJourney("not json", photos)).toBeNull();
    expect(restoreJourney(null, photos)).toBeNull();
    expect(restoreJourney(JSON.stringify(save), sample(13))).toBeNull();
    expect(
      restoreJourney(JSON.stringify({ ...save, seed: "invalid" }), photos),
    ).toBeNull();
    expect(
      restoreJourney(
        JSON.stringify({ ...save, ids: [...ids].reverse() }),
        photos,
      ),
    ).toBeNull();
    expect(
      restoreJourney(JSON.stringify({ ...save, distance: -1 }), photos),
    ).toBeNull();
  });
  it("deduplicates discovery and clamps route bounds", () => {
    const s = restoreJourney(
      JSON.stringify({
        ...save,
        distance: 99999,
        discovered: [ids[0], ids[0], "removed"],
      }),
      photos,
    );
    expect(s?.discovered).toEqual([ids[0]]);
    expect(s?.distance).toBe(journeyLength(generatePhotoLayout(photos, seed)));
  });
});

import { PerspectiveCamera, Matrix4, Frustum, Vector3 } from "three";
describe("camera discovery on real perspective projections", () => {
  it.each([
    { width: 1440, height: 900, fov: 64 },
    { width: 390, height: 844, fov: 88 },
  ])("exposes every memory at $width × $height", ({ width, height, fov }) => {
    const layout = generatePhotoLayout(sample(100), 42),
      seen = new Set<string>();
    const camera = new PerspectiveCamera(fov, width / height, 0.1, 85),
      frustum = new Frustum(),
      matrix = new Matrix4(),
      point = new Vector3();
    for (let d = 0; d < journeyLength(layout); d += 0.3) {
      camera.position.set(Math.sin(d * 0.055) * 0.18, 1.75, 2 - d);
      camera.updateMatrixWorld();
      frustum.setFromProjectionMatrix(
        matrix.multiplyMatrices(
          camera.projectionMatrix,
          camera.matrixWorldInverse,
        ),
      );
      visibleMemories(layout, d)
        .filter((p) => frustum.containsPoint(point.set(p.x, p.y, -p.distance)))
        .forEach((p) => seen.add(p.photo.id));
    }
    expect(seen.size).toBe(layout.length);
  });
});

import {
  getActivePathAtDistance,
  getPathJunctions,
  getPathSegments,
} from "../src/utils/journey";
import { photos as manifestPhotos, romanticPaths } from "../src/data/photos";

describe("interconnected romantic paths and multimedia memories", () => {
  it("groups event memories into their corresponding interconnected paths", () => {
    const layout = generatePhotoLayout(manifestPhotos, 99);
    const segments = getPathSegments(layout);
    expect(segments).toHaveLength(4);
    expect(segments.map((s) => s.pathId)).toEqual([
      "paris-path",
      "taj-path",
      "kyoto-path",
      "venice-path",
    ]);
    for (const seg of segments) {
      expect(seg.memories.length).toBeGreaterThan(0);
      expect(seg.memories.every((m) => m.photo.pathId === seg.pathId)).toBe(
        true,
      );
      expect(
        getActivePathAtDistance(layout, seg.memories[0].distance),
      ).toBe(seg.pathId);
    }
    const junctions = getPathJunctions(layout);
    expect(junctions).toHaveLength(4);
    for (const p of romanticPaths) {
      expect(p.connectedPaths.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("includes photos, short videos, and audio clips with title, description, and time", () => {
    const types = new Set(manifestPhotos.map((p) => p.type ?? "photo"));
    expect(types.has("photo")).toBe(true);
    expect(types.has("video")).toBe(true);
    expect(types.has("audio")).toBe(true);
    for (const item of manifestPhotos) {
      expect(item.title).toBeTruthy();
      expect(item.description).toBeTruthy();
      expect(item.time).toBeTruthy();
      if (item.type === "video") expect(item.videoSrc).toBeTruthy();
      if (item.type === "audio") expect(item.audioSrc).toBeTruthy();
    }
  });
});

import {
  computeMeshPose,
  MESH_BRIDGE_SPANS,
  MESH_NODES,
} from "../src/utils/journey";

describe("single straight Parisian bridge path aligned with Eiffel Tower", () => {
  it("keeps the bridge path straight and centered facing the tower", () => {
    expect(MESH_NODES.length).toBeGreaterThanOrEqual(2);
    expect(MESH_BRIDGE_SPANS).toHaveLength(1);
    for (const d of [0, 5, 22, 45]) {
      const pose = computeMeshPose(d);
      expect(pose.x).toBe(0);
      expect(pose.z).toBe(-d);
      expect(pose.yaw).toBe(0);
    }
  });
});
