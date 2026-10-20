import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, Vector3, Frustum, Matrix4, PerspectiveCamera } from "three";
import { visibleMemories } from "../../utils/journey";
import type { PlacedMemory } from "../../types/memory";

export interface NavigationState {
  distance: React.RefObject<number>;
  target: React.RefObject<number>;
  length: number;
  zone: number;
  setZone: (zone: number) => void;
  layout: PlacedMemory[];
  discover: (ids: string[]) => void;
}

export function CameraController({
  nav,
  active,
  auto,
  reduced,
  onEnd,
}: {
  nav: NavigationState;
  active: boolean;
  auto: boolean;
  reduced: boolean;
  onEnd: () => void;
}) {
  const { gl, camera, size } = useThree();
  useEffect(() => {
    const c = camera as PerspectiveCamera;
    c.fov = size.width < 600 ? 88 : 64;
    c.updateProjectionMatrix();
  }, [camera, size.width]);

  const keys = useRef(new Set<string>());
  const look = useRef({ x: 0, y: 0 });
  const lastCheck = useRef(0);
  const frustum = useRef(new Frustum());
  const matrix = useRef(new Matrix4());
  const point = useRef(new Vector3());

  useEffect(() => {
    if (!active) {
      keys.current.clear();
      nav.target.current = nav.distance.current;
      return;
    }
    const element = gl.domElement;
    let touch: { x: number; y: number } | null = null;
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      nav.target.current = MathUtils.clamp(
        nav.target.current +
          MathUtils.clamp(e.deltaY * (e.deltaMode === 1 ? 16 : 1), -140, 140) *
            0.012,
        0,
        nav.length,
      );
    };
    const down = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("dialog,input,textarea,select"))
        return;
      if (["w", "s", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        keys.current.add(e.key);
      }
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key);
    const clear = () => {
      keys.current.clear();
      nav.target.current = nav.distance.current;
    };
    const pointer = (e: PointerEvent) => {
      if (e.pointerType === "mouse" || e.pointerType === "pen") {
        const nx = e.clientX / innerWidth - 0.5;
        const ny = e.clientY / innerHeight - 0.5;
        look.current.x = nx * 0.42;
        // Pointing up (ny < 0) tilts camera upward up to ~42° so the top of the Eiffel Tower is in full view
        look.current.y = ny < 0 ? ny * 1.48 : ny * 0.32;
      }
    };
    const touchStart = (e: TouchEvent) => {
      touch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const touchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!touch) return;
      const t = e.touches[0];
      const dy = touch.y - t.clientY,
        dx = t.clientX - touch.x;
      if (Math.abs(dy) > Math.abs(dx))
        nav.target.current = MathUtils.clamp(
          nav.target.current + dy * 0.025,
          0,
          nav.length,
        );
      else
        look.current.x = MathUtils.clamp(
          look.current.x - dx * 0.003,
          -0.35,
          0.35,
        );
      touch = { x: t.clientX, y: t.clientY };
    };
    element.addEventListener("wheel", wheel, { passive: false });
    element.addEventListener("pointermove", pointer);
    element.addEventListener("touchstart", touchStart, { passive: true });
    element.addEventListener("touchmove", touchMove, { passive: false });
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    document.addEventListener("visibilitychange", clear);
    return () => {
      element.removeEventListener("wheel", wheel);
      element.removeEventListener("pointermove", pointer);
      element.removeEventListener("touchstart", touchStart);
      element.removeEventListener("touchmove", touchMove);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
      document.removeEventListener("visibilitychange", clear);
    };
  }, [active, gl, nav]);

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const previous = nav.distance.current;
    if (active && !document.hidden) {
      const forward = keys.current.has("w") || keys.current.has("ArrowUp"),
        backward = keys.current.has("s") || keys.current.has("ArrowDown");
      if (auto || forward || backward)
        nav.target.current = MathUtils.clamp(
          nav.target.current +
            ((auto || forward ? 1 : 0) - (backward ? 1 : 0)) * dt * 2.2,
          0,
          nav.length,
        );
      nav.distance.current = MathUtils.damp(
        previous,
        nav.target.current,
        reduced ? 12 : 4,
        dt,
      );
    }
    const d = nav.distance.current;
    camera.position.set(
      Math.sin(d * 0.055) * 0.14,
      1.75 + (reduced ? 0 : Math.sin(d * 2.3) * 0.014),
      2 - d,
    );
    camera.rotation.order = "YXZ";
    if (active) {
      camera.rotation.y = MathUtils.damp(
        camera.rotation.y,
        -look.current.x,
        3,
        dt,
      );
      camera.rotation.x = MathUtils.damp(
        camera.rotation.x,
        -look.current.y,
        3,
        dt,
      );
    }
    if (active && clock.elapsedTime - lastCheck.current > 0.15) {
      lastCheck.current = clock.elapsedTime;
      const zone = Math.floor(d / 8);
      if (zone !== nav.zone) nav.setZone(zone);
      camera.updateMatrixWorld();
      frustum.current.setFromProjectionMatrix(
        matrix.current.multiplyMatrices(
          camera.projectionMatrix,
          camera.matrixWorldInverse,
        ),
      );
      const visible = visibleMemories(nav.layout, d).filter((p) =>
        frustum.current.containsPoint(point.current.set(p.x, p.y, -p.distance)),
      );
      nav.discover(visible.map((p) => p.photo.id));
      if (nav.length > 0 && d >= nav.length - 0.18) onEnd();
    }
  });
  return null;
}
