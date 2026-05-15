import { Request, Response, Router, NextFunction } from "express";
import { asc, eq } from "drizzle-orm";
import { db } from "../db";
import { furnitureCatalog } from "../db/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();
const MAX_FURNITURE_MODEL_UPLOAD_MB = 50;

function requireManager(req: Request, res: Response) {
  if (req.user?.role !== "manager") {
    res.status(403).json({ error: "Chỉ Manager mới có quyền cấu hình danh mục nội thất" });
    return false;
  }

  return true;
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = "uploads/models";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const catalogId = req.params.id;
    const ext = path.extname(file.originalname);
    cb(null, `furniture-${catalogId}-${Date.now()}${ext}`);
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
  limits: { fileSize: MAX_FURNITURE_MODEL_UPLOAD_MB * 1024 * 1024 },
});

function uploadFurnitureModel(req: Request, res: Response, next: NextFunction) {
  upload.single("file")(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({
        error: `File mô hình nội thất quá lớn. Giới hạn hiện tại là ${MAX_FURNITURE_MODEL_UPLOAD_MB}MB.`,
      });
      return;
    }

    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: "Không thể xử lý file upload nội thất." });
  });
}

router.get("/", async (_req, res) => {
  try {
    const result = await db
      .select()
      .from(furnitureCatalog)
      .orderBy(asc(furnitureCatalog.name));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy danh mục nội thất" });
  }
});

router.post("/", async (req, res) => {
  try {
    if (!requireManager(req, res)) return;

    const result = await db
      .insert(furnitureCatalog)
      .values({ ...req.body, updatedAt: new Date() })
      .returning();

    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi thêm mẫu nội thất" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    if (!requireManager(req, res)) return;

    const result = await db
      .update(furnitureCatalog)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(furnitureCatalog.id, Number(req.params.id)))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy mẫu nội thất" });
    }

    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi cập nhật mẫu nội thất" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    if (!requireManager(req, res)) return;

    const result = await db
      .delete(furnitureCatalog)
      .where(eq(furnitureCatalog.id, Number(req.params.id)))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy mẫu nội thất" });
    }

    res.json({ message: "Đã xóa mẫu nội thất" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa mẫu nội thất" });
  }
});

// POST /api/furniture-catalog/:id/model - Upload mô hình 3D cho nội thất
router.post("/:id/model", uploadFurnitureModel, async (req: Request, res: Response): Promise<void> => {
  try {
    const catalogId = Number(req.params.id);
    if (Number.isNaN(catalogId)) {
      res.status(400).json({ error: "ID danh mục nội thất không hợp lệ" });
      return;
    }

    if (!requireManager(req, res)) return;

    if (!req.file) {
      res.status(400).json({ error: "Vui lòng chọn file .glb hoặc .gltf" });
      return;
    }

    const model3dUrl = `/uploads/models/${req.file.filename}`;

    const result = await db
      .update(furnitureCatalog)
      .set({
        model3dUrl,
        updatedAt: new Date(),
      })
      .where(eq(furnitureCatalog.id, catalogId))
      .returning();

    if (result.length === 0) {
      res.status(404).json({ error: "Không tìm thấy mẫu nội thất" });
      return;
    }

    res.json({
      message: "Upload mô hình 3D cho nội thất thành công!",
      data: result[0],
    });
  } catch {
    res.status(500).json({ error: "Lỗi khi upload mô hình nội thất" });
  }
});

export default router;
