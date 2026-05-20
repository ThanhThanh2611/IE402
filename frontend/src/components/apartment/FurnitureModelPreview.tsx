import { useEffect } from "react";

interface FurnitureModelPreviewProps {
  modelUrl: string;
  modelName: string;
}

export function FurnitureModelPreview({ modelUrl, modelName }: FurnitureModelPreviewProps) {
  useEffect(() => {
    // Load model-viewer web component
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://cdn.jsdelivr.net/npm/@google/model-viewer/dist/model-viewer.min.js";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup script if needed
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="w-full rounded-lg bg-slate-950 border border-slate-800 overflow-hidden">
        {/* @ts-ignore */}
        <model-viewer
          src={modelUrl}
          alt={modelName}
          auto-rotate
          camera-controls
          style={{
            width: "100%",
            height: "350px",
            display: "block",
          }}
        />
      </div>
      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          <strong>💡 Gợi ý:</strong>
        </p>
        <p>• Kéo chuột để xoay mô hình</p>
        <p>• Cuộn chuột để phóng to/thu nhỏ</p>
        <p>• Mô hình sẽ tự động xoay khi không có tương tác</p>
      </div>
    </div>
  );
}
