import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { 
  OrbitControls, 
  PerspectiveCamera, 
  ContactShadows, 
  Grid, 
  Environment,
  Html,
  BakeShadows
} from "@react-three/drei";
import * as THREE from "three";

// --- Constants & Types ---
const WALL_HEIGHT = 2.8;
const BASEBOARD_HEIGHT = 0.1;
const BASEBOARD_THICKNESS = 0.02;
const EXT_WALL_THICKNESS = 0.2;
const INT_WALL_THICKNESS = 0.15;

const APARTMENT_WIDTH = 8.5;
const APARTMENT_DEPTH = 10;
const OFFSET_X = -APARTMENT_WIDTH / 2;
const OFFSET_Z = -APARTMENT_DEPTH / 2;

interface RoomData {
  id: string;
  name: string;
  x: number;
  z: number;
  w: number;
  d: number;
  color: string;
  label?: string;
}

interface wallSegment {
  p1: [number, number]; // [x, z]
  p2: [number, number]; // [x, z]
  thickness: number;
}

// --- Sub-components ---

function Floor({ x, z, w, d, color, name, label }: RoomData) {
  return (
    <group position={[x + w / 2 + OFFSET_X, 0.01, z + d / 2 + OFFSET_Z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <Html position={[0, 0.5, 0]} center distanceFactor={10}>
        <div className="bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap border border-white/20 shadow-xl pointer-events-none select-none">
          {name} {label ? <span className="opacity-60 ml-1">({label})</span> : ""}
        </div>
      </Html>
    </group>
  );
}

function Wall({ p1, p2, thickness }: wallSegment) {
  const dx = p2[0] - p1[0];
  const dz = p2[1] - p1[1];
  const length = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dz, dx);
  
  const midX = (p1[0] + p2[0]) / 2 + OFFSET_X;
  const midZ = (p1[1] + p2[1]) / 2 + OFFSET_Z;

  return (
    <group position={[midX, WALL_HEIGHT / 2, midZ]} rotation={[0, -angle, 0]}>
      {/* Main Wall Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[length, WALL_HEIGHT, thickness]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </mesh>
      
      {/* Baseboard (Both sides) */}
      <mesh position={[0, -(WALL_HEIGHT / 2) + BASEBOARD_HEIGHT / 2, thickness / 2 + BASEBOARD_THICKNESS / 2]}>
        <boxGeometry args={[length, BASEBOARD_HEIGHT, BASEBOARD_THICKNESS]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0, -(WALL_HEIGHT / 2) + BASEBOARD_HEIGHT / 2, -(thickness / 2 + BASEBOARD_THICKNESS / 2)]}>
        <boxGeometry args={[length, BASEBOARD_HEIGHT, BASEBOARD_THICKNESS]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
    </group>
  );
}

// --- Main Layout Component ---

export function ApartmentScene() {
  // 1. Quy hoạch sàn
  const rooms: RoomData[] = [
    { id: "wc", name: "WC", x: 0, z: 0, w: 2, d: 3, color: "#94a3b8", label: "Gạch xám" },
    { id: "kitchen", name: "Nhà Bếp", x: 6, z: 0, w: 2.5, d: 3, color: "#fef3c7", label: "Gỗ sáng" },
    { id: "bedroom", name: "Phòng Ngủ", x: 0, z: 5.5, w: 2.8, d: 4.5, color: "#451a03", label: "2.8m x 4.5m" },
    { id: "balcony", name: "Ban Công", x: 2.8, z: 8.5, w: 5.7, d: 1.5, color: "#cbd5e1" },
    { id: "living", name: "Phòng Khách & Sảnh", x: 2, z: 0, w: 4, d: 3, color: "#f8fafc" }, 
    { id: "main_hall", name: "", x: 0, z: 3, w: 8.5, d: 2.5, color: "#f8fafc" }, 
    { id: "living_top", name: "", x: 2.8, z: 5.5, w: 5.7, d: 3, color: "#f8fafc" }, 
  ];

  // 2. Quy hoạch tường
  const wallSegments: wallSegment[] = useMemo(() => [
    { p1: [0, 0], p2: [3.5, 0], thickness: EXT_WALL_THICKNESS },
    { p1: [5.3, 0], p2: [8.5, 0], thickness: EXT_WALL_THICKNESS },
    { p1: [0, 10], p2: [8.5, 10], thickness: EXT_WALL_THICKNESS },
    { p1: [0, 0], p2: [0, 10], thickness: EXT_WALL_THICKNESS },
    { p1: [8.5, 0], p2: [8.5, 10], thickness: EXT_WALL_THICKNESS },
    { p1: [2, 0], p2: [2, 1], thickness: INT_WALL_THICKNESS },
    { p1: [2, 2], p2: [2, 3], thickness: INT_WALL_THICKNESS },
    { p1: [0, 3], p2: [2, 3], thickness: INT_WALL_THICKNESS },
    { p1: [0, 5.5], p2: [0.5, 5.5], thickness: INT_WALL_THICKNESS },
    { p1: [1.5, 5.5], p2: [2.8, 5.5], thickness: INT_WALL_THICKNESS },
    { p1: [2.8, 5.5], p2: [2.8, 8.85], thickness: INT_WALL_THICKNESS },
    { p1: [2.8, 9.65], p2: [2.8, 10.0], thickness: INT_WALL_THICKNESS },
    { p1: [2.8, 8.5], p2: [3.9, 8.5], thickness: INT_WALL_THICKNESS },
    { p1: [7.4, 8.5], p2: [8.5, 8.5], thickness: INT_WALL_THICKNESS },
  ], []);

  return (
    <div className="relative h-full w-full bg-slate-950 rounded-2xl overflow-hidden ring-1 ring-slate-800 shadow-2xl">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[12, 12, 12]} fov={40} />
        <OrbitControls 
          makeDefault 
          enableDamping 
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2.1} 
        />
        
        <ambientLight intensity={0.5} />
        <spotLight position={[15, 20, 15]} angle={0.3} penumbra={1} intensity={2} castShadow 
          shadow-mapSize={[2048, 2048]} 
        />
        <Environment preset="apartment" />

        <Grid 
          infiniteGrid 
          fadeDistance={40} 
          fadeStrength={5} 
          sectionSize={5} 
          sectionColor="#2dd4bf" 
          cellColor="#1e293b" 
        />
        
        <group>
          {rooms.map((room) => <Floor key={room.id} {...room} />)}
          {wallSegments.map((seg, idx) => <Wall key={idx} {...seg} />)}
        </group>

        <ContactShadows position={[0, -0.01, 0]} opacity={0.6} scale={20} blur={2} far={5} />
        <BakeShadows />
      </Canvas>

      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-700/50 shadow-2xl">
          <h2 className="text-sm font-bold text-white mb-1">Căn hộ 3D - IE402</h2>
          <p className="text-[10px] text-slate-400">Layout: 1PN, 1WC (8.5m x 10.0m)</p>
        </div>
      </div>
    </div>
  );
}
