import React, { useMemo, useState, useRef, Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { 
  OrbitControls, 
  PerspectiveCamera, 
  ContactShadows, 
  Grid, 
  Environment,
  Html,
  BakeShadows,
  TransformControls,
  useGLTF
} from "@react-three/drei";
import * as THREE from "three";
import type { FurnitureItem, FurnitureCatalogItem } from "@/types";

// --- Types & Constants ---
const WALL_HEIGHT = 2.8;
const EXT_WALL_THICKNESS = 0.22;
const INT_WALL_THICKNESS = 0.11;

export interface RoomData {
  id: string;
  name: string;
  x: number;
  z: number;
  w: number;
  d: number;
  color: string;
  label?: string;
}

export interface WallSegment {
  p1: [number, number];
  p2: [number, number];
  thickness: number;
}

// --- Layout 1PN Definitions (6.0m x 6.7m ≈ 40m2) ---
export const LAYOUT_1PN_ROOMS: RoomData[] = [
  { id: "wc", name: "WC", x: 0, z: 0, w: 2.0, d: 2.5, color: "#dcfce7" },
  { id: "kitchen", name: "Nhà Bếp", x: 4.0, z: 0.1, w: 2.0, d: 2.2, color: "#fef3c7" },
  { id: "living_hall", name: "Phòng Khách & Sảnh", x: 2.0, z: 0, w: 2.0, d: 3.5, color: "#f8fafc" },
  { id: "bedroom", name: "Phòng Ngủ", x: 0, z: 3.5, w: 3.0, d: 3.2, color: "#e0e7ff" },
  { id: "balcony", name: "Ban Công", x: 3.0, z: 5.5, w: 3.0, d: 1.2, color: "#cbd5e1" }, 
  { id: "living_main", name: "", x: 3.0, z: 2.2, w: 3.0, d: 4.5, color: "#f8fafc" }, 
];

export const LAYOUT_1PN_WALLS: WallSegment[] = [
  { p1: [0, 0], p2: [3.0, 0], thickness: EXT_WALL_THICKNESS },
  { p1: [4.0, 0], p2: [6.0, 0], thickness: EXT_WALL_THICKNESS }, 
  { p1: [0, 6.7], p2: [6.0, 6.7], thickness: EXT_WALL_THICKNESS },
  { p1: [0, 0], p2: [0, 6.7], thickness: EXT_WALL_THICKNESS },
  { p1: [6.0, 0], p2: [6.0, 6.7], thickness: EXT_WALL_THICKNESS },
  { p1: [2.0, 0], p2: [2.0, 0.5], thickness: INT_WALL_THICKNESS },
  { p1: [2.0, 1.5], p2: [2.0, 2.5], thickness: INT_WALL_THICKNESS },
  { p1: [0, 2.5], p2: [2.0, 2.5], thickness: INT_WALL_THICKNESS },
  { p1: [0, 3.5], p2: [0.5, 3.5], thickness: INT_WALL_THICKNESS },
  { p1: [1.5, 3.5], p2: [3.0, 3.5], thickness: INT_WALL_THICKNESS },
  { p1: [3.0, 3.5], p2: [3.0, 6.7], thickness: INT_WALL_THICKNESS },
];

// --- Layout 2PN Definitions (10.1m x 7.0m ≈ 70m2) ---
export const LAYOUT_2PN_ROOMS: RoomData[] = [
  { id: "br1", name: "Phòng ngủ 1", x: 0.4, z: 0.22, w: 3.25, d: 2.88, color: "#e0e7ff", label: "9.4m2" },
  { id: "wc1", name: "WC 1", x: 3.76, z: 0.22, w: 1.69, d: 2.88, color: "#dcfce7", label: "Ensuite" },
  { id: "br2", name: "Phòng ngủ 2", x: 5.56, z: 0.22, w: 4.34, d: 2.88, color: "#e0e7ff", label: "12.5m2" },
  { id: "hallway", name: "Tiền sảnh", x: 0.4, z: 3.21, w: 2.2, d: 1.6, color: "#f1f5f9", label: "3.7m2" },
  { id: "wc2", name: "WC 2", x: 0.4, z: 4.92, w: 2.2, d: 1.7, color: "#dcfce7", label: "3.3m2" },
  { id: "living_combined", name: "Khách, Bếp & Ăn", x: 2.6, z: 3.21, w: 6.28, d: 3.41, color: "#f8fafc", label: "21.4m2" },
  { id: "loggia", name: "Loggia", x: 8.98, z: 3.21, w: 0.9, d: 3.41, color: "#cbd5e1", label: "3.8m2" },
];

export const LAYOUT_2PN_WALLS: WallSegment[] = [
  { p1: [0, 0], p2: [10.1, 0], thickness: EXT_WALL_THICKNESS },
  { p1: [0, 7.0], p2: [10.1, 7.0], thickness: EXT_WALL_THICKNESS },
  { p1: [0, 0], p2: [0, 3.2], thickness: EXT_WALL_THICKNESS },
  { p1: [0, 4.8], p2: [0, 7.0], thickness: EXT_WALL_THICKNESS }, 
  { p1: [10.1, 0], p2: [10.1, 7.0], thickness: EXT_WALL_THICKNESS },
  { p1: [0, 3.1], p2: [2.5, 3.1], thickness: INT_WALL_THICKNESS },
  { p1: [3.5, 3.1], p2: [5.5, 3.1], thickness: INT_WALL_THICKNESS },
  { p1: [6.5, 3.1], p2: [10.1, 3.1], thickness: INT_WALL_THICKNESS },
  { p1: [3.65, 0], p2: [3.65, 3.1], thickness: INT_WALL_THICKNESS },
  { p1: [5.45, 0], p2: [5.45, 0.8], thickness: INT_WALL_THICKNESS },
  { p1: [5.45, 1.8], p2: [5.45, 3.1], thickness: INT_WALL_THICKNESS }, 
  { p1: [0, 4.8], p2: [2.6, 4.8], thickness: INT_WALL_THICKNESS },
  { p1: [2.6, 3.1], p2: [2.6, 3.3], thickness: INT_WALL_THICKNESS },
  { p1: [2.6, 4.8], p2: [2.6, 5.2], thickness: INT_WALL_THICKNESS },
  { p1: [2.6, 6.2], p2: [2.6, 7.0], thickness: INT_WALL_THICKNESS },
];

// --- Export constants for reference ---
export const APARTMENT_WIDTH = 10.1;
export const APARTMENT_DEPTH = 10.0;

// --- Helper Components ---
function Floor({ x, z, w, d, color, name, label, offsetX, offsetZ }: RoomData & { offsetX: number, offsetZ: number }) {
  return (
    <group position={[x + w / 2 + offsetX, 0.012, z + d / 2 + offsetZ]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {name && (
        <Html position={[0, 0.5, 0]} center distanceFactor={10}>
          <div className="bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold border border-white/20 shadow-xl pointer-events-none whitespace-nowrap">
            {name} {label ? <span className="opacity-60 ml-1">({label})</span> : ""}
          </div>
        </Html>
      )}
    </group>
  );
}

function Wall({ p1, p2, thickness, offsetX, offsetZ }: WallSegment & { offsetX: number, offsetZ: number }) {
  const dx = p2[0] - p1[0];
  const dz = p2[1] - p1[1];
  const length = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dz, dx);
  const midX = (p1[0] + p2[0]) / 2 + offsetX;
  const midZ = (p1[1] + p2[1]) / 2 + offsetZ;

  return (
    <group position={[midX, 1.4, midZ]} rotation={[0, -angle, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[length, 2.8, thickness]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

// --- Main Scene ---
export function ApartmentScene({ items = [], catalog = [], onItemMove, activeLayout: externalLayout }: any) {
  const activeLayout = externalLayout || "1PN";
  
  const width = activeLayout === "1PN" ? 6.0 : 10.1;
  const depth = activeLayout === "1PN" ? 6.7 : 7.0;
  const offsetX = -width / 2;
  const offsetZ = -depth / 2;

  const rooms = useMemo(() => activeLayout === "1PN" ? LAYOUT_1PN_ROOMS : LAYOUT_2PN_ROOMS, [activeLayout]);
  const walls = useMemo(() => activeLayout === "1PN" ? LAYOUT_1PN_WALLS : LAYOUT_2PN_WALLS, [activeLayout]);

  return (
    <div className="relative h-full w-full bg-slate-950 rounded-2xl overflow-hidden shadow-2xl">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[10, 10, 10]} fov={35} />
        <OrbitControls makeDefault enableDamping />
        <ambientLight intensity={0.5} />
        <spotLight position={[15, 20, 15]} angle={0.3} intensity={1.5} castShadow />
        <Environment preset="apartment" />
        <Grid infiniteGrid sectionSize={5} sectionColor="#2dd4bf" cellColor="#1e293b" />
        <group>
          {/* Base Floor Mesh to fill gaps */}
          <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[width, depth]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
          </mesh>

          {rooms.map((room) => <Floor key={room.id} {...room} offsetX={offsetX} offsetZ={offsetZ} />)}
          {walls.map((seg, idx) => <Wall key={idx} {...seg} offsetX={offsetX} offsetZ={offsetZ} />)}
          {items.map((item: any) => {
             const catalogItem = catalog.find((c: any) => c.id === item.catalogId);
             const matched = item.position.match(/POINT\s+Z\s*\(\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s*\)/i);
             const px = Number(matched?.[1] || 0);
             const pz = Number(matched?.[2] || 0);
             const py = Number(matched?.[3] || 0);
             const rotY = Number(item.rotationY) || 0;
             const h = Number(catalogItem?.defaultHeight) || 0.8;

             return (
               <group key={item.id} position={[px + offsetX, py, pz + offsetZ]} rotation={[0, rotY, 0]}>
                 <Suspense fallback={<mesh><boxGeometry args={[1,1,1]} /><meshStandardMaterial color="gray" /></mesh>}>
                    {catalogItem?.model3dUrl ? (
                      <primitive object={useGLTF(catalogItem.model3dUrl).scene.clone()} />
                    ) : (
                      <mesh position={[0, h/2, 0]}><boxGeometry args={[0.8, h, 0.8]} /><meshStandardMaterial color="#64748b" /></mesh>
                    )}
                 </Suspense>
               </group>
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
