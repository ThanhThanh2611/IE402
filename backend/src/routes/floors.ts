import { Router, Request, Response, NextFunction } from "express";
import { db } from "../db";
import { floors } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();
const MAX_FLOOR_MODEL_UPLOAD_MB = 70;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = "uploads/models";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const floorId = req.params.id;
    const ext = path.extname(file.originalname);
    cb(null, `floor-${floorId}-${Date.now()}${ext}`);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedExts = [".glb", ".gltf"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExts.includes(ext)) {
    cb(null, true);
    return;
  }

  cb(new Error("Hệ thống chỉ chấp nhận định dạng mô hình 3D: .glb hoặc .gltf"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FLOOR_MODEL_UPLOAD_MB * 1024 * 1024 },
});

function uploadFloorModel(req: Request, res: Response, next: NextFunction) {
  upload.single("file")(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({
        error: `File mô hình tầng quá lớn. Giới hạn hiện tại là ${MAX_FLOOR_MODEL_UPLOAD_MB}MB.`,
      });
      return;
    }

    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: "Không thể xử lý file upload của tầng." });
  });
}

function parseGeoJson<T>(value: unknown): T | null {
  if (typeof value !== "string" || !value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

const floorSelectFields = {
  id: floors.id,
  buildingId: floors.buildingId,
  floorNumber: floors.floorNumber,
  elevation: floors.elevation,
  floorPlan: floors.floorPlan,
  model3dUrl: floors.model3dUrl,
  description: floors.description,
  createdAt: floors.createdAt,
  updatedAt: floors.updatedAt,
  floorPlanGeoJson:
    sql<string | null>`CASE WHEN ${floors.floorPlan} IS NOT NULL THEN ST_AsGeoJSON(${floors.floorPlan}) ELSE NULL END`.as(
      "floorPlanGeoJson"
    ),
};

// GET /api/floors?buildingId=1 - Lấy danh sách tầng (theo tòa nhà)
router.get("/", async (req, res) => {
  try {
    const { buildingId } = req.query;
    const query = db.select(floorSelectFields).from(floors);
    if (buildingId) {
      const result = await query.where(eq(floors.buildingId, Number(buildingId)));
      return res.json(
        result.map((floor) => ({
          ...floor,
          floorPlanGeoJson: parseGeoJson(floor.floorPlanGeoJson),
        }))
      );
    }
    const result = await query;
    res.json(
      result.map((floor) => ({
        ...floor,
        floorPlanGeoJson: parseGeoJson(floor.floorPlanGeoJson),
      }))
    );
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách tầng" });
  }
});

// GET /api/floors/:id
router.get("/:id", async (req, res) => {
  try {
    const result = await db
      .select(floorSelectFields)
      .from(floors)
      .where(eq(floors.id, Number(req.params.id)));
    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy tầng" });
    }
    res.json({
      ...result[0],
      floorPlanGeoJson: parseGeoJson(result[0].floorPlanGeoJson),
    });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy thông tin tầng" });
  }
});

// POST /api/floors
router.post("/", async (req, res) => {
  try {
    const { floorPlanWkt, ...rest } = req.body;
    const result = await db
      .insert(floors)
      .values({
        ...rest,
        floorPlan: floorPlanWkt
          ? sql`ST_GeomFromText(${String(floorPlanWkt)}, 4326)`
          : null,
      })
      .returning();
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi thêm tầng" });
  }
});

// PUT /api/floors/:id
router.put("/:id", async (req, res) => {
  try {
    const { floorPlanWkt, ...rest } = req.body;
    const result = await db
      .update(floors)
      .set({
        ...rest,
        floorPlan:
          floorPlanWkt === undefined
            ? undefined
            : floorPlanWkt === null || floorPlanWkt === ""
              ? null
              : sql`ST_GeomFromText(${String(floorPlanWkt)}, 4326)`,
        updatedAt: new Date(),
      })
      .where(eq(floors.id, Number(req.params.id)))
      .returning();
    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy tầng" });
    }
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi cập nhật tầng" });
  }
});

// POST /api/floors/:id/model - Upload mô hình 3D riêng cho tầng
router.post("/:id/model", uploadFloorModel, async (req: Request, res: Response): Promise<void> => {
  try {
    const floorId = Number(req.params.id);
    if (Number.isNaN(floorId)) {
      res.status(400).json({ error: "ID tầng không hợp lệ" });
      return;
    }

    if (req.user?.role !== "manager") {
      res.status(403).json({ error: "Chỉ Manager mới có quyền upload model tầng" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "Vui lòng chọn file .glb hoặc .gltf" });
      return;
    }

    const model3dUrl = `/uploads/models/${req.file.filename}`;

    const result = await db
      .update(floors)
      .set({
        model3dUrl,
        updatedAt: new Date(),
      })
      .where(eq(floors.id, floorId))
      .returning();

    if (result.length === 0) {
      res.status(404).json({ error: "Không tìm thấy tầng" });
      return;
    }

    res.json({
      message: "Upload mô hình 3D cho tầng thành công!",
      data: result[0],
    });
  } catch {
    res.status(500).json({ error: "Lỗi khi upload mô hình tầng" });
  }
});

// DELETE /api/floors/:id
router.delete("/:id", async (req, res) => {
  try {
    const result = await db
      .delete(floors)
      .where(eq(floors.id, Number(req.params.id)))
      .returning();
    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy tầng" });
    }
    res.json({ message: "Đã xóa tầng" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa tầng" });
  }
});

export default router;
