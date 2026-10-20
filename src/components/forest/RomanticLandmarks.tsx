import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { seededRandom } from "../../utils/journey";

function ParisianStreetlamp({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      {/* Stone Pedestal Plinth */}
      <mesh position={[0, 0.44, 0]}>
        <boxGeometry args={[0.72, 0.88, 0.72]} />
        <meshStandardMaterial color="#2a2d3d" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.91, 0]}>
        <boxGeometry args={[0.82, 0.12, 0.82]} />
        <meshStandardMaterial color="#4a4859" roughness={0.6} />
      </mesh>

      {/* Ornate Black Wrought-Iron Lamp Base */}
      <mesh position={[0, 1.16, 0]}>
        <cylinderGeometry args={[0.16, 0.25, 0.4, 8]} />
        <meshStandardMaterial color="#12141c" roughness={0.35} />
      </mesh>
      {/* Fluted Lamp Post */}
      <mesh position={[0, 2.22, 0]}>
        <cylinderGeometry args={[0.055, 0.088, 1.8, 8]} />
        <meshStandardMaterial color="#12141c" roughness={0.35} />
      </mesh>
      {/* Lantern Support Collar (y = 3.18 anchor for lantern-to-lantern light lines) */}
      <mesh position={[0, 3.14, 0]}>
        <cylinderGeometry args={[0.15, 0.065, 0.12, 6]} />
        <meshStandardMaterial color="#12141c" />
      </mesh>
      {/* Glowing Light-Yellow & Golden Lantern Glass */}
      <mesh position={[0, 3.42, 0]}>
        <cylinderGeometry args={[0.22, 0.15, 0.46, 6]} />
        <meshBasicMaterial color="#ffdf78" fog={false} />
      </mesh>
      {/* Outer Soft Golden Glow Halo */}
      <mesh position={[0, 3.42, 0]}>
        <sphereGeometry args={[0.38, 10, 10]} />
        <meshBasicMaterial
          color="#ffd25a"
          transparent
          opacity={0.18}
          depthWrite={false}
          fog={false}
        />
      </mesh>
      {/* Inner Bright Flame Core */}
      <mesh position={[0, 3.42, 0]}>
        <sphereGeometry args={[0.11, 8, 8]} />
        <meshBasicMaterial color="#fffbe0" fog={false} />
      </mesh>
      {/* Lantern Top Cap & Finial */}
      <mesh position={[0, 3.73, 0]}>
        <coneGeometry args={[0.26, 0.24, 6]} />
        <meshStandardMaterial color="#12141c" roughness={0.35} />
      </mesh>
      <mesh position={[0, 3.9, 0]}>
        <sphereGeometry args={[0.048, 6, 6]} />
        <meshStandardMaterial color="#12141c" />
      </mesh>
    </group>
  );
}

function SingleBridgeSegment({ zOffset }: { zOffset: number }) {
  const segLength = 56;
  const lampCount = 8;
  const balusterCount = 56;

  return (
    <group position={[0, 0, zOffset]}>
      {/* Night-Lit Warm Stone Bridge Walkway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[4.5, segLength]} />
        <meshStandardMaterial color="#383442" roughness={0.82} />
      </mesh>

      {/* Subtle Golden Lantern Reflection Strip on Center Bridge Stone */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.024, 0]}>
        <planeGeometry args={[2.3, segLength]} />
        <meshStandardMaterial
          color="#4a4352"
          emissive="#ffd670"
          emissiveIntensity={0.06}
          roughness={0.7}
        />
      </mesh>

      {/* Raised Stone Sidewalks / Curbs on Left & Right */}
      {[-2.42, 2.42].map((sx) => (
        <mesh key={`curb-${sx}`} position={[sx, 0.06, 0]}>
          <boxGeometry args={[0.58, 0.12, segLength]} />
          <meshStandardMaterial color="#4d4859" roughness={0.65} />
        </mesh>
      ))}

      {/* Classical Carved Stone Balustrade Railings on Left & Right */}
      {[-2.72, 2.72].map((bx) => (
        <group key={`balustrade-${bx}`} position={[bx, 0, 0]}>
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[0.34, 0.22, segLength]} />
            <meshStandardMaterial color="#282633" roughness={0.75} />
          </mesh>
          <mesh position={[0, 0.8, 0]}>
            <boxGeometry args={[0.38, 0.13, segLength]} />
            <meshStandardMaterial color="#575163" roughness={0.65} />
          </mesh>
          {Array.from({ length: balusterCount }, (_, bi) => {
            const bz =
              -segLength / 2 + ((bi + 0.5) / balusterCount) * segLength;
            return (
              <mesh key={`bal-${bi}`} position={[0, 0.5, bz]}>
                <cylinderGeometry args={[0.068, 0.09, 0.48, 8]} />
                <meshStandardMaterial color="#3f3b4a" roughness={0.7} />
              </mesh>
            );
          })}
        </group>
      ))}

      {/* Ornate Parisian Streetlamps Along Bridge */}
      {Array.from({ length: lampCount }, (_, li) => {
        const lz = -segLength / 2 + ((li + 0.5) / lampCount) * segLength;
        return (
          <group key={`lamps-${li}`}>
            <ParisianStreetlamp position={[-2.72, 0, lz]} />
            <ParisianStreetlamp position={[2.72, 0, lz]} />
          </group>
        );
      })}
    </group>
  );
}

