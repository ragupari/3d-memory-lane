export type MemoryMediaType = "photo" | "video" | "audio";

export type PathId =
  | "paris-path"
  | "taj-path"
  | "kyoto-path"
  | "venice-path";

export type RomanticThemeId =
  | "eiffel-tower"
  | "taj-mahal"
  | "kyoto-blossoms"
  | "venice-sunset";

export interface MemoryPhoto {
  id: string;
  src: string;
  thumbnail?: string;
  title?: string;
  caption?: string;
  description?: string;
  time?: string;
  date?: string;
  location?: string;
  type?: MemoryMediaType;
  videoSrc?: string;
  audioSrc?: string;
  duration?: string;
  pathId?: PathId;
  event?: string;
}

export interface PathDefinition {
  id: PathId;
  name: string;
  shortName: string;
  event: string;
  subtitle: string;
  theme: RomanticThemeId;
  landmarkName: string;
  connectedPaths: PathId[];
  accentColor: string;
  turnDirection: "straight" | "left" | "right";
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
  pathId: PathId;
  worldX: number;
  worldZ: number;
  worldYaw: number;
}

export interface MeshNode {
  id: string;
  label: string;
  x: number;
  z: number;
  connectedPaths: PathId[];
}

export interface MeshBridgeSpan {
  id: string;
  pathId?: PathId;
  from: [number, number];
  to: [number, number];
  label: string;
}

export interface PathJunction {
  id: string;
  distance: number;
  worldX: number;
  worldZ: number;
  fromPath: PathId;
  leftPath: PathId;
  straightPath: PathId;
  rightPath: PathId;
  nextPath: PathId;
  label: string;
}

export interface JourneySave {
  version: 1;
  seed: number;
  ids: string[];
  discovered: string[];
  distance: number;
}
