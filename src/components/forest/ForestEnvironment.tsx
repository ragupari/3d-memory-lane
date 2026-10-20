import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Line, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { seededRandom } from "../../utils/journey";
import { RomanticLandmarks } from "./RomanticLandmarks";

type Instance = {
  position: [number, number, number];
  scale: [number, number, number];
  rotation?: [number, number, number];
  color: string;
};

function Instances({
  items,
  kind,
}: {
  items: Instance[];
  kind: "trunk" | "leaf" | "star";
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const o = new THREE.Object3D();
    items.forEach((p, i) => {
      o.position.set(...p.position);
      o.scale.set(...p.scale);
      o.rotation.set(...(p.rotation ?? [0, 0, 0]));
      o.updateMatrix();
      ref.current!.setMatrixAt(i, o.matrix);
      ref.current!.setColorAt(i, new THREE.Color(p.color));
    });
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  }, [items]);
  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, items.length]}
      frustumCulled={false}
    >
      {kind === "trunk" ? (
        <cylinderGeometry args={[0.42, 0.65, 1, 7]} />
      ) : kind === "leaf" ? (
        <icosahedronGeometry args={[1, 1]} />
      ) : (
        <octahedronGeometry args={[1, 0]} />
      )}
      {kind === "star" ? (
        <meshBasicMaterial fog={false} />
      ) : (
        <meshStandardMaterial roughness={0.78} flatShading />
      )}
    </instancedMesh>
  );
}

/**
 * Small ornamental riverbank trees kept far out to the sides (|x| = 8.5..20.5)
 * so they never interfere with the hanging photos, videos, or audio clips
 * and never obstruct the view of the Eiffel Tower straight ahead.
 * No flowers included.
 */
function ParisianBridgeTreeChunk({ index }: { index: number }) {
  const objects = useMemo(() => {
    const r = seededRandom(index * 237 + 809);
    const trunks: Instance[] = [],
      leaves: Instance[] = [];

    const leafPalette = ["#144532", "#1e6340", "#297a48", "#3b9454"];

    for (let i = 0; i < 24; i++) {
      const side = i % 2 ? -1 : 1;
      const x = side * (8.5 + r() * 12),
        z = -r() * 24,
        h = 1.9 + r() * 1.2,
        radius = 0.1 + r() * 0.12;

      trunks.push({
        position: [x, h / 2 - 0.6, z],
        scale: [radius, h, radius],
        rotation: [r() * 0.04, 0, side * r() * 0.05],
        color: "#2b211b",
      });

      for (let l = 0; l < 4; l++) {
        const lx = x + (r() - 0.5) * 0.9;
        const ly = h - 0.3 + l * 0.32 + r() * 0.25;
        const lz = z + (r() - 0.5) * 0.9;
        leaves.push({
          position: [lx, ly, lz],
          scale: [0.55 + r() * 0.45, 0.45 + r() * 0.35, 0.55 + r() * 0.45],
          rotation: [r() * 0.5, r() * 0.5, r() * 0.5],
          color: leafPalette[l % leafPalette.length],
        });
      }
    }
    return { trunks, leaves };
  }, [index]);

  return (
    <group position={[0, 0, -index * 24]}>
      <Instances items={objects.trunks} kind="trunk" />
      <Instances items={objects.leaves} kind="leaf" />
    </group>
  );
}

/**
 * Starry night sky canopy above the bridge and Eiffel Tower
 */
function NightSkyStars() {
  const stars = useMemo<Instance[]>(() => {
    const r = seededRandom(4411);
    const palette = ["#ffffff", "#fff7cc", "#ffe89e", "#dceaff"];
    return Array.from({ length: 340 }, (_, i) => {
      const x = (r() - 0.5) * 140;
      const y = 6.5 + r() * 48;
      const z = 18 - r() * 105;
      const s = 0.06 + r() * 0.13;
      return {
        position: [x, y, z],
        scale: [s, s, s],
        rotation: [r() * Math.PI, r() * Math.PI, r() * Math.PI],
        color: palette[i % palette.length],
      };
    });
  }, []);

  return <Instances items={stars} kind="star" />;
}

/**
 * Randomized fairy-light line strung directly between left and right bridge lanterns
 * (anchored at x = ±2.72, y = 3.18, z = -0.5 - 7 * n so lines never hang from the sky).
 */