function EiffelTowerNightVista() {
  const beaconRef = useRef<THREE.Group>(null);
  const sparklesRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (beaconRef.current) {
      beaconRef.current.rotation.y = t * 0.5;
    }
    if (sparklesRef.current) {
      sparklesRef.current.children.forEach((child, idx) => {
        const s = 0.75 + 0.45 * Math.sin(t * 4.5 + idx * 1.9);
        child.scale.setScalar(s);
      });
    }
  });

  // Crisp X-lattice truss lines in pure Black
  const xBraceLines = useMemo(() => {
    const segments: [THREE.Vector3, THREE.Vector3][] = [];
    const tiers = 9;
    for (let i = 0; i < tiers; i++) {
      const y0 = 11.2 + i * 1.05;
      const y1 = y0 + 1.05;
      const w0 = Math.max(0.32, 1.35 - i * 0.11);
      const w1 = Math.max(0.26, 1.35 - (i + 1) * 0.11);
      const zFace = w0 * 0.85;
      segments.push([
        new THREE.Vector3(-w0, y0, zFace),
        new THREE.Vector3(w1, y1, zFace),
      ]);
      segments.push([
        new THREE.Vector3(w0, y0, zFace),
        new THREE.Vector3(-w1, y1, zFace),
      ]);
      segments.push([
        new THREE.Vector3(-w0, y0, zFace),
        new THREE.Vector3(w0, y0, zFace),
      ]);
    }
    const legTiers = [
      { y0: 0.8, y1: 2.5, xl0: -3.2, xl1: -1.8, wl0: -2.6, wl1: -1.5 },
      { y0: 2.5, y1: 4.2, xl0: -2.6, xl1: -1.5, wl0: -2.0, wl1: -1.2 },
      { y0: 4.2, y1: 5.5, xl0: -2.0, xl1: -1.2, wl0: -1.6, wl1: -0.95 },
      { y0: 6.2, y1: 8.2, xl0: -1.55, xl1: -0.75, wl0: -1.25, wl1: -0.55 },
      { y0: 8.2, y1: 10.2, xl0: -1.25, xl1: -0.55, wl0: -0.98, wl1: -0.4 },
    ];
    for (const lt of legTiers) {
      for (const side of [-1, 1]) {
        const a0 = lt.xl0 * side;
        const b0 = lt.xl1 * side;
        const a1 = lt.wl0 * side;
        const b1 = lt.wl1 * side;
        segments.push([
          new THREE.Vector3(a0, lt.y0, 1.8),
          new THREE.Vector3(b1, lt.y1, 1.4),
        ]);
        segments.push([
          new THREE.Vector3(b0, lt.y0, 1.8),
          new THREE.Vector3(a1, lt.y1, 1.4),
        ]);
      }
    }
    return segments;
  }, []);

  // Twinkling light-yellow / golden bulbs distributed across the tower
  const goldenLights = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i < 48; i++) {
      const y = 1.2 + (i / 48) * 19.5;
      const spread =
        y < 5.5
          ? 2.6 - (y / 5.5) * 1.1
          : y < 10.8
            ? 1.4 - ((y - 5.5) / 5.3) * 0.55
            : Math.max(0.25, 0.85 - ((y - 10.8) / 10) * 0.6);
      const side = i % 2 === 0 ? -1 : 1;
      const x = side * spread * (0.4 + ((i * 7) % 10) / 15);
      pts.push([x, y, 1.4]);
    }
    return pts;
  }, []);

  const legOffsets: [number, number][] = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ];

  // Strictly Brown and Black colors for the Eiffel Tower structure, shining with Golden/Light-Yellow illumination
  const TOWER_BROWN_LIGHT = "#6b472a";
  const TOWER_BROWN_DARK = "#452c19";
  const TOWER_BLACK = "#14110f";
  const GOLD_SHINE = "#ffe47a";
  const LIGHT_YELLOW = "#fff6b0";

  return (
    <group position={[0, -0.35, 0]} scale={[1.45, 1.45, 1.45]}>
      {/* Golden Night Reflections on the Seine Water Pool at Foot of Tower */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 8.5]}>
        <planeGeometry args={[14, 9]} />
        <meshBasicMaterial color="#101f3b" fog={false} />
      </mesh>
      {[6.5, 8.0, 9.5, 11.0].map((rz, idx) => (
        <mesh
          key={`ripple-${idx}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.08, rz]}
        >
          <planeGeometry args={[3.8 - idx * 0.4, 0.2]} />
          <meshBasicMaterial color={GOLD_SHINE} fog={false} />
        </mesh>
      ))}

      {/* Distant Arched River Bridge at Base of Eiffel Tower */}
      <group position={[0, 0.35, 5.2]}>
        <mesh position={[-5.2, 0.7, 0]}>
          <boxGeometry args={[4.6, 1.6, 1.6]} />
          <meshBasicMaterial color={TOWER_BLACK} fog={false} />
        </mesh>
        <mesh position={[5.2, 0.7, 0]}>
          <boxGeometry args={[4.6, 1.6, 1.6]} />
          <meshBasicMaterial color={TOWER_BLACK} fog={false} />
        </mesh>
        <mesh position={[0, 1.55, 0]}>
          <boxGeometry args={[15, 0.38, 1.7]} />
          <meshBasicMaterial color={TOWER_BROWN_DARK} fog={false} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <torusGeometry args={[2.95, 0.36, 10, 32, Math.PI]} />
          <meshBasicMaterial color={TOWER_BROWN_LIGHT} fog={false} />
        </mesh>
      </group>

      {/* Warm Golden Night Glow Aura Behind the Eiffel Tower */}
      <mesh position={[0, 11.5, -1.5]}>
        <sphereGeometry args={[9.5, 24, 24]} />
        <meshBasicMaterial
          color="#ffd86b"
          transparent
          opacity={0.14}
          depthWrite={false}
          fog={false}
        />
      </mesh>
      <mesh position={[0, 14.5, -1.2]}>
        <sphereGeometry args={[5.5, 20, 20]} />
        <meshBasicMaterial
          color="#fff29c"
          transparent
          opacity={0.18}
          depthWrite={false}
          fog={false}
        />
      </mesh>

      {/* === EIFFEL TOWER LOWER SECTION (Brown & Black with Golden Shine) === */}
      {legOffsets.map(([sx, sz], i) => (
        <group key={`leg1-${i}`}>
          {/* Outer Leg Rib (Warm Brown Shining in Golden Light) */}
          <mesh
            position={[sx * 2.55, 2.9, sz * 2.2]}
            rotation={[sz * 0.25, 0, -sx * 0.28]}
          >
            <cylinderGeometry args={[0.38, 0.72, 5.6, 4]} />
            <meshStandardMaterial
              color={sx < 0 ? TOWER_BROWN_LIGHT : TOWER_BROWN_DARK}
              emissive={GOLD_SHINE}
              emissiveIntensity={0.42}
              roughness={0.45}
              fog={false}
            />
          </mesh>
          {/* Inner Leg Rib (Pure Black Iron) */}
          <mesh
            position={[sx * 1.95, 2.9, sz * 1.8]}
            rotation={[sz * 0.22, 0, -sx * 0.24]}
          >
            <cylinderGeometry args={[0.18, 0.32, 5.5, 4]} />
            <meshStandardMaterial
              color={TOWER_BLACK}
              emissive={GOLD_SHINE}
              emissiveIntensity={0.18}
              fog={false}
            />
          </mesh>
        </group>
      ))}

      {/* Iconic Semicircular Base Arch Between Legs (Black & Brown with Golden Trim) */}
      <mesh position={[0, 0.95, 1.9]}>
        <torusGeometry args={[2.15, 0.2, 10, 32, Math.PI]} />
        <meshStandardMaterial
          color={TOWER_BLACK}
          emissive={GOLD_SHINE}
          emissiveIntensity={0.25}
          fog={false}
        />
      </mesh>
      <mesh position={[0, 0.95, 1.9]}>
        <torusGeometry args={[2.38, 0.1, 8, 32, Math.PI]} />
        <meshStandardMaterial
          color={TOWER_BROWN_LIGHT}
          emissive={LIGHT_YELLOW}
          emissiveIntensity={0.55}
          fog={false}
        />
      </mesh>

      {/* === FIRST OBSERVATION PLATFORM (Black & Brown Shining in Gold) === */}
      <mesh position={[0, 5.55, 0]}>
        <boxGeometry args={[5.1, 0.42, 4.4]} />
        <meshStandardMaterial
          color={TOWER_BLACK}
          emissive={GOLD_SHINE}
          emissiveIntensity={0.22}
          fog={false}
        />
      </mesh>
      <mesh position={[0, 5.82, 0]}>
        <boxGeometry args={[5.35, 0.2, 4.6]} />
        <meshStandardMaterial
          color={TOWER_BROWN_LIGHT}
          emissive={LIGHT_YELLOW}
          emissiveIntensity={0.7}
          fog={false}
        />
      </mesh>
      <mesh position={[0, 5.28, 0]}>
        <boxGeometry args={[4.75, 0.16, 4.1]} />
        <meshStandardMaterial
          color={TOWER_BROWN_DARK}
          emissive={GOLD_SHINE}
          emissiveIntensity={0.5}
          fog={false}
        />
      </mesh>

      {/* === EIFFEL TOWER MIDDLE SECTION === */}
      {legOffsets.map(([sx, sz], i) => (
        <mesh
          key={`leg2-${i}`}
          position={[sx * 1.28, 8.2, sz * 1.15]}
          rotation={[sz * 0.17, 0, -sx * 0.18]}
        >
          <cylinderGeometry args={[0.26, 0.46, 5.1, 4]} />
          <meshStandardMaterial
            color={sx < 0 ? TOWER_BROWN_LIGHT : TOWER_BROWN_DARK}
            emissive={GOLD_SHINE}
            emissiveIntensity={0.46}
            roughness={0.45}
            fog={false}
          />
        </mesh>
      ))}
      <mesh position={[0, 8.3, 0]}>
        <boxGeometry args={[3.35, 0.24, 2.9]} />
        <meshStandardMaterial
          color={TOWER_BLACK}
          emissive={GOLD_SHINE}
          emissiveIntensity={0.3}
          fog={false}
        />
      </mesh>

      {/* === SECOND OBSERVATION PLATFORM === */}
      <mesh position={[0, 10.65, 0]}>
        <boxGeometry args={[2.95, 0.38, 2.6]} />
        <meshStandardMaterial
          color={TOWER_BLACK}
          emissive={GOLD_SHINE}
          emissiveIntensity={0.25}
          fog={false}
        />
      </mesh>
      <mesh position={[0, 10.9, 0]}>
        <boxGeometry args={[3.15, 0.18, 2.75]} />
        <meshStandardMaterial
          color={TOWER_BROWN_LIGHT}
          emissive={LIGHT_YELLOW}
          emissiveIntensity={0.75}
          fog={false}
        />
      </mesh>
      <mesh position={[0, 11.2, 0]}>
        <boxGeometry args={[2.45, 0.32, 2.2]} />
        <meshStandardMaterial
          color={TOWER_BROWN_DARK}
          emissive={GOLD_SHINE}
          emissiveIntensity={0.45}
          fog={false}
        />
      </mesh>

      {/* === EIFFEL TOWER UPPER TAPERED LATTICE SHAFT (Brown & Black with Golden Glow) === */}
      <mesh position={[0, 15.9, 0]}>
        <cylinderGeometry args={[0.42, 1.24, 9.4, 4]} />
        <meshStandardMaterial
          color={TOWER_BROWN_DARK}
          emissive={GOLD_SHINE}
          emissiveIntensity={0.48}
          roughness={0.45}
          fog={false}
        />
      </mesh>
      <mesh position={[-0.24, 15.9, 0.12]}>
        <cylinderGeometry args={[0.24, 0.76, 9.3, 4]} />
        <meshStandardMaterial
          color={TOWER_BROWN_LIGHT}
          emissive={LIGHT_YELLOW}
          emissiveIntensity={0.62}
          roughness={0.4}
          fog={false}
        />
      </mesh>

      {/* Horizontal Black Iron Bracing Rings Along Upper Spire */}
      {[12.2, 13.3, 14.4, 15.5, 16.6, 17.7, 18.8, 19.8].map((y, idx) => {
        const w = Math.max(0.68, 2.1 - idx * 0.18);
        return (
          <mesh key={`ring-${idx}`} position={[0, y, 0]}>
            <boxGeometry args={[w, 0.14, w]} />
            <meshBasicMaterial color={TOWER_BLACK} fog={false} />
          </mesh>
        );
      })}

      {/* Crisp Jet-Black X-Brace Lattice Trusses */}
      {xBraceLines.map((pts, idx) => (
        <Line
          key={`xbrace-${idx}`}
          points={pts}
          color={TOWER_BLACK}
          lineWidth={1.45}
        />
      ))}

      {/* === SUMMIT CUPOLA LANTERN, GOLDEN BEACON & TALL NEEDLE SPIRE === */}
      <mesh position={[0, 20.6, 0]}>
        <boxGeometry args={[1.15, 0.28, 1.15]} />
        <meshStandardMaterial
          color={TOWER_BROWN_LIGHT}
          emissive={LIGHT_YELLOW}
          emissiveIntensity={0.8}
          fog={false}
        />
      </mesh>
      <mesh position={[0, 21.05, 0]}>
        <cylinderGeometry args={[0.52, 0.62, 0.75, 12]} />
        <meshBasicMaterial color={TOWER_BLACK} fog={false} />
      </mesh>
      <mesh position={[0, 21.6, 0]} scale={[1, 1.25, 1]}>
        <sphereGeometry args={[0.54, 16, 14]} />
        <meshStandardMaterial
          color={TOWER_BROWN_LIGHT}
          emissive={LIGHT_YELLOW}
          emissiveIntensity={0.9}
          fog={false}
        />
      </mesh>
      <mesh position={[0, 23.9, 0]}>
        <cylinderGeometry args={[0.025, 0.11, 3.8, 8]} />
        <meshBasicMaterial color={TOWER_BLACK} fog={false} />
      </mesh>

      {/* Rotating Light-Yellow Summit Searchlight Beacon */}
      <group ref={beaconRef} position={[0, 21.6, 0]}>
        <mesh position={[0, 0, 7.5]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[2.4, 15, 14, 1, true]} />
          <meshBasicMaterial
            color={LIGHT_YELLOW}
            transparent
            opacity={0.16}
            side={THREE.DoubleSide}
            depthWrite={false}
            fog={false}
          />
        </mesh>
      </group>

      {/* Twinkling Light-Yellow & Golden Illumination Bulbs Across the Tower */}
      <group ref={sparklesRef}>
        {goldenLights.map(([lx, ly, lz], i) => (
          <mesh key={`gl-${i}`} position={[lx, ly, lz]}>
            <sphereGeometry args={[0.095, 6, 6]} />
            <meshBasicMaterial
              color={i % 2 === 0 ? LIGHT_YELLOW : GOLD_SHINE}
              fog={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

interface FireflyConfig {
  id: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  driftX: number;
  driftY: number;
  driftZ: number;
  speed: number;
  pulseSpeed: number;
  phase: number;
  color: string;
}

function RandomFireflies() {
  const groupRef = useRef<THREE.Group>(null);

  const fireflies = useMemo<FireflyConfig[]>(() => {
    const r = seededRandom(7331);
    const colors = ["#ffe875", "#e2ff7a", "#fff4a3", "#ffd25a"];
    return Array.from({ length: 38 }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      return {
        id: i,
        baseX: (r() - 0.5) * 6.4 + side * 0.4,
        baseY: 0.55 + r() * 3.4,
        baseZ: 4 - r() * 44,
        driftX: 0.35 + r() * 0.75,
        driftY: 0.22 + r() * 0.48,
        driftZ: 0.35 + r() * 0.7,
        speed: 0.45 + r() * 0.85,
        pulseSpeed: 2.2 + r() * 3.4,
        phase: r() * Math.PI * 2,
        color: colors[i % colors.length],
      };
    });
  }, []);

  useFrame(({ camera, clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    const anchorZ = Math.floor(camera.position.z / 8) * 8;

    groupRef.current.children.forEach((node, idx) => {
      const f = fireflies[idx];
      if (!f) return;
      const x =
        f.baseX +
        Math.sin(t * f.speed + f.phase) * f.driftX +
        Math.cos(t * f.speed * 0.6 + f.phase) * 0.2;
      const y =
        f.baseY + Math.sin(t * f.speed * 1.3 + f.phase * 1.7) * f.driftY;
      // Wrap fireflies smoothly around the camera's current bridge view
      const rawZ = f.baseZ + Math.cos(t * f.speed * 0.8 + f.phase) * f.driftZ;
      const z = anchorZ + rawZ;

      node.position.set(x, y, z);
      const pulse = 0.45 + 0.65 * (0.5 + 0.5 * Math.sin(t * f.pulseSpeed + f.phase));
      node.scale.setScalar(pulse);
    });
  });

  return (
    <group ref={groupRef}>
      {fireflies.map((f) => (
        <group key={f.id}>
          {/* Bright Bioluminescent Firefly Core */}
          <mesh>
            <sphereGeometry args={[0.028, 8, 8]} />
            <meshBasicMaterial color="#fffef0" fog={false} />
          </mesh>
          {/* Warm Glowing Firefly Halo */}
          <mesh>
            <sphereGeometry args={[0.085, 8, 8]} />
            <meshBasicMaterial
              color={f.color}
              transparent
              opacity={0.38}
              depthWrite={false}
              fog={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function TinyGlowingButterfly() {
  const butterflyRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<THREE.Group>(null);
  const rightWingRef = useRef<THREE.Group>(null);

  useFrame(({ camera, clock }) => {
    if (!butterflyRef.current) return;
    const t = clock.elapsedTime;

    // Gentle wandering flight path just ahead of the user along the bridge
    const curX =
      Math.sin(t * 0.65) * 1.15 + Math.cos(t * 1.4) * 0.35;
    const curY =
      1.68 + Math.sin(t * 1.85) * 0.28 + Math.cos(t * 0.9) * 0.14;
    const curZ =
      camera.position.z - 4.2 + Math.sin(t * 0.52) * 1.35;

    const prevX = butterflyRef.current.position.x;
    const prevZ = butterflyRef.current.position.z;
    butterflyRef.current.position.set(curX, curY, curZ);

    const vx = curX - prevX;
    const vz = curZ - prevZ;
    if (Math.abs(vx) + Math.abs(vz) > 0.0001) {
      butterflyRef.current.rotation.y = Math.atan2(vx, vz);
    }
    butterflyRef.current.rotation.x = 0.22 + Math.sin(t * 2.5) * 0.08;
    butterflyRef.current.rotation.z = -vx * 3.5;

    // Delicate rapid butterfly wing flutter
    const flap = Math.sin(t * 16.5) * 0.85;
    if (leftWingRef.current) leftWingRef.current.rotation.z = flap;
    if (rightWingRef.current) rightWingRef.current.rotation.z = -flap;
  });

  return (
    <group ref={butterflyRef} scale={[0.52, 0.52, 0.52]}>
      {/* Soft Golden-Luminescent Aura Around the Tiny Butterfly */}
      <mesh>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshBasicMaterial
          color="#ffe885"
          transparent
          opacity={0.26}
          depthWrite={false}
          fog={false}
        />
      </mesh>

      {/* Tiny Slender Butterfly Body */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.014, 0.11, 4, 8]} />
        <meshBasicMaterial color="#fffbe6" fog={false} />
      </mesh>

      {/* Left Glowing Forewing & Hindwing */}
      <group ref={leftWingRef} position={[-0.01, 0, 0]}>
        <mesh position={[-0.075, 0.005, -0.025]} rotation={[0, 0.22, 0]}>
          <boxGeometry args={[0.14, 0.008, 0.11]} />
          <meshBasicMaterial
            color="#fff3a8"
            transparent
            opacity={0.92}
            fog={false}
          />
        </mesh>
        <mesh position={[-0.055, 0.004, 0.045]} rotation={[0, -0.28, 0]}>
          <boxGeometry args={[0.1, 0.008, 0.085]} />
          <meshBasicMaterial
            color="#ffd86b"
            transparent
            opacity={0.88}
            fog={false}
          />
        </mesh>
      </group>

      {/* Right Glowing Forewing & Hindwing */}
      <group ref={rightWingRef} position={[0.01, 0, 0]}>
        <mesh position={[0.075, 0.005, -0.025]} rotation={[0, -0.22, 0]}>
          <boxGeometry args={[0.14, 0.008, 0.11]} />
          <meshBasicMaterial
            color="#fff3a8"
            transparent
            opacity={0.92}
            fog={false}
          />
        </mesh>
        <mesh position={[0.055, 0.004, 0.045]} rotation={[0, 0.28, 0]}>
          <boxGeometry args={[0.1, 0.008, 0.085]} />
          <meshBasicMaterial
            color="#ffd86b"
            transparent
            opacity={0.88}
            fog={false}
          />
        </mesh>
      </group>
    </group>
  );
}

/**
 * A boy kneeling on one knee on the Parisian bridge at the end of the walk,
 * extending a blooming red rose toward the viewer.
 */
function KneelingBoyWithRose({ zPosition }: { zPosition: number }) {
  const roseArmRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const roseGlowRef = useRef<THREE.Mesh>(null);

  const scatteredPetals = useMemo(() => {
    const r = seededRandom(1402);
    return Array.from({ length: 18 }, (_, i) => {
      const angle = (i / 18) * Math.PI * 2 + (r() - 0.5) * 0.35;
      const dist = 0.42 + r() * 0.65;
      return {
        x: Math.cos(angle) * dist,
        z: Math.sin(angle) * dist + 0.12,
        rotY: r() * Math.PI * 2,
        scale: 0.75 + r() * 0.5,
      };
    });
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (roseArmRef.current) {
      // Gentle offering motion of the extended arm holding the rose
      roseArmRef.current.rotation.x = -1.08 + Math.sin(t * 1.8) * 0.045;
      roseArmRef.current.rotation.z = -0.14 + Math.cos(t * 1.4) * 0.025;
    }
    if (headRef.current) {
      headRef.current.rotation.x = -0.12 + Math.sin(t * 1.5) * 0.03;
      headRef.current.rotation.y = Math.sin(t * 0.9) * 0.04;
    }
    if (roseGlowRef.current) {
      const pulse = 0.9 + 0.2 * Math.sin(t * 3.2);
      roseGlowRef.current.scale.setScalar(pulse);
    }
  });

  const SUIT_NAVY = "#182238";
  const SUIT_LAPEL = "#0f172a";
  const SHIRT_WHITE = "#fff9f2";
  const SKIN_TONE = "#f2c6a0";
  const HAIR_DARK = "#1a1412";
  const SHOE_DARK = "#121014";
  const ROSE_CRIMSON = "#e11d48";
  const ROSE_BRIGHT = "#fb7185";
  const ROSE_DEEP = "#9f1239";
  const STEM_GREEN = "#15803d";

  return (
    <group position={[0, 0.02, zPosition]} scale={[1.08, 1.08, 1.08]}>
      {/* Warm Romantic Spotlight Pool on Bridge Stones */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0.12]}>
        <circleGeometry args={[1.25, 32]} />
        <meshBasicMaterial
          color="#ffd875"
          transparent
          opacity={0.18}
          depthWrite={false}
          fog={false}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0.16]}>
        <circleGeometry args={[0.72, 24]} />
        <meshBasicMaterial
          color="#fb7185"
          transparent
          opacity={0.14}
          depthWrite={false}
          fog={false}
        />
      </mesh>

      {/* Scattered Crimson Rose Petals Around Kneeling Boy */}
      {scatteredPetals.map((p, idx) => (
        <mesh
          key={idx}
          position={[p.x, 0.022, p.z]}
          rotation={[-Math.PI / 2 + 0.12, p.rotY, 0]}
          scale={[p.scale, p.scale, p.scale]}
        >
          <circleGeometry args={[0.048, 8]} />
          <meshBasicMaterial
            color={idx % 2 === 0 ? ROSE_CRIMSON : ROSE_BRIGHT}
            side={THREE.DoubleSide}
            fog={false}
          />
        </mesh>
      ))}

      {/* === KNEELING LOWER BODY === */}
      {/* Hips / Pelvis */}
      <mesh position={[0, 0.54, 0]}>
        <boxGeometry args={[0.36, 0.18, 0.24]} />
        <meshStandardMaterial color={SUIT_NAVY} roughness={0.6} />
      </mesh>

      {/* Right Leg (Kneeling on the Ground Behind) */}
      {/* Right Thigh angled down from hip to ground knee */}
      <mesh position={[-0.11, 0.31, -0.05]} rotation={[0.22, 0, 0]}>
        <capsuleGeometry args={[0.078, 0.32, 6, 10]} />
        <meshStandardMaterial color={SUIT_NAVY} roughness={0.6} />
      </mesh>
      {/* Right Shin resting horizontally along the bridge floor (-Z) */}
      <mesh position={[-0.11, 0.09, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.068, 0.34, 6, 10]} />
        <meshStandardMaterial color={SUIT_NAVY} roughness={0.6} />
      </mesh>
      {/* Right Dress Shoe (Toe resting on ground at back) */}
      <mesh position={[-0.11, 0.09, -0.52]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[0.11, 0.16, 0.1]} />
        <meshStandardMaterial color={SHOE_DARK} roughness={0.35} />
      </mesh>

      {/* Left Leg (Bent Forward with Foot Planted on the Bridge) */}
      {/* Left Thigh extending forward from hip to raised knee */}
      <mesh position={[0.11, 0.54, 0.19]} rotation={[Math.PI / 2 - 0.08, 0, 0]}>
        <capsuleGeometry args={[0.078, 0.28, 6, 10]} />
        <meshStandardMaterial color={SUIT_NAVY} roughness={0.6} />
      </mesh>
      {/* Left Shin vertical from raised knee down to bridge */}
      <mesh position={[0.11, 0.29, 0.35]}>
        <capsuleGeometry args={[0.068, 0.34, 6, 10]} />
        <meshStandardMaterial color={SUIT_NAVY} roughness={0.6} />
      </mesh>
      {/* Left Dress Shoe planted forward */}
      <mesh position={[0.11, 0.06, 0.41]}>
        <boxGeometry args={[0.115, 0.09, 0.22]} />
        <meshStandardMaterial color={SHOE_DARK} roughness={0.35} />
      </mesh>

      {/* === TORSO & SUIT JACKET === */}
      <group position={[0, 0.86, 0.02]} rotation={[0.06, 0, 0]}>
        {/* Suit Jacket Torso */}
        <mesh>
          <boxGeometry args={[0.42, 0.52, 0.24]} />
          <meshStandardMaterial color={SUIT_NAVY} roughness={0.55} />
        </mesh>
        {/* Crisp White Dress Shirt V-Front */}
        <mesh position={[0, 0.08, 0.122]}>
          <boxGeometry args={[0.15, 0.32, 0.015]} />
          <meshBasicMaterial color={SHIRT_WHITE} fog={false} />
        </mesh>
        {/* Suit Lapels */}
        <mesh position={[-0.08, 0.08, 0.125]} rotation={[0, 0, -0.26]}>
          <boxGeometry args={[0.06, 0.34, 0.018]} />
          <meshStandardMaterial color={SUIT_LAPEL} roughness={0.45} />
        </mesh>
        <mesh position={[0.08, 0.08, 0.125]} rotation={[0, 0, 0.26]}>
          <boxGeometry args={[0.06, 0.34, 0.018]} />
          <meshStandardMaterial color={SUIT_LAPEL} roughness={0.45} />
        </mesh>
        {/* Crimson Bow Tie / Necktie Accent */}
        <mesh position={[0, 0.2, 0.132]}>
          <boxGeometry args={[0.09, 0.042, 0.02]} />
          <meshBasicMaterial color={ROSE_CRIMSON} fog={false} />
        </mesh>
        {/* Gold Boutonniere Pin on Left Lapel */}
        <mesh position={[0.11, 0.14, 0.134]}>
          <sphereGeometry args={[0.022, 8, 8]} />
          <meshBasicMaterial color="#ffe070" fog={false} />
        </mesh>

        {/* === HEAD & HAIR === */}
        <group ref={headRef} position={[0, 0.39, 0.02]}>
          {/* Neck */}
          <mesh position={[0, -0.09, 0]}>
            <cylinderGeometry args={[0.065, 0.072, 0.1, 10]} />
            <meshStandardMaterial color={SKIN_TONE} roughness={0.65} />
          </mesh>
          {/* Head */}
          <mesh position={[0, 0.04, 0]}>
            <sphereGeometry args={[0.155, 18, 18]} />
            <meshStandardMaterial color={SKIN_TONE} roughness={0.6} />
          </mesh>
          {/* Styled Dark Hair Cap & Swept Fringe */}
          <mesh position={[0, 0.085, -0.015]} scale={[1.04, 0.96, 1.06]}>
            <sphereGeometry args={[0.156, 16, 16]} />
            <meshStandardMaterial color={HAIR_DARK} roughness={0.75} />
          </mesh>
          <mesh position={[0.02, 0.15, 0.09]} rotation={[0.25, 0.15, -0.18]}>
            <boxGeometry args={[0.22, 0.075, 0.12]} />
            <meshStandardMaterial color={HAIR_DARK} roughness={0.75} />
          </mesh>
          {/* Gentle Eyes & Warm Smile Facing Viewer */}
          <mesh position={[-0.052, 0.05, 0.142]}>
            <sphereGeometry args={[0.016, 8, 8]} />
            <meshBasicMaterial color="#1c1614" fog={false} />
          </mesh>
          <mesh position={[0.052, 0.05, 0.142]}>
            <sphereGeometry args={[0.016, 8, 8]} />
            <meshBasicMaterial color="#1c1614" fog={false} />
          </mesh>
          {/* Subtle Warm Blush */}
          <mesh position={[-0.082, 0.015, 0.13]}>
            <sphereGeometry args={[0.022, 8, 8]} />
            <meshBasicMaterial
              color="#f48c8c"
              transparent
              opacity={0.45}
              fog={false}
            />
          </mesh>
          <mesh position={[0.082, 0.015, 0.13]}>
            <sphereGeometry args={[0.022, 8, 8]} />
            <meshBasicMaterial
              color="#f48c8c"
              transparent
              opacity={0.45}
              fog={false}
            />
          </mesh>
          {/* Smile Arc */}
          <mesh
            position={[0, -0.018, 0.144]}
            rotation={[Math.PI, 0, 0]}
          >
            <torusGeometry args={[0.032, 0.006, 6, 14, Math.PI]} />
            <meshBasicMaterial color="#a3483e" fog={false} />
          </mesh>
        </group>

        {/* === LEFT ARM (Resting Gently on Raised Front Knee) === */}
        <group position={[0.24, 0.18, 0.02]} rotation={[-0.68, 0, -0.18]}>
          <mesh position={[0, -0.16, 0]}>
            <capsuleGeometry args={[0.058, 0.28, 6, 10]} />
            <meshStandardMaterial color={SUIT_NAVY} roughness={0.55} />
          </mesh>
          <mesh position={[-0.03, -0.34, 0.08]} rotation={[-0.55, 0, 0.25]}>
            <capsuleGeometry args={[0.05, 0.22, 6, 10]} />
            <meshStandardMaterial color={SUIT_NAVY} roughness={0.55} />
          </mesh>
          <mesh position={[-0.05, -0.45, 0.18]}>
            <sphereGeometry args={[0.048, 10, 10]} />
            <meshStandardMaterial color={SKIN_TONE} roughness={0.6} />
          </mesh>
        </group>

        {/* === RIGHT ARM EXTENDED FORWARD OFFERING THE ROSE === */}
        <group
          ref={roseArmRef}
          position={[-0.22, 0.18, 0.06]}
          rotation={[-1.08, 0.16, -0.14]}
        >
          {/* Upper & Forearm Extended Toward Viewer */}
          <mesh position={[0, -0.16, 0]}>
            <capsuleGeometry args={[0.058, 0.26, 6, 10]} />
            <meshStandardMaterial color={SUIT_NAVY} roughness={0.55} />
          </mesh>
          <mesh position={[0.04, -0.38, 0.06]} rotation={[-0.28, 0, -0.12]}>
            <capsuleGeometry args={[0.05, 0.26, 6, 10]} />
            <meshStandardMaterial color={SUIT_NAVY} roughness={0.55} />
          </mesh>
          {/* White Shirt Cuff */}
          <mesh position={[0.06, -0.52, 0.1]} rotation={[-0.28, 0, -0.12]}>
            <cylinderGeometry args={[0.052, 0.052, 0.04, 10]} />
            <meshBasicMaterial color={SHIRT_WHITE} fog={false} />
          </mesh>
          {/* Hand Holding Rose */}
          <mesh position={[0.07, -0.57, 0.12]}>
            <sphereGeometry args={[0.052, 12, 12]} />
            <meshStandardMaterial color={SKIN_TONE} roughness={0.6} />
          </mesh>

          {/* === BLOOMING RED ROSE === */}
          <group
            position={[0.08, -0.62, 0.16]}
            rotation={[Math.PI / 2 + 0.35, 0, 0.1]}
          >
            {/* Green Rose Stem */}
            <mesh position={[0, 0.14, 0]}>
              <cylinderGeometry args={[0.012, 0.014, 0.38, 8]} />
              <meshBasicMaterial color={STEM_GREEN} fog={false} />
            </mesh>
            {/* Two Rose Leaves on Stem */}
            <mesh
              position={[-0.038, 0.15, 0]}
              rotation={[0, 0, 0.72]}
              scale={[1, 0.3, 0.6]}
            >
              <sphereGeometry args={[0.052, 8, 8]} />
              <meshBasicMaterial color="#16a34a" fog={false} />
            </mesh>
            <mesh
              position={[0.038, 0.21, 0]}
              rotation={[0, 0, -0.72]}
              scale={[1, 0.3, 0.6]}
            >
              <sphereGeometry args={[0.052, 8, 8]} />
              <meshBasicMaterial color="#16a34a" fog={false} />
            </mesh>
            {/* Green Calyx Sepals Under Bloom */}
            <mesh position={[0, 0.31, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.048, 0.06, 6]} />
              <meshBasicMaterial color={STEM_GREEN} fog={false} />
            </mesh>

            {/* Layered Crimson & Ruby Rose Petals */}
            <group position={[0, 0.36, 0]}>
              {/* Outer Cupped Petals */}
              <mesh scale={[1.15, 0.88, 1.15]}>
                <sphereGeometry args={[0.082, 14, 12]} />
                <meshBasicMaterial color={ROSE_DEEP} fog={false} />
              </mesh>
              {[0, 1, 2, 3, 4].map((pi) => {
                const ang = (pi / 5) * Math.PI * 2;
                return (
                  <mesh
                    key={pi}
                    position={[
                      Math.cos(ang) * 0.046,
                      0.015,
                      Math.sin(ang) * 0.046,
                    ]}
                    rotation={[0.35, -ang, 0.25]}
                    scale={[0.9, 1.05, 0.45]}
                  >
                    <sphereGeometry args={[0.058, 10, 10]} />
                    <meshBasicMaterial
                      color={pi % 2 === 0 ? ROSE_CRIMSON : ROSE_BRIGHT}
                      fog={false}
                    />
                  </mesh>
                );
              })}
              {/* Inner Spiral Rose Bud Core */}
              <mesh position={[0, 0.028, 0]}>
                <coneGeometry args={[0.045, 0.075, 10]} />
                <meshBasicMaterial color={ROSE_CRIMSON} fog={false} />
              </mesh>
              <mesh position={[0, 0.035, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.032, 0.014, 8, 16]} />
                <meshBasicMaterial color={ROSE_BRIGHT} fog={false} />
              </mesh>

              {/* Soft Romantic Rose & Golden Glow Halo */}
              <mesh ref={roseGlowRef}>
                <sphereGeometry args={[0.19, 14, 14]} />
                <meshBasicMaterial
                  color="#ff6b8b"
                  transparent
                  opacity={0.28}
                  depthWrite={false}
                  fog={false}
                />
              </mesh>
              <mesh>
                <sphereGeometry args={[0.3, 14, 14]} />
                <meshBasicMaterial
                  color="#ffe070"
                  transparent
                  opacity={0.14}
                  depthWrite={false}
                  fog={false}
                />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

export function RomanticLandmarks({
  maxDistance,
}: {
  maxDistance?: number;
}) {
  const vistaRef = useRef<THREE.Group>(null);
  const bridgeRef = useRef<THREE.Group>(null);

  useFrame(({ camera }) => {
    if (vistaRef.current) {
      // Keep the Eiffel Tower dead-center straight ahead (x = 0) at the end of the bridge
      vistaRef.current.position.x = 0;
      vistaRef.current.position.z = camera.position.z - 37;
    }
    if (bridgeRef.current) {
      bridgeRef.current.position.z = Math.floor(camera.position.z / 7) * 7 - 18;
    }
  });

  // When camera reaches d = maxDistance, camera.position.z is (2 - maxDistance).
  // Place the kneeling boy 3.2m directly ahead of the final camera position on the bridge.
  const endBoyZ =
    maxDistance && maxDistance > 0 ? 2 - maxDistance - 3.2 : -62;

  return (
    <>
      {/* Dual contiguous bridge segments that move in 7m lantern-aligned steps to adapt to any number of photos */}
      <group ref={bridgeRef}>
        <SingleBridgeSegment zOffset={14} />
        <SingleBridgeSegment zOffset={-42} />
      </group>

      {/* Random Glowing Fireflies & One Tiny Glowing Butterfly */}
      <RandomFireflies />
      <TinyGlowingButterfly />

      {/* Boy Kneeling on One Knee & Offering a Red Rose at the End of the Bridge */}
      <KneelingBoyWithRose zPosition={endBoyZ} />

      <group ref={vistaRef} position={[0, 0, -37]}>
        <EiffelTowerNightVista />
      </group>
    </>
  );
}
