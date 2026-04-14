import { useGLTF, TransformControls } from "@react-three/drei";
import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { alignModelToBottom } from "@/lib/three-utils";

interface FurnitureModelProps {
  id: number;
  modelUrl: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  isSelected: boolean;
  onSelect: (id: number) => void;
  onUpdate: (id: number, pos: THREE.Vector3, rot: THREE.Euler) => void;
}

export function FurnitureModel({
  id,
  modelUrl,
  position,
  rotation,
  scale,
  isSelected,
  onSelect,
  onUpdate,
}: FurnitureModelProps) {
  const { scene } = useGLTF(modelUrl);
  const groupRef = useRef<THREE.Group>(null);

  // Clone scene để dùng nhiều instance cùng 1 model
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  const [transformTarget, setTransformTarget] = useState<THREE.Group | null>(null);

  useEffect(() => {
    if (groupRef.current) {
      setTransformTarget(groupRef.current);
    }
  }, []);

  useEffect(() => {
    if (clonedScene) {
      // 1. Tự động căn chỉnh model sát sàn ngay khi load
      alignModelToBottom(clonedScene);
    }
  }, [clonedScene]);

  const handleTransformEnd = () => {
    if (groupRef.current) {
      const pos = groupRef.current.position;
      const rot = groupRef.current.rotation;
      // Luôn ép Y = 0 để không bị bay hay lún
      pos.y = 0;
      onUpdate(id, pos.clone(), rot.clone());
    }
  };

  return (
    <>
      <group
        ref={groupRef}
        position={position}
        rotation={rotation}
        scale={scale}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(id);
        }}
      >
        <primitive object={clonedScene} />
      </group>

      {isSelected && transformTarget && (
        <TransformControls
          object={transformTarget}
          mode="translate"
          onMouseUp={handleTransformEnd}
          size={0.6}
        />
      )}
    </>
  );
}
