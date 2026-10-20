import { useState } from "react";
import {
  Compass,
  Map as MapIcon,
  GitBranch,
  Film,
  Music,
  Camera,
  X,
  ArrowRight,
  Volume2,
  Pause,
  Play,
  CornerUpLeft,
  CornerUpRight,
  ArrowUp,
} from "lucide-react";
import { romanticPaths, getPathById } from "../../data/photos";
import type {
  MemoryPhoto,
  PathId,
  PlacedMemory,
} from "../../types/memory";
import type { PathSegmentInfo } from "../../utils/journey";

export function MapNavigator({
  activePathId,
  onNavigatePath,
  onNavigateDistance,
  onInspectMemory,
  segments,
  discovered,
  playingAudioPhoto,
  onToggleInlineAudio,
}: {
  activePathId: PathId;
  onNavigatePath: (pathId: PathId) => void;
  onNavigateDistance: (distance: number) => void;
  onInspectMemory: (photo: MemoryPhoto) => void;
  segments: PathSegmentInfo[];
  discovered: Set<string>;
  playingAudioPhoto: MemoryPhoto | null;
  onToggleInlineAudio: (photo: MemoryPhoto) => void;
}) {
  const [mapOpen, setMapOpen] = useState(false);
  const currentPath = getPathById(activePathId);
  const leftBranch = getPathById(currentPath.connectedPaths[0]);
  const straightBranch = getPathById(currentPath.connectedPaths[2]);
  const rightBranch = getPathById(currentPath.connectedPaths[1]);

  const getMediaIcon = (m: PlacedMemory) => {
    const t = m.photo.type ?? "photo";
    if (t === "video") return <Film size={11} />;
    if (t === "audio") return <Music size={11} />;
    return <Camera size={11} />;
  };

  return (
    <>
      {/* Top-Center Bridge Mesh Branch Selector */}
      <section
        className="path-navigator-bar"
        aria-label="Interconnected bridge mesh branches"
      >
        <div className="path-tabs" role="tablist" aria-label="Bridge branches">
          {romanticPaths.map((path) => {
            const seg = segments.find((s) => s.pathId === path.id);
            const count = seg?.memories.length ?? 0;
            const found =
              seg?.memories.filter((m) => discovered.has(m.photo.id)).length ??
              0;
            const isActive = path.id === activePathId;
            return (
              <button
                key={path.id}
                role="tab"
                aria-selected={isActive}
                className={`path-tab ${isActive ? "active" : ""}`}
                onClick={() => onNavigatePath(path.id)}
              >
                <span
                  className="path-tab-dot"
                  style={{ background: path.accentColor }}
                />
                <span className="path-tab-name">{path.shortName}</span>
                <span className="path-tab-count">
                  {found}/{count}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            className="map-toggle-button"
            onClick={() => setMapOpen(true)}
            aria-label="Open bridge mesh map"
          >
            <MapIcon size={13} />
            <span>Bridge Mesh Map</span>
          </button>
        </div>
      </section>

      {/* Right-Side Interactive Bridge Mesh Map & Turn Controls */}
      <aside
        className="mini-map-card"
        aria-label="Current bridge branch and mesh turn navigation"
      >
        <div className="mini-map-header">
          <div>
            <span className="eyebrow">ACTIVE BRIDGE BRANCH</span>
            <h3>{currentPath.event}</h3>
            <p className="mini-map-landmark">
              <Compass size={11} /> {currentPath.landmarkName}
            </p>
          </div>
          <button
            type="button"
            className="mini-expand-btn"
            onClick={() => setMapOpen(true)}
            title="Expand full bridge mesh map"
          >
            <MapIcon size={14} />
          </button>
        </div>

        {/* True 2D Mesh Graph SVG of the Parisian Bridge Network */}
        <svg
          className="mini-network-svg"
          viewBox="0 0 220 112"
          role="img"
          aria-label="Parisian bridge mesh network"
        >
          {/* Mesh Bridge Spans */}
          {/* Entry to Hub */}
          <line x1="110" y1="100" x2="110" y2="76" stroke="#fff3d688" strokeWidth="2.2" />
          {/* Hub to West, Heart, East */}
          <line x1="110" y1="76" x2="42" y2="50" stroke="#ffb86c99" strokeWidth="2" />
          <line x1="110" y1="76" x2="110" y2="48" stroke="#fff3d666" strokeWidth="1.8" strokeDasharray="3 2" />
          <line x1="110" y1="76" x2="178" y2="50" stroke="#7ad6f599" strokeWidth="2" />
          {/* Cross-Seine Lateral Mesh Spans */}
          <line x1="42" y1="50" x2="110" y2="48" stroke="#7ad6f5aa" strokeWidth="2" />
          <line x1="110" y1="48" x2="178" y2="50" stroke="#7ad6f5aa" strokeWidth="2" />
          {/* Converging Spans to Eiffel Belvedere */}
          <line x1="42" y1="50" x2="110" y2="16" stroke="#ffe08288" strokeWidth="1.8" strokeDasharray="3 2" />
          <line x1="110" y1="48" x2="110" y2="16" stroke="#ffe08288" strokeWidth="1.8" strokeDasharray="3 2" />
          <line x1="178" y1="50" x2="110" y2="16" stroke="#ffe082aa" strokeWidth="2.2" />

          {[
            {
              id: "paris-path" as PathId,
              cx: 110,
              cy: 86,
              label: "Entry Bridge",
            },
            {
              id: "taj-path" as PathId,
              cx: 42,
              cy: 50,
              label: "West Rose",
            },
            {
              id: "kyoto-path" as PathId,
              cx: 178,
              cy: 50,
              label: "East Lantern",
            },
            {
              id: "venice-path" as PathId,
              cx: 110,
              cy: 16,
              label: "Eiffel Vista",
            },
          ].map((node) => {
            const active = node.id === activePathId;
            const pDef = getPathById(node.id);
            return (
              <g
                key={node.id}
                className="map-svg-node"
                onClick={() => onNavigatePath(node.id)}
              >
                {active && (
                  <circle
                    cx={node.cx}
                    cy={node.cy}
                    r="11"
                    fill={pDef.accentColor}
                    opacity="0.32"
                  />
                )}
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r={active ? "6.5" : "5"}
                  fill={active ? pDef.accentColor : "#1e2c45"}
                  stroke={pDef.accentColor}
                  strokeWidth="1.6"
                />
                <text
                  x={node.cx}
                  y={node.cy + (node.cy < 28 ? 14 : node.cy > 75 ? 13 : -9)}
                  textAnchor="middle"
                  fill={active ? "#fff7e6" : "#dce8f7"}
                  fontSize="8"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
          {/* Central Heart Rotunda Node */}
          <circle
            cx="110"
            cy="48"
            r="4"
            fill="#ff9ebb"
            stroke="#fff"
            strokeWidth="1"
          />
        </svg>

        <div className="crossroads-branches">
          <span className="eyebrow">
            <GitBranch size={10} /> TAKE A TURN ON THE MESH
          </span>
          <div className="branch-buttons">
            <button
              type="button"
              className="branch-btn"
              onClick={() => onNavigatePath(leftBranch.id)}
              title={`Turn left onto ${leftBranch.name}`}
            >
              <CornerUpLeft size={11} />
              <span>Turn Left</span>
            </button>
            <button
              type="button"
              className="branch-btn"
              onClick={() => onNavigatePath(straightBranch.id)}
              title={`Continue straight to ${straightBranch.name}`}
            >
              <ArrowUp size={11} />
              <span>Straight</span>
            </button>
            <button
              type="button"
              className="branch-btn"
              onClick={() => onNavigatePath(rightBranch.id)}
              title={`Turn right onto ${rightBranch.name}`}
            >
              <CornerUpRight size={11} />
              <span>Turn Right</span>
            </button>
          </div>
        </div>

        {/* Inline Audio Clip Quick-Listen Bar */}
        {playingAudioPhoto && (
          <div className="inline-audio-banner">
            <Volume2 size={14} />
            <div className="inline-audio-text">
              <strong>{playingAudioPhoto.title}</strong>
              <span>Playing audio clip on bridge</span>
            </div>
            <button
              type="button"
              className="inline-audio-stop"
              onClick={() => onToggleInlineAudio(playingAudioPhoto)}
              aria-label="Stop audio clip"
            >
              <Pause size={13} />
            </button>
          </div>
        )}
      </aside>

      {/* Full Interconnected Bridge Mesh Modal */}
      {mapOpen && (
        <div
          className="world-map-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="world-map-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMapOpen(false);
          }}
        >
          <div className="world-map-modal">
            <button
              type="button"
              className="icon-button close-dialog"
              onClick={() => setMapOpen(false)}
              aria-label="Close bridge mesh map"
            >
              <X size={19} />
            </button>
            <span className="eyebrow">INTERCONNECTED PARISIAN BRIDGE MESH</span>
            <h2 id="world-map-title">Our Bridge of Memories</h2>
            <p className="world-map-subtitle">
              Navigate freely across our interconnected mesh of Parisian bridges.
              Take a left or right turn at any rotunda, or select any photograph,
              short video, or audio clip below.
            </p>

            <div className="world-map-grid">
              {romanticPaths.map((path) => {
                const seg = segments.find((s) => s.pathId === path.id);
                const isCurrent = path.id === activePathId;
                return (
                  <div
                    key={path.id}
                    className={`world-map-path-card ${isCurrent ? "current" : ""}`}
                  >
                    <div className="path-card-top">
                      <div>
                        <span
                          className="path-badge"
                          style={{ color: path.accentColor }}
                        >
                          {path.landmarkName}
                        </span>
                        <h3>{path.name}</h3>
                        <p className="path-event-title">{path.event}</p>
                      </div>
                      <button
                        type="button"
                        className="walk-here-btn"
                        onClick={() => {
                          onNavigatePath(path.id);
                          setMapOpen(false);
                        }}
                      >
                        <span>
                          {isCurrent ? "Walking here" : "Turn here"}
                        </span>
                        <ArrowRight size={13} />
                      </button>
                    </div>

                    <div className="path-card-memories">
                      {seg?.memories.map((item) => {
                        const isDiscovered = discovered.has(item.photo.id);
                        const isAudio = item.photo.type === "audio";
                        const isPlayingThis =
                          playingAudioPhoto?.id === item.photo.id;
                        return (
                          <div key={item.photo.id} className="map-memory-row">
                            <button
                              type="button"
                              className="map-memory-jump"
                              onClick={() => {
                                onNavigateDistance(
                                  Math.max(0, item.distance - 4.5),
                                );
                                setMapOpen(false);
                              }}
                            >
                              <span
                                className={`memory-dot ${
                                  isDiscovered ? "discovered" : ""
                                }`}
                              />
                              <span className="map-memory-icon">
                                {getMediaIcon(item)}
                              </span>
                              <span className="map-memory-title">
                                {item.photo.title}
                              </span>
                              {item.photo.time && (
                                <span className="map-memory-time">
                                  {item.photo.time.split("·")[0]}
                                </span>
                              )}
                            </button>
                            {isAudio && (
                              <button
                                type="button"
                                className="map-audio-listen-btn"
                                onClick={() => onToggleInlineAudio(item.photo)}
                                title="Listen to audio clip"
                              >
                                {isPlayingThis ? (
                                  <Pause size={12} />
                                ) : (
                                  <Play size={12} />
                                )}
                              </button>
                            )}
                            <button
                              type="button"
                              className="map-memory-open-btn"
                              onClick={() => {
                                setMapOpen(false);
                                onInspectMemory(item.photo);
                              }}
                            >
                              Open
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="path-connections-footer">
                      <span>Mesh branches:</span>
                      {path.connectedPaths.map((cid) => {
                        const cPath = getPathById(cid);
                        return (
                          <button
                            key={cid}
                            type="button"
                            onClick={() => {
                              onNavigatePath(cid);
                              setMapOpen(false);
                            }}
                          >
                            ↪ {cPath.shortName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
