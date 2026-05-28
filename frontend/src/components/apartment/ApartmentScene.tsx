/* eslint-disable react-refresh/only-export-components */
import React, { useMemo, useState, useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Grid, 
  Environment,
  Html,
  BakeShadows,
  TransformControls,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import type { FurnitureItem, FurnitureCatalogItem } from "@/types";

// --- Types & Constants ---
const WALL_HEIGHT = 2.8;
const DOOR_HEIGHT = 2.2;
const WINDOW_HEIGHT = 1.4;
const WINDOW_Y = 0.9;
const EXT_WALL_THICKNESS = 0.22;
const INT_WALL_THICKNESS = 0.11;

export interface Opening {
  id: string;
  type: "door" | "window" | "sliding_door";
  pos: number; // Khoảng cách từ p1 dọc theo chiều dài tường
  width: number;
}

export interface RoomData {
  id: string;
  name: string;
  x: number;
  z: number;
  w: number;
  d: number;
  color: string;
  label?: string;
  floorType?: "tile" | "wood" | "concrete";
}

export interface WallSegment {
  p1: [number, number];
  p2: [number, number];
  thickness: number;
  openings?: Opening[];
  type?: "wall" | "railing";
}

// --- Layout 1PN LoD3 (6.0m x 6.7m) ---
export const LAYOUT_1PN_ROOMS: RoomData[] = [
  { id: "wc", name: "WC", x: 0, z: 0, w: 2.0, d: 2.5, color: "#dcfce7", floorType: "tile" },
  { id: "kitchen", name: "", x: 4.0, z: 0.1, w: 2.0, d: 2.2, color: "#fef3c7", floorType: "tile" },
  { id: "living_hall", name: "", x: 2.0, z: 0, w: 2.0, d: 3.5, color: "#f8fafc", floorType: "wood" },
  { id: "bedroom", name: "Phòng Ngủ", x: 0, z: 3.5, w: 3.0, d: 3.2, color: "#e0e7ff", floorType: "wood" },
  { id: "balcony", name: "Ban Công", x: 3.0, z: 5.5, w: 3.0, d: 1.2, color: "#cbd5e1", floorType: "concrete" }, 
  { id: "living_main", name: "Phòng khách, Bếp & Ăn", x: 3.0, z: 2.2, w: 3.0, d: 4.5, color: "#f8fafc", floorType: "wood" }, 
];

export const LAYOUT_1PN_WALLS: WallSegment[] = [
  // Tường bao quanh
  { p1: [0, 0], p2: [6.0, 0], thickness: EXT_WALL_THICKNESS, openings: [{ id: "main_door", type: "door", pos: 3.0, width: 1.0 }] },
  { p1: [0, 6.7], p2: [3.0, 6.7], thickness: EXT_WALL_THICKNESS, openings: [{ id: "bed_win", type: "window", pos: 1.0, width: 1.2 }] },
  { p1: [3.0, 6.7], p2: [6.0, 6.7], thickness: 0.05, type: "railing" }, // Lan can ban công
  { p1: [0, 0], p2: [0, 6.7], thickness: EXT_WALL_THICKNESS },
  { p1: [6.0, 0], p2: [6.0, 5.5], thickness: EXT_WALL_THICKNESS },
  { p1: [6.0, 5.5], p2: [6.0, 6.7], thickness: 0.05, type: "railing" }, // Lan can ban công cạnh bên
  // Tường ngăn WC
  { p1: [2.0, 0], p2: [2.0, 2.5], thickness: INT_WALL_THICKNESS, openings: [{ id: "wc_door", type: "door", pos: 0.5, width: 0.8 }] },
  { p1: [0, 2.5], p2: [2.0, 2.5], thickness: INT_WALL_THICKNESS },
  // Tường ngăn Phòng Ngủ (Đặc, không có cửa ra ban công)
  { p1: [0, 3.5], p2: [3.0, 3.5], thickness: INT_WALL_THICKNESS, openings: [{ id: "bed_door", type: "door", pos: 0.5, width: 0.9 }] },
  { p1: [3.0, 3.5], p2: [3.0, 6.7], thickness: INT_WALL_THICKNESS }, 
  // Tường ngăn Phòng Khách và Ban công (Cửa kính kéo)
  { p1: [3.0, 5.5], p2: [6.0, 5.5], thickness: INT_WALL_THICKNESS, openings: [{ id: "living_balcony_door", type: "sliding_door", pos: 0.5, width: 2.0 }] },
];

// --- Layout 2PN LoD3 (10.1m x 7.0m ≈ 70m2) ---
export const LAYOUT_2PN_ROOMS: RoomData[] = [
  { id: "br1", name: "Phòng ngủ 1", x: 0.4, z: 0.22, w: 3.25, d: 2.88, color: "#e0e7ff", floorType: "wood" },
  { id: "wc1", name: "WC 1", x: 3.76, z: 0.22, w: 1.69, d: 2.88, color: "#dcfce7", floorType: "tile" },
  { id: "br2", name: "Phòng ngủ 2", x: 5.56, z: 0.22, w: 4.34, d: 2.88, color: "#e0e7ff", floorType: "wood" },
  { id: "hallway", name: "", x: 0.4, z: 3.1, w: 2.2, d: 1.82, color: "#f1f5f9", floorType: "wood" },
  { id: "wc2", name: "WC 2", x: 0.4, z: 4.92, w: 2.2, d: 2.08, color: "#dcfce7", floorType: "tile" },
  { id: "living_combined", name: "Phòng khách, Bếp & Ăn", x: 2.6, z: 3.1, w: 6.38, d: 3.9, color: "#f8fafc", floorType: "wood" },
  { id: "loggia", name: "Loggia", x: 8.98, z: 3.21, w: 0.9, d: 3.79, color: "#cbd5e1", floorType: "concrete" },
];

export const LAYOUT_2PN_WALLS: WallSegment[] = [
  // Tường bao ngoài
  { p1: [0, 0], p2: [10.1, 0], thickness: EXT_WALL_THICKNESS, openings: [
    { id: "br1_win", type: "window", pos: 1.0, width: 1.5 },
    { id: "br2_win", type: "window", pos: 7.0, width: 1.5 }
  ]},
  { p1: [0, 7.0], p2: [8.98, 7.0], thickness: EXT_WALL_THICKNESS },
  { p1: [8.98, 7.0], p2: [10.1, 7.0], thickness: 0.05, type: "railing" },
  { p1: [0, 0], p2: [0, 3.2], thickness: EXT_WALL_THICKNESS },
  { p1: [0, 3.2], p2: [0, 4.8], thickness: EXT_WALL_THICKNESS, openings: [{ id: "main_door_2", type: "door", pos: 0.3, width: 1.0 }] },
  { p1: [0, 4.8], p2: [0, 7.0], thickness: EXT_WALL_THICKNESS },
  { p1: [10.1, 0], p2: [10.1, 3.2], thickness: EXT_WALL_THICKNESS },
  { p1: [10.1, 3.2], p2: [10.1, 7.0], thickness: 0.05, type: "railing" },
  
  // Tường nội thất
  { p1: [3.65, 0], p2: [3.65, 3.1], thickness: INT_WALL_THICKNESS }, 
  { p1: [5.45, 0], p2: [5.45, 3.1], thickness: INT_WALL_THICKNESS, openings: [{ id: "wc1_door", type: "door", pos: 1.2, width: 0.8 }] },
  { p1: [0, 3.1], p2: [10.1, 3.1], thickness: INT_WALL_THICKNESS, openings: [
    { id: "br1_door", type: "door", pos: 2.8, width: 0.9 },
    { id: "br2_door", type: "door", pos: 5.8, width: 0.9 }
  ]},
  { p1: [0, 4.8], p2: [2.6, 4.8], thickness: INT_WALL_THICKNESS },
  // Tường ngăn giữa WC2 và Phòng khách (Đã xóa hẳn phần tường cửa vào tiền sảnh)
  { p1: [2.6, 4.8], p2: [2.6, 7.0], thickness: INT_WALL_THICKNESS, openings: [
    { id: "wc2_door", type: "door", pos: 0.8, width: 0.8 } 
  ]},
  // Cửa kính kéo ra Loggia
  { p1: [8.98, 3.1], p2: [8.98, 7.0], thickness: INT_WALL_THICKNESS, openings: [{ id: "loggia_door", type: "sliding_door", pos: 1.0, width: 2.0 }] },
];

// --- Helper Components ---

function Wall({ p1, p2, thickness, offsetX, offsetZ, openings = [], type = "wall" }: WallSegment & { offsetX: number, offsetZ: number }) {
  const dx = p2[0] - p1[0];
  const dz = p2[1] - p1[1];
  const length = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dz, dx);
  const midX = (p1[0] + p2[0]) / 2 + offsetX;
  const midZ = (p1[1] + p2[1]) / 2 + offsetZ;

  const h = type === "railing" ? 1.1 : WALL_HEIGHT;

  // Render tường LoD3 với các ô cửa
  const wallParts = useMemo(() => {
    const parts = [];
    let currentPos = 0;

    if (type === "railing") {
      parts.push({ x: 0, w: length, y: h / 2, h: h });
      return parts;
    }

    const sortedOpenings = [...openings].sort((a, b) => a.pos - b.pos);
    sortedOpenings.forEach((op) => {
      // Phần tường trước opening
      if (op.pos > currentPos) {
        parts.push({
          x: (currentPos + op.pos) / 2 - length / 2,
          w: op.pos - currentPos,
          y: WALL_HEIGHT / 2,
          h: WALL_HEIGHT,
        });
      }
      // Phần tường trên opening (lanh-tô)
      const opTopY = op.type === "window" ? WINDOW_Y + WINDOW_HEIGHT : DOOR_HEIGHT;
      if (opTopY < WALL_HEIGHT) {
        parts.push({
          x: op.pos + op.width / 2 - length / 2,
          w: op.width,
          y: (opTopY + WALL_HEIGHT) / 2,
          h: WALL_HEIGHT - opTopY,
        });
      }
      // Phần tường dưới window (bậu cửa)
      if (op.type === "window" && WINDOW_Y > 0) {
        parts.push({
          x: op.pos + op.width / 2 - length / 2,
          w: op.width,
          y: WINDOW_Y / 2,
          h: WINDOW_Y,
        });
      }
      currentPos = op.pos + op.width;
    });

    // Phần tường cuối cùng sau các opening
    if (currentPos < length) {
      parts.push({
        x: (currentPos + length) / 2 - length / 2,
        w: length - currentPos,
        y: WALL_HEIGHT / 2,
        h: WALL_HEIGHT,
      });
    }

    return parts;
  }, [length, openings, type, h]);

  return (
    <group position={[midX, 0, midZ]} rotation={[0, -angle, 0]}>
      {wallParts.map((part, i) => (
        <mesh key={i} position={[part.x, part.y, 0]} castShadow receiveShadow>
          <boxGeometry args={[part.w, part.h, thickness]} />
          <meshStandardMaterial 
            color={type === "railing" ? "#bae6fd" : "#ffffff"} 
            transparent={type === "railing"}
            opacity={type === "railing" ? 0.4 : 1}
          />
        </mesh>
      ))}
      {type === "railing" && (
        <mesh position={[0, h, 0]}>
          <boxGeometry args={[length, 0.05, thickness + 0.02]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      )}
      {/* Render Door/Window Frames (LoD3) */}
      {openings.map((op) => {
        if (op.type === "door") {
          return (
             <group key={op.id} position={[op.pos + op.width / 2 - length / 2, DOOR_HEIGHT / 2, 0]}>
               {/* Frame */}
               <mesh>
                 <boxGeometry args={[op.width, DOOR_HEIGHT, thickness + 0.02]} />
                 <meshStandardMaterial color="#4a3728" wireframe={true} />
               </mesh>
               {/* Door leaf (opened 45deg) */}
               <group position={[-op.width/2, 0, 0]} rotation={[0, Math.PI/4, 0]}>
                 <mesh position={[op.width/2, 0, 0.02]}>
                   <boxGeometry args={[op.width, DOOR_HEIGHT, 0.04]} />
                   <meshStandardMaterial color="#8b4513" />
                 </mesh>
               </group>
             </group>
          );
        }
        if (op.type === "window") {
          return (
            <group key={op.id} position={[op.pos + op.width / 2 - length / 2, WINDOW_Y + WINDOW_HEIGHT / 2, 0]}>
               <mesh>
                 <boxGeometry args={[op.width, WINDOW_HEIGHT, thickness + 0.02]} />
                 <meshStandardMaterial color="#1e293b" wireframe />
               </mesh>
               <mesh>
                 <boxGeometry args={[op.width - 0.1, WINDOW_HEIGHT - 0.1, 0.02]} />
                 <meshStandardMaterial color="#bae6fd" transparent opacity={0.4} metalness={0.9} roughness={0.1} />
               </mesh>
            </group>
          );
        }
        if (op.type === "sliding_door") {
          return (
            <group key={op.id} position={[op.pos + op.width / 2 - length / 2, DOOR_HEIGHT / 2, 0]}>
               {/* Outer Frame */}
               <mesh>
                 <boxGeometry args={[op.width, DOOR_HEIGHT, thickness + 0.04]} />
                 <meshStandardMaterial color="#1e293b" wireframe />
               </mesh>
               {/* Two Glass Panels */}
               <mesh position={[-op.width/4, 0, 0.01]}>
                 <boxGeometry args={[op.width/2, DOOR_HEIGHT - 0.1, 0.02]} />
                 <meshStandardMaterial color="#bae6fd" transparent opacity={0.3} metalness={0.8} />
               </mesh>
               <mesh position={[op.width/4, 0, -0.01]}>
                 <boxGeometry args={[op.width/2, DOOR_HEIGHT - 0.1, 0.02]} />
                 <meshStandardMaterial color="#bae6fd" transparent opacity={0.3} metalness={0.8} />
               </mesh>
            </group>
          );
        }
        return null;
      })}
    </group>
  );
}

// Component riêng để dùng useGLTF hợp lệ (không vi phạm Rules of Hooks)
function GltfModel({ url, scaleX, scaleY, scaleZ }: { url: string; scaleX: number; scaleY: number; scaleZ: number }) {
  const { scene } = useGLTF(url);
  const normalizedScene = useMemo(() => {
    const clone = scene.clone();
    
    // Store original rotation and scale
    const origRot = clone.rotation.clone();
    const origScale = clone.scale.clone();
    
    // Temporarily reset rotation and scale to measure raw local dimensions
    clone.rotation.set(0, 0, 0);
    clone.scale.set(1, 1, 1);
    
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    
    const sizeX = size.x || 1;
    const sizeY = size.y || 1;
    const sizeZ = size.z || 1;
    
    // Scale local axes: X (width) -> scaleX, Y (height) -> scaleY, Z (depth) -> scaleZ
    clone.scale.set(
      (scaleX / sizeX) * origScale.x,
      (scaleY / sizeY) * origScale.y,
      (scaleZ / sizeZ) * origScale.z
    );
    
    // Restore original rotation
    clone.rotation.copy(origRot);
    
    // Recalculate bounding box with final transformations to align position
    const newBox = new THREE.Box3().setFromObject(clone);
    const center = new THREE.Vector3();
    newBox.getCenter(center);
    
    clone.position.x -= center.x;
    clone.position.z -= center.z;
    clone.position.y -= newBox.min.y;
    
    return clone;
  }, [scene, scaleX, scaleY, scaleZ]);

  return <primitive object={normalizedScene} />;
}

interface FurnitureNodeProps {
  item: FurnitureItem;
  catalogItem?: FurnitureCatalogItem;
  offsetX: number;
  offsetZ: number;
  onItemMove?: (id: number, x: number, z: number, y: number) => void;
  onItemRotate?: (id: number, rotY: number) => void;
  selected: boolean;
  onSelect: (id: number) => void;
  readOnly: boolean;
}

function FurnitureNode({ 
  item, 
  catalogItem, 
  offsetX, 
  offsetZ, 
  onItemMove, 
  onItemRotate,
  selected,
  onSelect,
  readOnly
}: FurnitureNodeProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [meshNode, setMeshNode] = useState<THREE.Group | null>(null);
  const [transformMode, setTransformMode] = useState<"translate" | "rotate">("translate");
  const degSpanRef = useRef<HTMLSpanElement>(null);
  // liveRotationY state is kept in Radians for Smooth orbit manipulation
  const [liveRotationY, setLiveRotationY] = useState<number>(
    ((Number(item.rotationY) || 0) * Math.PI) / 180
  );

  React.useEffect(() => {
    setLiveRotationY(((Number(item.rotationY) || 0) * Math.PI) / 180);
  }, [item.rotationY]);

  const matched = item.position.match(/POINT\s+Z\s*\(\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s*\)/i);
  const px = Number(matched?.[1] || 0);
  const pz = Number(matched?.[2] || 0);
  const py = Number(matched?.[3] || 0);
  
  const rotX = ((Number(item.rotationX) || 0) * Math.PI) / 180;
  const rotZ = ((Number(item.rotationZ) || 0) * Math.PI) / 180;

  const scaleX = Number(item.scaleX) || 1;
  const scaleY = Number(item.scaleY) || 1;
  const scaleZ = Number(item.scaleZ) || 1;

  const degrees = useMemo(() => {
    let deg = (liveRotationY * 180) / Math.PI;
    deg = deg % 360;
    if (deg < 0) deg += 360;
    return Math.round(deg / 15) * 15;
  }, [liveRotationY]);

  return (
    <group>
      <group 
        ref={(node) => {
          (meshRef as React.MutableRefObject<THREE.Group | null>).current = node;
          if (meshNode !== node) {
            setMeshNode(node);
          }
        }} 
        position={[px + offsetX, py, pz + offsetZ]} 
        rotation={[rotX, liveRotationY, rotZ]}
        onClick={(e) => {
          e.stopPropagation();
          if (readOnly) return;
          onSelect(item.id);
        }}
      >
        <Suspense fallback={<mesh><boxGeometry args={[scaleX, scaleZ, scaleY]} /><meshStandardMaterial color="gray" /></mesh>}>
          {catalogItem?.model3dUrl ? (
            <GltfModel url={catalogItem.model3dUrl} scaleX={scaleX} scaleY={scaleZ} scaleZ={scaleY} />
          ) : (
            <mesh position={[0, scaleZ/2, 0]} castShadow receiveShadow>
              <boxGeometry args={[scaleX, scaleZ, scaleY]} />
              <meshStandardMaterial 
                color={selected && !readOnly && !item.isLocked ? "#3b82f6" : "#cbd5e1"} 
                emissive={selected && !readOnly && !item.isLocked ? "#3b82f6" : "#000000"}
                emissiveIntensity={selected && !readOnly && !item.isLocked ? 0.2 : 0}
              />
            </mesh>
          )}
        </Suspense>

        <Html position={[0, scaleZ + 0.4, 0]} center distanceFactor={10}>
          <div className="flex flex-col items-center gap-1.5 pointer-events-none select-none">
            <div className={`px-2.5 py-1 rounded-md text-[9px] font-bold shadow-lg whitespace-nowrap transition-all flex items-center gap-2 ${
              selected && !readOnly && !item.isLocked ? "bg-blue-600 text-white scale-110 ring-2 ring-white/50" : "bg-slate-800/80 text-slate-200 backdrop-blur-sm"
             }`}>
              <span>
                {item.label || catalogItem?.name || "Nội thất"}
                {item.isLocked && " 🔒"}
              </span>
              {selected && !readOnly && !item.isLocked && transformMode === "rotate" && (
                <span ref={degSpanRef} className="bg-white/20 px-1 rounded font-mono">{degrees}°</span>
              )}
            </div>
            {selected && !readOnly && !item.isLocked && (
              <div className="flex gap-1.5 pointer-events-auto mt-0.5">
                <button 
                  className={`px-3 py-1 rounded-md text-[9px] font-extrabold shadow-md transition-all active:scale-95 ${
                    transformMode === "translate" 
                      ? "bg-blue-600 text-white ring-2 ring-blue-300" 
                      : "bg-white/90 text-slate-600 hover:bg-white"
                  }`}
                  onClick={(e) => { e.stopPropagation(); setTransformMode("translate"); }}
                >
                  DỜI
                </button>
                <button 
                  className={`px-3 py-1 rounded-md text-[9px] font-extrabold shadow-md transition-all active:scale-95 ${
                    transformMode === "rotate" 
                      ? "bg-blue-600 text-white ring-2 ring-blue-300" 
                      : "bg-white/90 text-slate-600 hover:bg-white"
                  }`}
                  onClick={(e) => { e.stopPropagation(); setTransformMode("rotate"); }}
                >
                  XOAY
                </button>
              </div>
            )}
          </div>
        </Html>
      </group>

      {selected && !readOnly && !item.isLocked && (
        <TransformControls 
          object={meshNode ?? undefined} 
          mode={transformMode}
          showX={transformMode === "translate"}
          showZ={transformMode === "translate"}
          showY={transformMode === "rotate"}
          rotationSnap={Math.PI / 12}
          onChange={() => {
            if (meshRef.current && transformMode === "rotate") {
              const currentRotY = meshRef.current.rotation.y;
              let deg = (currentRotY * 180) / Math.PI;
              deg = deg % 360;
              if (deg < 0) deg += 360;
              const roundedDeg = Math.round(deg / 15) * 15;
              if (degSpanRef.current) {
                degSpanRef.current.textContent = `${roundedDeg}°`;
              }
            }
          }}
          onMouseUp={() => {
            if (!meshRef.current) return;
            const newPos = meshRef.current.position;
            const newRot = meshRef.current.rotation;
            
            if (transformMode === "translate" && onItemMove) {
              onItemMove(
                item.id, 
                Number((newPos.x - offsetX).toFixed(2)), 
                Number((newPos.z - offsetZ).toFixed(2)), 
                Number(newPos.y.toFixed(2))
              );
            } else if (transformMode === "rotate" && onItemRotate) {
              const snap = Math.PI / 12;
              const snappedRotYRad = Math.round(newRot.y / snap) * snap;
              const snappedRotYDeg = Math.round((snappedRotYRad * 180) / Math.PI);
              onItemRotate(item.id, snappedRotYDeg);
              setLiveRotationY(snappedRotYRad);
            }
          }}
        />
      )}
    </group>
  );
}

// --- Main Scene ---
export interface ApartmentSceneProps {
  items?: FurnitureItem[];
  catalog?: FurnitureCatalogItem[];
  onItemMove?: (id: number, x: number, z: number, y: number) => void;
  onItemRotate?: (id: number, rotY: number) => void;
  activeLayout?: string;
  readOnly?: boolean;
}

export function ApartmentScene({ 
  items = [], 
  catalog = [], 
  onItemMove, 
  onItemRotate, 
  activeLayout: externalLayout,
  readOnly = false
}: ApartmentSceneProps) {
  const activeLayout = externalLayout || "1PN";
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  
  const width = activeLayout === "1PN" ? 6.0 : 10.1;
  const depth = activeLayout === "1PN" ? 6.7 : 7.0;
  const offsetX = -width / 2;
  const offsetZ = -depth / 2;

  const rooms = useMemo(() => activeLayout === "1PN" ? LAYOUT_1PN_ROOMS : LAYOUT_2PN_ROOMS, [activeLayout]);
  const walls = useMemo(() => activeLayout === "1PN" ? LAYOUT_1PN_WALLS : LAYOUT_2PN_WALLS, [activeLayout]);

  return (
    <div className="relative h-full w-full bg-slate-950 rounded-2xl overflow-hidden shadow-2xl">
      <Canvas shadows dpr={[1, 2]} onPointerMissed={() => {
        if (!readOnly) setSelectedItemId(null);
      }}>
        <PerspectiveCamera makeDefault position={[12, 12, 12]} fov={35} />
        <OrbitControls makeDefault enableDamping />
        <ambientLight intensity={0.6} />
        <pointLight position={[0, 5, 0]} intensity={1} castShadow />
        <spotLight position={[15, 20, 15]} angle={0.3} intensity={1.5} castShadow />
        <Environment preset="apartment" />
        <Grid infiniteGrid sectionSize={5} sectionColor="#2dd4bf" cellColor="#1e293b" />
        
        <group>
          {/* Base Floor (LoD3: Unified Floor for the whole apartment) */}
          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[width, depth]} />
            <meshStandardMaterial color="#c19a6b" roughness={0.7} metalness={0.1} />
          </mesh>

          {/* Render Room Labels only (Floor meshes are now unified above) */}
          {rooms.map((room) => (
            <group key={room.id} position={[room.x + room.w / 2 + offsetX, 0.02, room.z + room.d / 2 + offsetZ]}>
               {/* WC or Special Tiles could still be overlaid if needed, but keeping it simple as requested */}
               {(room.id.includes("wc") || room.id === "loggia") && (
                 <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                   <planeGeometry args={[room.w - 0.02, room.d - 0.02]} />
                   <meshStandardMaterial 
                     color={room.id === "loggia" ? "#cbd5e1" : "#f8f9fa"} 
                     roughness={0.6} 
                   />
                 </mesh>
               )}
            </group>
          ))}
          
          {walls.map((seg, idx) => <Wall key={idx} {...seg} offsetX={offsetX} offsetZ={offsetZ} />)}
          
          {items.map((item) => {
            const catalogItem = catalog.find((c) => c.id === item.catalogId);
            return (
              <FurnitureNode 
                key={item.id}
                item={item}
                catalogItem={catalogItem}
                offsetX={offsetX}
                offsetZ={offsetZ}
                onItemMove={onItemMove}
                onItemRotate={onItemRotate}
                selected={selectedItemId === item.id}
                onSelect={setSelectedItemId}
                readOnly={readOnly}
              />
            );
          })}
        </group>
        <BakeShadows />
      </Canvas>


    </div>
  );
}

export const MOCK_ROOMS = LAYOUT_1PN_ROOMS;
export const MOCK_WALLS = LAYOUT_1PN_WALLS;
