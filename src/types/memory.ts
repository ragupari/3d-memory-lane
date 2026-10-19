export interface MemoryPhoto {
  id: string;
  src: string;
  thumbnail?: string;
  title?: string;
  caption?: string;
  date?: string;
  location?: string;
}
export interface PlacedMemory {
  photo: MemoryPhoto;
  distance: number;
  x: number;
  y: number;
  width: number;
  rotation: number;
  phase: number;
  ropeHeight: number;
}
export interface JourneySave {
  version: 1;
  seed: number;
  ids: string[];
  discovered: string[];
  distance: number;
}
