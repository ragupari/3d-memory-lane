import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getPathById, photos } from "../data/photos";
import {
  generatePhotoLayout,
  getActivePathAtDistance,
  getPathJunctions,
  getPathSegments,
  journeyLength,
  restoreJourney,
} from "../utils/journey";
import type { JourneySave, PathId, RomanticThemeId } from "../types/memory";

const KEY = "memory-forest.journey.v1";
const newSeed = () => crypto.getRandomValues(new Uint32Array(1))[0];

export function useMemoryJourney() {
  const [initial] = useState(() => {
    try {
      return restoreJourney(localStorage.getItem(KEY), photos);
    } catch {
      return null;
    }
  });
  const [seed, setSeed] = useState(initial?.seed ?? newSeed);
  const layout = useMemo(() => generatePhotoLayout(photos, seed), [seed]);
  const segments = useMemo(() => getPathSegments(layout), [layout]);
  const junctions = useMemo(() => getPathJunctions(layout), [layout]);
  const [discovered, setDiscovered] = useState(
    new Set(initial?.discovered ?? []),
  );
  const distance = useRef(initial?.distance ?? 0);
  const target = useRef(initial?.distance ?? 0);
  const [zone, setZone] = useState(Math.floor(distance.current / 8));
  const [activePathId, setActivePathId] = useState<PathId>(() =>
    getActivePathAtDistance(layout, distance.current),
  );
  const [themeOverride, setThemeOverride] = useState<RomanticThemeId | "auto">(
    "auto",
  );

  const activePath = useMemo(() => getPathById(activePathId), [activePathId]);
  const activeTheme: RomanticThemeId =
    themeOverride === "auto" ? activePath.theme : themeOverride;

  const discover = useCallback(
    (ids: string[]) =>
      setDiscovered((old) => {
        if (ids.every((id) => old.has(id))) return old;
        return new Set([...old, ...ids]);
      }),
    [],
  );

  const navigateToDistance = useCallback(
    (newDist: number) => {
      const clamped = Math.max(0, Math.min(journeyLength(layout), newDist));
      target.current = clamped;
      setZone(Math.floor(clamped / 8));
      setActivePathId(getActivePathAtDistance(layout, clamped));
    },
    [layout],
  );

  const navigateToPath = useCallback(
    (pathId: PathId) => {
      const seg = segments.find((s) => s.pathId === pathId);
      if (seg) {
        target.current = seg.entryTargetDistance;
        setZone(Math.floor(seg.entryTargetDistance / 8));
        setActivePathId(pathId);
      }
    },
    [segments],
  );

  useEffect(() => {
    const save = () => {
      const value: JourneySave = {
        version: 1,
        seed,
        ids: layout.map((p) => p.photo.id),
        discovered: [...discovered],
        distance: distance.current,
      };
      try {
        localStorage.setItem(KEY, JSON.stringify(value));
      } catch {
        /* Storage is optional. */
      }
    };
    const interval = window.setInterval(save, 1500);
    window.addEventListener("pagehide", save);
    return () => {
      save();
      clearInterval(interval);
      window.removeEventListener("pagehide", save);
    };
  }, [seed, layout, discovered]);

  const restart = () => {
    distance.current = 0;
    target.current = 0;
    setZone(0);
    setActivePathId("paris-path");
    setDiscovered(new Set());
    setSeed(newSeed());
  };

  return {
    layout,
    segments,
    junctions,
    activePathId,
    setActivePathId,
    activePath,
    activeTheme,
    themeOverride,
    setThemeOverride,
    navigateToPath,
    navigateToDistance,
    discovered,
    discover,
    distance,
    target,
    zone,
    setZone,
    restart,
    length: journeyLength(layout),
    resumed: Boolean(initial?.distance),
  };
}
