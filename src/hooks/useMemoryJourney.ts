import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { photos } from "../data/photos";
import {
  generatePhotoLayout,
  journeyLength,
  restoreJourney,
} from "../utils/journey";
import type { JourneySave } from "../types/memory";
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
  const [discovered, setDiscovered] = useState(
    new Set(initial?.discovered ?? []),
  );
  const distance = useRef(initial?.distance ?? 0);
  const target = useRef(initial?.distance ?? 0);
  const [zone, setZone] = useState(Math.floor(distance.current / 8));
  const discover = useCallback(
    (ids: string[]) =>
      setDiscovered((old) => {
        if (ids.every((id) => old.has(id))) return old;
        return new Set([...old, ...ids]);
      }),
    [],
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
    setDiscovered(new Set());
    setSeed(newSeed());
  };
  return {
    layout,
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
