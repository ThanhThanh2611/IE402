import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import * as THREE from "three";

/**
 * Exports a THREE.Object3D (scene or group) to a .glb file and triggers download
 */
export function exportToGLB(object: THREE.Object3D, filename: string = "apartment-room.glb") {
  const exporter = new GLTFExporter();

  exporter.parse(
    object,
    (result) => {
      if (result instanceof ArrayBuffer) {
        saveArrayBuffer(result, filename);
      } else {
        const output = JSON.stringify(result, null, 2);
        saveString(output, filename.replace(".glb", ".gltf"));
      }
    },
    (error) => {
      console.error("An error happened during GLTF export:", error);
    },
    { binary: true }
  );
}

function save(blob: Blob, filename: string) {
  const link = document.createElement("a");
  link.style.display = "none";
  document.body.appendChild(link);
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  document.body.removeChild(link);
}

function saveString(text: string, filename: string) {
  save(new Blob([text], { type: "text/plain" }), filename);
}

function saveArrayBuffer(buffer: ArrayBuffer, filename: string) {
  save(new Blob([buffer], { type: "application/octet-stream" }), filename);
}
