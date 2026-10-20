import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import type { MemoryPhoto, PlacedMemory } from "../../types/memory";

const VIDEO_EXT_RE = /\.(mp4|webm|mov|ogg)(\?.*)?$/i;

function PhotoPrint({
  src,
  videoSrc,
  width,
  matRef,
}: {
  src: string;
  videoSrc?: string;
  width: number;
  matRef: React.RefObject<THREE.MeshBasicMaterial | null>;
}) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [videoTex, setVideoTex] = useState<THREE.VideoTexture | null>(null);
  const [sourceSize, setSourceSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const effectiveVideoSrc =
    videoSrc ?? (VIDEO_EXT_RE.test(src) ? src : undefined);
  const imageSrc = VIDEO_EXT_RE.test(src) ? undefined : src;

  useEffect(() => {
    if (!imageSrc) {
      setTexture(null);
      return;
    }
    let cancelled = false;
    let owned: THREE.Texture | undefined;
    new THREE.TextureLoader().load(
      imageSrc,
      (t) => {
        owned = t;
        if (cancelled) {
          t.dispose();
          return;
        }
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 4;
        const img = t.image as HTMLImageElement | undefined;
        const imgW = img?.naturalWidth || img?.width || 0;
        const imgH = img?.naturalHeight || img?.height || 0;
        if (imgW > 0 && imgH > 0) {
          setSourceSize({ width: imgW, height: imgH });
        }
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
  }, [imageSrc]);

  useEffect(() => {
    if (!effectiveVideoSrc) {
      setVideoTex(null);
      return;
    }
    let cancelled = false;
    const video = document.createElement("video");
    video.src = effectiveVideoSrc;
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    let vt: THREE.VideoTexture | undefined;

    const syncVideoDimensions = () => {
      if (cancelled) return;
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        setSourceSize({ width: video.videoWidth, height: video.videoHeight });
      }
    };

    const onCanPlay = () => {
      if (cancelled) return;
      syncVideoDimensions();
      vt = new THREE.VideoTexture(video);
      vt.colorSpace = THREE.SRGBColorSpace;
      setVideoTex(vt);
      void video.play().catch(() => {
        /* Fallback to static frame if autoplay is restricted */
      });
    };

    video.addEventListener("loadedmetadata", syncVideoDimensions);
    video.addEventListener("loadeddata", onCanPlay, { once: true });
    video.load();

    return () => {
      cancelled = true;
      video.removeEventListener("loadedmetadata", syncVideoDimensions);
      video.removeEventListener("loadeddata", onCanPlay);
      video.pause();
      video.removeAttribute("src");
      video.load();
      vt?.dispose();
    };
  }, [effectiveVideoSrc]);

  const cardHeight = width * 0.78;
  const maxW = width - 0.14;
  const maxH = cardHeight - 0.16;
  const srcW =
    sourceSize && sourceSize.width > 0 ? sourceSize.width : 1400;
  const srcH =
    sourceSize && sourceSize.height > 0 ? sourceSize.height : 933;
  const scale = Math.min(maxW / srcW, maxH / srcH);
  const w = srcW * scale;
  const h = srcH * scale;
  const activeMap = videoTex ?? texture;

  return (
    <mesh position={[0, 0, 0.037]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial
        ref={matRef}
        map={activeMap}
        color={activeMap ? "#ffffff" : "#8b9bb4"}
        side={THREE.DoubleSide}
        transparent
        opacity={1}
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
  const frameMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const printMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const worldVec = useRef(new THREE.Vector3());
  const [hovered, setHovered] = useState(false);
  const h = item.width * 0.78;
  const mediaType = item.photo.type ?? "photo";

  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime;
    if (ref.current) {
      ref.current.rotation.z =
        item.rotation +
        (reduced ? 0 : Math.sin(t * 0.6 + item.phase) * 0.018);
      ref.current.rotation.y =
        -Math.sign(item.x) * 0.13 +
        (reduced ? 0 : Math.sin(t * 0.4 + item.phase) * 0.03);

      // Scroll-driven partial & particle fade calculation
      worldVec.current.set(item.worldX, item.y, item.worldZ);
      const dist = camera.position.distanceTo(worldVec.current);
      let fade = 1;
      if (dist < 3.6) {
        fade = THREE.MathUtils.clamp((dist - 0.9) / 2.7, 0.22, 1);
      } else if (dist > 14.5) {
        fade = THREE.MathUtils.clamp(1 - (dist - 14.5) / 18, 0.24, 1);
      }
      if (hovered) fade = 1;

      if (frameMatRef.current) frameMatRef.current.opacity = fade;
      if (printMatRef.current) printMatRef.current.opacity = fade;

      const scaleFade = 0.92 + 0.08 * fade;
      ref.current.scale.setScalar(scaleFade);
    }
  });

  useEffect(() => {
    if (hovered && enabled) document.body.style.cursor = "pointer";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hovered, enabled]);

  const frameColor =
    mediaType === "video"
      ? hovered && enabled
        ? "#fff4dc"
        : "#29354d"
      : mediaType === "audio"
        ? hovered && enabled
          ? "#ffeef6"
          : "#3d2945"
        : hovered && enabled
          ? "#fff8e6"
          : "#fff7eb";

  const emissiveColor =
    mediaType === "video"
      ? "#ffa94d"
      : mediaType === "audio"
        ? "#ff85b3"
        : "#f0c98d";

  // Anchor the support wire strictly between a Left Bridge Lantern (-2.72, 3.18, zLeft)
  // and a Right Bridge Lantern (+2.72, 3.18, zRight) so no lines hang from the sky
  const { lanternWirePts, bulbPts, leftClipPt, rightClipPt } = useMemo(() => {
    const n0 = Math.floor((item.distance - 0.5) / 7);
    const n1 = Math.ceil((item.distance - 0.5) / 7);
    const flip = Math.sin(item.phase * 4.3) >= 0;
    const nLeft = flip ? n0 : n1;
    const nRight =
      n0 === n1 ? n0 + (flip ? 1 : -1) : flip ? n1 : n0;

    const worldZLeft = -0.5 - nLeft * 7;
    const worldZRight = -0.5 - nRight * 7;

    const attachY = Math.max(h / 2 + 0.36, 2.74 - item.y);
    const pLeft = new THREE.Vector3(
      -2.72 - item.worldX,
      3.18 - item.y,
      worldZLeft - item.worldZ,
    );
    const pMidLeft = new THREE.Vector3(-0.35, attachY, 0);
    const pMidRight = new THREE.Vector3(0.35, attachY, 0);
    const pRight = new THREE.Vector3(
      2.72 - item.worldX,
      3.18 - item.y,
      worldZRight - item.worldZ,
    );

    const curve = new THREE.CatmullRomCurve3([
      pLeft,
      pMidLeft,
      pMidRight,
      pRight,
    ]);
    const pts = curve.getPoints(18);
    const bulbs = pts.filter((_, idx) => idx > 0 && idx < 18 && idx % 3 === 0);

    return {
      lanternWirePts: pts,
      bulbPts: bulbs,
      leftClipPt: pMidLeft,
      rightClipPt: pMidRight,
    };
  }, [h, item.distance, item.phase, item.worldX, item.worldZ, item.y]);

  return (
    <group
      position={[item.worldX, item.y, item.worldZ]}
      rotation={[0, item.worldYaw * 0.45, 0]}
    >
      {/* Lantern-to-Lantern Fairy-Light Wire Anchored to Bridge Streetlamps on Both Ends */}
      <Line points={lanternWirePts} color="#3a2c1d" lineWidth={1.1} />
      {bulbPts.map((p, idx) => (
        <mesh key={idx} position={[p.x, p.y - 0.035, p.z]}>
          <sphereGeometry args={[0.048, 8, 8]} />
          <meshBasicMaterial color={idx % 2 === 0 ? "#fff3a6" : "#ffd257"} />
        </mesh>
      ))}

      {/* Short Clip Cords Connecting Frame Top Clips to the Lantern-to-Lantern Wire */}
      <Line
        points={[
          [-0.35, h / 2, 0],
          [leftClipPt.x, leftClipPt.y, leftClipPt.z],
        ]}
        color="#c89f5d"
        lineWidth={1.15}
      />
      <Line
        points={[
          [0.35, h / 2, 0],
          [rightClipPt.x, rightClipPt.y, rightClipPt.z],
        ]}
        color="#c89f5d"
        lineWidth={1.15}
      />

      {/* Particle Shimmer Halo Around Each Memory Along the Bridge */}
      {!reduced && (
        <Sparkles
          count={14}
          scale={[item.width + 0.55, h + 0.55, 0.45]}
          size={2.1}
          speed={0.35}
          opacity={0.75}
          color={mediaType === "audio" ? "#ff9ec7" : "#ffe699"}
        />
      )}

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
            ref={frameMatRef}
            color={frameColor}
            emissive={emissiveColor}
            emissiveIntensity={hovered && enabled ? 0.35 : 0.1}
            roughness={0.75}
            transparent
            opacity={1}
          />
        </mesh>
        <PhotoPrint
          src={item.photo.src || item.photo.thumbnail || ""}
          videoSrc={mediaType === "video" ? item.photo.videoSrc : undefined}
          width={item.width}
          matRef={printMatRef}
        />

        {[-0.35, 0.35].map((x) => (
          <mesh key={x} position={[x, h / 2, 0.055]}>
            <boxGeometry args={[0.06, 0.15, 0.065]} />
            <meshStandardMaterial color="#d49a59" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