function LanternLightString({ lanternIndex }: { lanternIndex: number }) {
  const { pts, bulbs } = useMemo(() => {
    const r = seededRandom(lanternIndex * 313 + 79);
    const zLeft = -0.5 - lanternIndex * 7;
    // Randomly connect to opposite, prior, or next lantern on the right side
    const rightStep = r() < 0.36 ? -1 : r() > 0.68 ? 1 : 0;
    const zRight = -0.5 - (lanternIndex + rightStep) * 7;
    const sag = 0.34 + r() * 0.42;
    const segments = 12;

    const linePts = Array.from({ length: segments + 1 }, (_, i) => {
      const t = i / segments;
      return new THREE.Vector3(
        -2.72 + t * 5.44,
        3.18 - Math.sin(t * Math.PI) * sag,
        THREE.MathUtils.lerp(zLeft, zRight, t),
      );
    });

    const bulbPts = linePts.filter(
      (_, i) => i > 0 && i < segments && (i % 2 === 1 || r() > 0.45),
    );
    return { pts: linePts, bulbs: bulbPts };
  }, [lanternIndex]);

  return (
    <group>
      <Line points={pts} color="#3a2c1d" lineWidth={1.1} />
      {bulbs.map((p, i) => (
        <mesh key={i} position={[p.x, p.y - 0.035, p.z]}>
          <sphereGeometry args={[0.048, 8, 8]} />
          <meshBasicMaterial color={i % 2 === 0 ? "#fff3a6" : "#ffd257"} />
        </mesh>
      ))}
    </group>
  );
}

export function ForestEnvironment({
  zone,
  reduced,
  maxDistance,
}: {
  zone: number;
  reduced: boolean;
  maxDistance?: number;
}) {
  const { size } = useThree();
  const center = Math.floor(zone / 3);
  const waterAndSkyRef = useRef<THREE.Group>(null);

  useFrame(({ camera }) => {
    if (waterAndSkyRef.current) {
      waterAndSkyRef.current.position.z = camera.position.z;
    }
  });

  // Lantern index around the current zone (each lantern is spaced 7m apart)
  const baseLanternIdx = Math.floor((zone * 8) / 7);

  return (
    <>
      {/* Starry Parisian Night Sky & Deep Midnight Horizon */}
      <color attach="background" args={["#090d1a"]} />
      <fog attach="fog" args={["#0f172a", 34, 96]} />
      <hemisphereLight args={["#fef0ba", "#182238", 1.15]} />
      <ambientLight intensity={0.48} />
      <directionalLight
        position={[-12, 22, -16]}
        color="#ffe89e"
        intensity={1.65}
      />

      {/* Midnight River Seine & Starry Night Sky Canopy Moving with Camera */}
      <group ref={waterAndSkyRef}>
        <NightSkyStars />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.95, -40]}>
          <planeGeometry args={[180, 220]} />
          <meshStandardMaterial
            color="#0b162c"
            emissive="#241c0c"
            emissiveIntensity={0.28}
            roughness={0.18}
            metalness={0.55}
          />
        </mesh>
      </group>

      {/* Single Straight Parisian Stone Bridge, Fireflies, Tiny Glowing Butterfly, Kneeling Boy at End & Shining Brown/Black Eiffel Tower */}
      <RomanticLandmarks maxDistance={maxDistance} />

      {/* Random Strings of Golden Fairy Lights Connected Strictly Between Bridge Lanterns */}
      {Array.from({ length: 12 }, (_, i) => baseLanternIdx + i - 2).map((idx) => (
        <LanternLightString key={idx} lanternIndex={idx} />
      ))}

      {/* Small Far-Side Trees (Kept Far Out at |x| = 8.5..20.5, No Flowers) */}
      {Array.from({ length: 5 }, (_, i) => center + i - 1).map((i) => (
        <ParisianBridgeTreeChunk key={i} index={i} />
      ))}

      {!reduced && (
        <Sparkles
          count={size.width < 700 ? 55 : 110}
          scale={[22, 10, 75]}
          position={[0, 3.8, -zone * 8 - 18]}
          size={2.4}
          speed={0.2}
          opacity={0.85}
          color="#ffe885"
        />
      )}
    </>
  );
}

