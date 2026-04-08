import { Request, Response, Router } from "express";
import { asc, eq } from "drizzle-orm";
import { db } from "../db";
import { furnitureCatalog } from "../db/schema";

const router = Router();

function requireManager(req: Request, res: Response) {
  if (req.user?.role !== "manager") {
    res.status(403).json({ error: "Chỉ Manager mới có quyền cấu hình danh mục nội thất" });
    return false;
  }

  return true;
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

export default router;
