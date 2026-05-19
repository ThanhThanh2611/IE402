import { useRef, useMemo, useState } from "react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// 1. Data Structure: Layouts
const LAYOUT_1PN = [
  { id: "kitchen", name: "Bếp", x: 0, z: 2.5, width: 6.5, depth: 1.5, color: "#fef3c7" },
  { id: "living_dining", name: "Phòng khách & Ăn", x: 0, z: 1.0, width: 6.5, depth: 1.5, color: "#f8fafc" },
  { id: "living_extra", name: "Sảnh / Lối đi", x: -2.25, z: -0.5, width: 2.0, depth: 1.5, color: "#f8fafc" },
  { id: "wc", name: "WC", x: -2.25, z: -2.25, width: 2.0, depth: 2.0, color: "#dcfce7" },
  { id: "bedroom", name: "Phòng ngủ", x: 1.0, z: -1.5, width: 4.5, depth: 3.5, color: "#e0e7ff" }
];

const LAYOUT_2PN = [
  // Cụm bên trái: Lô gia -> Khách -> Ăn -> Bếp
  { id: "loggia_1", name: "Lô gia 1", x: -2.75, z: 3.5, width: 3.0, depth: 0.5, color: "#cbd5e1" },
  { id: "living", name: "Phòng khách", x: -2.75, z: 1.5, width: 3.0, depth: 3.5, color: "#f8fafc" },
  { id: "dining", name: "Phòng Ăn", x: -2.75, z: -1.0, width: 3.0, depth: 1.5, color: "#f8fafc" },
  { id: "kitchen", name: "Nhà Bếp", x: -2.75, z: -2.75, width: 3.0, depth: 2.0, color: "#fef3c7" },
  { id: "loggia_2", name: "Lô gia 2", x: -4.5, z: -2.75, width: 0.5, depth: 2.0, color: "#cbd5e1" },
  
  // Cụm ở giữa: WC chung & Góc học tập
  { id: "wc_common", name: "WC Chung", x: 0.75, z: -1.5, width: 1.5, depth: 2.0, color: "#dcfce7" },
  { id: "study_niche", name: "Góc học tập", x: 0.75, z: 0.5, width: 1.5, depth: 2.0, color: "#f1f5f9" },
  
  // Cụm bên phải: Master (WC nội khu) + Phòng ngủ 2
  { id: "master_bedroom", name: "P.Ngủ Master", x: 2.75, z: 1.75, width: 3.5, depth: 4.0, color: "#e0e7ff" },
  { id: "wc_master", name: "WC Master", x: 3.75, z: -0.75, width: 1.5, depth: 1.0, color: "#dcfce7" }, // Ensuite
  { id: "bedroom_2", name: "Phòng ngủ 2", x: 2.75, z: -2.5, width: 3.5, depth: 2.5, color: "#e0e7ff" },
];

const WALL_HEIGHT = 2.8;
const WALL_THICKNESS = 0.15; 
const WALL_COLOR = "#ffffff";
const SCALE_MODIFIER = 1.15; 

interface RoomProps {
  name: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  color: string;
}

function Room({ name, x, z, width, depth, color }: RoomProps) {
  const sX = x * SCALE_MODIFIER;
  const sZ = z * SCALE_MODIFIER;
  const sW = width * SCALE_MODIFIER;
  const sD = depth * SCALE_MODIFIER;

  const walls = useMemo(() => [
    { pos: [sX, WALL_HEIGHT / 2, sZ - sD / 2], size: [sW, WALL_HEIGHT, WALL_THICKNESS] },
    { pos: [sX, WALL_HEIGHT / 2, sZ + sD / 2], size: [sW, WALL_HEIGHT, WALL_THICKNESS] },
    { pos: [sX - sW / 2, WALL_HEIGHT / 2, sZ], size: [WALL_THICKNESS, WALL_HEIGHT, sD] },
    { pos: [sX + sW / 2, WALL_HEIGHT / 2, sZ], size: [WALL_THICKNESS, WALL_HEIGHT, sD] },
  ], [sX, sZ, sW, sD]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[sX, 0.02, sZ]} receiveShadow>
        <planeGeometry args={[sW, sD]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
      </mesh>

      {walls.map((wall, idx) => (
        <mesh key={idx} position={wall.pos as [number, number, number]} castShadow receiveShadow>
          <boxGeometry args={wall.size as [number, number, number]} />
          <meshStandardMaterial color={WALL_COLOR} roughness={0.5} />
        </mesh>
      ))}

      <Html
        position={[sX, 1.2, sZ]}
        center
        distanceFactor={6}
        className="pointer-events-none select-none"
      >
        <div className="bg-slate-900/90 text-white px-2 py-0.5 rounded-full border border-slate-700 shadow-xl scale-75">
          <span className="text-[10px] font-bold uppercase tracking-widest">{name}</span>
        </div>
      </Html>
    </group>
  );
}

