import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import type { MemoryPhoto, PlacedMemory } from "../../types/memory";
function PhotoPrint({ src, width }: { src: string; width: number }) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    let cancelled = false;
    let owned: THREE.Texture | undefined;
    new THREE.TextureLoader().load(
      src,
      (t) => {
        owned = t;
        if (cancelled) {
          t.dispose();
          return;
        }
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 4;
        setTexture(t);
      },
      undefined,
      () => {
        if (!cancelled) setTexture(null);
      },
    );
    return () => {
      cancelled = true;
      owned?.dispose();
    };
  }, [src]);
  const image = texture?.image as HTMLImageElement | undefined;
  const ratio = image ? image.width / image.height : 1.45;
  const w = Math.min(width - 0.14, (width * 0.78 - 0.22) * ratio),
    h = w / ratio;
  return (
    <mesh position={[0, 0.05, 0.037]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial
        map={texture}
        color={texture ? "#ffffff" : "#687361"}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
export function HangingPhoto({
  item,
  reduced,
  onSelect,
  enabled,
}: {
  item: PlacedMemory;
  reduced: boolean;
  onSelect: (photo: MemoryPhoto) => void;
  enabled: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const h = item.width * 0.78;
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.z =
        item.rotation +
        (reduced ? 0 : Math.sin(clock.elapsedTime * 0.6 + item.phase) * 0.018);
      ref.current.rotation.y =
        -Math.sign(item.x) * 0.13 +
        (reduced ? 0 : Math.sin(clock.elapsedTime * 0.4 + item.phase) * 0.03);
    }
  });
  useEffect(() => {
    if (hovered && enabled) document.body.style.cursor = "pointer";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hovered, enabled]);
  return (
    <group position={[item.x, item.y, -item.distance]}>
      <Line
        points={[
          [-0.35, item.ropeHeight - item.y, 0],
          [-0.35, h / 2, 0],
        ]}
        color="#9a9072"
        lineWidth={1}
      />
      <Line
        points={[
          [0.35, item.ropeHeight - item.y, 0],
          [0.35, h / 2, 0],
        ]}
        color="#9a9072"
        lineWidth={1}
      />
      <Line
        points={[
          [-item.x - 4, item.ropeHeight - item.y + 0.3, 0],
          [0, item.ropeHeight - item.y, 0],
          [-item.x + 4, item.ropeHeight - item.y + 0.3, 0],
        ]}
        color="#746e51"
        lineWidth={1}
      />
      <group
        ref={ref}
        onClick={(e) => {
          e.stopPropagation();
          if (enabled) onSelect(item.photo);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <mesh>
          <boxGeometry args={[item.width, h, 0.055]} />
          <meshStandardMaterial
            color={hovered && enabled ? "#fff4d4" : "#e4dfcb"}
            emissive="#eacb8e"
            emissiveIntensity={hovered && enabled ? 0.25 : 0.04}
            roughness={0.85}
          />
        </mesh>
        <PhotoPrint
          src={item.photo.thumbnail ?? item.photo.src}
          width={item.width}
        />
        {[-0.35, 0.35].map((x) => (
          <mesh key={x} position={[x, h / 2, 0.055]}>
            <boxGeometry args={[0.06, 0.17, 0.065]} />
            <meshStandardMaterial color="#ae8b55" />
          </mesh>
        ))}
      </group>
    </group>
  );
}
