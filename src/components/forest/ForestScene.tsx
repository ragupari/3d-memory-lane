import { Component, Suspense, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import { ForestEnvironment } from "./ForestEnvironment";
import { HangingPhoto } from "./HangingPhoto";
import { CameraController, type NavigationState } from "./CameraController";
import type { MemoryPhoto } from "../../types/memory";

class SceneBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  componentDidCatch() {
    this.props.onFailure();
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default function ForestScene({
  nav,
  unlocked,
  active,
  auto,
  reduced,
  onSelect,
  onEnd,
  onReady,
  onFailure,
  fallback,
}: {
  nav: NavigationState;
  unlocked: boolean;
  active: boolean;
  auto: boolean;
  reduced: boolean;
  onSelect: (p: MemoryPhoto) => void;
  onEnd: () => void;
  onReady: () => void;
  onFailure: () => void;
  fallback: ReactNode;
}) {
  const [dpr, setDpr] = useState(window.innerWidth < 700 ? 1 : 1.5);
  return (
    <SceneBoundary fallback={fallback} onFailure={onFailure}>
      <Canvas
        camera={{ position: [0, 1.75, 2], fov: 64, near: 0.1, far: 110 }}
        dpr={dpr}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        fallback={fallback}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", onFailure, {
            once: true,
          });
          gl.domElement.setAttribute(
            "aria-label",
            "Pont d'Amour Parisian Bridge. Use the controls below to stroll along the bridge and inspect nearby memories.",
          );
          onReady();
        }}
      >
        <PerformanceMonitor onDecline={() => setDpr(1)}>
          <AdaptiveDpr pixelated />
        </PerformanceMonitor>
        <ForestEnvironment
          zone={nav.zone}
          reduced={reduced}
          maxDistance={nav.length}
        />
        <CameraController
          nav={nav}
          active={active}
          auto={auto}
          reduced={reduced}
          onEnd={onEnd}
        />
        {unlocked && (
          <Suspense fallback={null}>
            {nav.layout
              .filter(
                (p) =>
                  p.distance > nav.zone * 8 - 12 &&
                  p.distance < nav.zone * 8 + 45,
              )
              .map((item) => (
                <HangingPhoto
                  key={item.photo.id}
                  item={item}
                  reduced={reduced}
                  onSelect={onSelect}
                  enabled={active}
                />
              ))}
          </Suspense>
        )}
      </Canvas>
    </SceneBoundary>
  );
}