export function Apartment3DWorkspace() {
  const [activeLayout, setActiveLayout] = useState<"1PN" | "2PN">("1PN");
  
  const layoutData = useMemo(() => {
    return activeLayout === "1PN" ? LAYOUT_1PN : LAYOUT_2PN;
  }, [activeLayout]);

  return (
    <div className="relative w-full h-full bg-slate-950 rounded-2xl overflow-hidden ring-1 ring-slate-800 shadow-2xl">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[7, 7, 7]} fov={40} />
        <OrbitControls 
          makeDefault 
          minPolarAngle={0} 
          maxPolarAngle={Math.PI / 2.2} 
          enableDamping
          dampingFactor={0.05}
          minDistance={3}
          maxDistance={15}
        />
        
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 15, 10]} angle={0.25} penumbra={1} intensity={1.5} castShadow />
        <directionalLight
          position={[-5, 10, -5]}
          intensity={0.6}
          castShadow
        />
        <Environment preset="apartment" />

        <Grid 
          infiniteGrid 
          fadeDistance={25} 
          fadeStrength={5} 
          cellSize={1} 
          sectionSize={5} 
          sectionColor="#2dd4bf" 
          cellColor="#1e293b" 
          position={[0, -0.01, 0]}
        />
        
        <group position={[0, 0, 0]}>
          {layoutData.map((room) => (
            <Room key={room.id} {...room} />
          ))}
        </group>

        <ContactShadows 
          position={[0, 0, 0]} 
          opacity={0.6} 
          scale={15} 
          blur={2} 
          far={5} 
        />
        <BakeShadows />
      </Canvas>

      <div className="absolute top-6 left-6 z-10 space-y-3">
        <div className="bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-slate-700/50 min-w-[240px]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-100 tracking-tight">3D Editor: Apartment Shell</h3>
          </div>
          
          <div className="mb-4">
            <Tabs defaultValue="1PN" onValueChange={(v) => setActiveLayout(v as "1PN" | "2PN")}>
              <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border border-slate-700">
                <TabsTrigger value="1PN" className="text-xs data-[state=active]:bg-teal-500 data-[state=active]:text-slate-950">1 PN + 1 WC</TabsTrigger>
                <TabsTrigger value="2PN" className="text-xs data-[state=active]:bg-teal-500 data-[state=active]:text-slate-950">2 PN + 2 WC</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Thiết kế theo layout Căn hộ {activeLayout === "1PN" ? "1 PN + 1 WC" : "2 PN + 2 WC"}. Toàn bộ tường cao 2.8m.
          </p>
          
          <div className="flex flex-col gap-2">
            <button className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 py-2 rounded-xl text-xs font-bold transition-all transform active:scale-95 shadow-lg shadow-teal-500/20">
              Chỉnh sửa thông số tường
            </button>
            <button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100 py-2 rounded-xl text-xs font-bold transition-all border border-slate-600">
              Lưu cấu trúc phòng
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 z-10">
        <div className="bg-black/40 backdrop-blur text-[10px] text-slate-300 px-3 py-1.5 rounded-full border border-white/5">
          Chuột trái: Xoay · Chuột phải: Di chuyển · Cuộn: Phóng to
        </div>
      </div>
    </div>
  );
}
