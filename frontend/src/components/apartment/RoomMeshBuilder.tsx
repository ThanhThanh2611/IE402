import { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { TransformControls, Html } from "@react-three/drei";
import { parseWktToShape } from "@/lib/three-utils";
import { exportToGLB } from "@/lib/gltf-exporter";
import { Button } from "@/components/ui";
import { Download, Maximize } from "lucide-react";

interface RoomMeshBuilderProps {
  boundary?: string | null;
  defaultSize?: [number, number];
  floorColor?: string;
  wallColor?: string;
  isScaling?: boolean;
}

export function RoomMeshBuilder({ 
  boundary, 
  defaultSize = [20, 20],
  floorColor = "#8b5e3c",
  wallColor = "#f3f4f6",
  isScaling = false 
}: RoomMeshBuilderProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [wallHeight] = useState(2.5);
  const [scaleTarget, setScaleTarget] = useState<THREE.Group | null>(null);

  // Gán target cho TransformControls sau khi dã mount
  useEffect(() => {
    if (groupRef.current) {
      setScaleTarget(groupRef.current);
    }
  }, []);

  // 1. Tạo hình dạng sàn từ Boundary (WKT) hoặc mặc định (Plane)
  const floorGeometry = useMemo(() => {
    if (boundary) {
      try {
        const shape = parseWktToShape(boundary);
        return new THREE.ShapeGeometry(shape);
      } catch (e) {
        console.error("Lỗi parse WKT sàn:", e);
      }
    }
    return new THREE.PlaneGeometry(defaultSize[0], defaultSize[1]);
  }, [boundary, defaultSize]);

  // 2. Tạo tường bằng cách Extrude hình dạng sàn (chỉ các cạnh biên)
  const wallGeometry = useMemo(() => {
    if (!boundary) return null;
    try {
      const shape = parseWktToShape(boundary);
      
      const extrudeSettings = {
        steps: 1,
        depth: wallHeight,
        bevelEnabled: false,
      };

      return new THREE.ExtrudeGeometry(shape, extrudeSettings);
    } catch (e) {
      console.error("Lỗi parse WKT tường:", e);
      return null;
    }
  }, [boundary, wallHeight]);

  return (
    <group ref={groupRef}>
      {/* Sàn */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        {floorGeometry && <primitive object={floorGeometry} attach="geometry" />}
        <meshStandardMaterial color={floorColor} />
      </mesh>

      {/* Tường (Dựng đứng dọc theo cao độ Z) */}
      {boundary && wallGeometry ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow position={[0, 0, 0]}>
          <primitive object={wallGeometry} attach="geometry" />
          <meshStandardMaterial color={wallColor} />
        </mesh>
      ) : (
        // Nếu không có boundary, tạo một hộp rỗng tượng trưng
        <mesh position={[0, wallHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[defaultSize[0], wallHeight, defaultSize[1]]} />
          <meshStandardMaterial color={wallColor} transparent opacity={0.3} wireframe />
        </mesh>
      )}

      {isScaling && scaleTarget && (
        <TransformControls object={scaleTarget} mode="scale" />
      )}
    </group>
  );
}
