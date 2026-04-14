import * as THREE from "three";

/**
 * Parsers a POINT Z (X Y Z) string into a THREE.Vector3
 */
export function parsePointZ(value: string): THREE.Vector3 {
  const matched = value.match(/POINT\s+Z\s*\(\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s*\)/i);
  if (!matched) return new THREE.Vector3(0, 0, 0);
  return new THREE.Vector3(
    Number(matched[1]) || 0,
    Number(matched[2]) || 0,
    Number(matched[3]) || 0
  );
}

/**
 * Formats a THREE.Vector3 into a POINT Z string
 */
export function formatPointZ(vector: THREE.Vector3): string {
  return `POINT Z (${vector.x} ${vector.y} ${vector.z})`;
}

/**
 * Parses a POLYGON Z ((X Y Z, ...)) string into a THREE.Shape
 * Note: We only care about X and Y for the shape (Z is height)
 */
export function parseWktToShape(boundary: string): THREE.Shape {
  const shape = new THREE.Shape();
  const matched = boundary.match(/POLYGON\s+Z?\s*\(\(\s*(.+?)\s*\)\)/i);
  if (!matched) return shape;

  const points = matched[1]
    .split(",")
    .map((segment) => segment.trim().split(/\s+/).map(Number));

  if (points.length === 0) return shape;

  shape.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    shape.lineTo(points[i][0], points[i][1]);
  }

  return shape;
}

/**
 * Automatically calculates the bounding box of a model and offsets its meshes
 * so that the bottom-center of the model is at (0, 0, 0)
 */
export function alignModelToBottom(object: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);

  // We want the bottom (min.y) to be at Y=0
  // And the center (X, Z) to be at (0, 0)
  object.position.x -= center.x;
  object.position.y -= box.min.y;
  object.position.z -= center.z;
}

/**
 * Clamps a value within its boundary defined by a polygon (2D check)
 */
export function isPointInPolygon(x: number, z: number, polygon: { x: number; z: number }[]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x,
      zi = polygon[i].z;
    const xj = polygon[j].x,
      zj = polygon[j].z;

    const intersect = zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
