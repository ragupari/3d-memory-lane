import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Line, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { seededRandom } from "../../utils/journey";

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
  kind: "trunk" | "leaf" | "grass" | "rock";
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
        <cylinderGeometry args={[0.7, 1, 1, 7]} />
      ) : kind === "grass" ? (
        <coneGeometry args={[0.18, 1, 3]} />
      ) : (
        <icosahedronGeometry args={[1, kind === "leaf" ? 1 : 0]} />
      )}
      <meshStandardMaterial roughness={1} flatShading />
    </instancedMesh>
  );
}
function ForestChunk({ index }: { index: number }) {
  const objects = useMemo(() => {
    const r = seededRandom(index * 237 + 809);
    const trunks: Instance[] = [],
      leaves: Instance[] = [],
      grass: Instance[] = [],
      rocks: Instance[] = [];
    for (let i = 0; i < 38; i++) {
      const side = i % 2 ? -1 : 1;
      const x = side * (3.8 + r() * 18),
        z = -r() * 24,
        h = 8 + r() * 9,
        radius = 0.18 + r() * 0.45;
      trunks.push({
        position: [x, h / 2, z],
        scale: [radius, h, radius],
        rotation: [r() * 0.07, 0, side * r() * 0.1],
        color: ["#33392a", "#33372b", "#464633", "#262f25"][i % 4],
      });
      for (let b = 0; b < 3; b++) {
        const y = 4.8 + b * 2 + r(),
          length = 2.8 + r() * 2;
        trunks.push({
          position: [x - side * length * 0.35, y, z],
          scale: [radius * 0.4, length, radius * 0.4],
          rotation: [r() * 0.7, 0, side * (0.8 + r() * 0.3)],
          color: "#343c2a",
        });
        for (let l = 0; l < 4; l++)
          leaves.push({
            position: [
              x - side * length * 0.6 + (r() - 0.5) * 3,
              y + 0.7 + r() * 1.5,
              z + (r() - 0.5) * 4,
            ],
            scale: [1.1 + r() * 1.7, 0.35 + r() * 0.55, 1 + r() * 1.2],
            rotation: [r(), r(), r()],
            color: ["#263f25", "#364b2a", "#415333", "#293c25", "#53603a"][l],
          });
      }
    }
    for (let i = 0; i < 800; i++) {
      const x = (i % 2 ? -1 : 1) * (1.9 + r() * 15),
        z = -r() * 24,
        height = 0.13 + r() * 0.65;
      grass.push({
        position: [x, height / 2, z],
        scale: [0.5 + r(), height, 0.5 + r()],
        rotation: [r() * 0.3, r() * 6, r() * 0.3],
        color: ["#3e4c27", "#46572f", "#59603b", "#253b26"][i % 4],
      });
    }
    for (let i = 0; i < 28; i++) {
      const x = (i % 2 ? -1 : 1) * (2 + r() * 6);
      rocks.push({
        position: [x, 0.08, -r() * 24],
        scale: [0.15 + r() * 0.6, 0.12 + r() * 0.25, 0.2 + r() * 0.5],
        color: "#454838",
      });
    }
    return { trunks, leaves, grass, rocks };
  }, [index]);
  return (
    <group position={[0, 0, -index * 24]}>
      <Instances items={objects.trunks} kind="trunk" />
      <Instances items={objects.leaves} kind="leaf" />
      <Instances items={objects.grass} kind="grass" />
      <Instances items={objects.rocks} kind="rock" />
    </group>
  );
}
function LightString({ z, index }: { z: number; index: number }) {
  const bulbsRef = useRef<THREE.InstancedMesh>(null);
  const glowRef = useRef<THREE.InstancedMesh>(null);
  const bulbs = useMemo(
    () =>
      Array.from({ length: 25 }, (_, i) => {
        const x = -6 + i * 0.5;
        return new THREE.Vector3(
          x,
          4.5 - 1.15 * Math.sin((i / 24) * Math.PI),
          0,
        );
      }),
    [],
  );
  useLayoutEffect(() => {
    const matrix = new THREE.Matrix4();
    bulbs.forEach((point, i) => {
      matrix.makeTranslation(point.x, point.y - 0.055, point.z);
      bulbsRef.current?.setMatrixAt(i, matrix);
      glowRef.current?.setMatrixAt(i, matrix);
    });
    for (const mesh of [bulbsRef.current, glowRef.current]) {
      if (mesh) {
        mesh.instanceMatrix.needsUpdate = true;
        mesh.computeBoundingSphere();
      }
    }
  }, [bulbs]);
  return (
    <group
      position={[0, 0, z]}
      rotation={[0, index % 2 ? 0.14 : -0.12, index % 2 ? 0.07 : -0.06]}
    >
      <Line points={bulbs} color="#6f6650" lineWidth={1} />
      <instancedMesh ref={bulbsRef} args={[undefined, undefined, bulbs.length]}>
        <sphereGeometry args={[0.035, 6, 6]} />
        <meshBasicMaterial color="#ffe1a0" toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={glowRef} args={[undefined, undefined, bulbs.length]}>
        <sphereGeometry args={[0.11, 6, 6]} />
        <meshBasicMaterial
          color="#efad48"
          transparent
          opacity={0.08}
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  );
}
export function ForestEnvironment({
  zone,
  reduced,
}: {
  zone: number;
  reduced: boolean;
}) {
  const { size } = useThree();
  const center = Math.floor(zone / 3);
  const groundRef = useRef<THREE.Group>(null);
  useFrame(({ camera }) => {
    if (groundRef.current) groundRef.current.position.z = camera.position.z;
  });
  const path = useMemo(() => {
    const positions: number[] = [],
      indices: number[] = [];
    for (let i = 0; i < 100; i++) {
      const z = 12 - i * 1.5,
        offset = Math.sin(i * 0.25) * 0.18,
        w = 1.85 + Math.sin(i * 0.72) * 0.12;
      positions.push(offset - w, 0.018, z, offset + w, 0.018, z);
      if (i < 99) {
        const a = i * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <>
      <color attach="background" args={["#273b30"]} />
      <fog attach="fog" args={["#273b30", 10, 47]} />
      <hemisphereLight args={["#c6cba5", "#252816", 2.15]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[-8, 16, -18]}
        color="#ffe1a6"
        intensity={2.5}
      />
      <group ref={groundRef}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -40]}>
          <planeGeometry args={[90, 180]} />
          <meshStandardMaterial color="#303b25" roughness={1} />
        </mesh>
        <mesh geometry={path}>
          <meshStandardMaterial color="#605c43" roughness={1} />
        </mesh>
      </group>
      {Array.from({ length: 5 }, (_, i) => center + i - 1).map((i) => (
        <ForestChunk key={i} index={i} />
      ))}
      {Array.from(
        { length: 9 },
        (_, i) => Math.floor((zone * 8) / 8) + i - 2,
      ).map((i) => (
        <LightString key={i} z={-i * 8 - 3} index={i} />
      ))}
      {!reduced && (
        <Sparkles
          count={size.width < 700 ? 30 : 75}
          scale={[15, 7, 70]}
          position={[0, 3, -zone * 8 - 20]}
          size={2.5}
          speed={0.15}
          opacity={0.65}
          color="#f1cb7a"
        />
      )}
    </>
  );
}
