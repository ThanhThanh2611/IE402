import { Router } from "express";
import { db } from "../db";
import { floors } from "../db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// GET /api/floors?buildingId=1 - Lấy danh sách tầng (theo tòa nhà)
router.get("/", async (req, res) => {
  try {
    const { buildingId } = req.query;
    const query = db.select().from(floors);
    if (buildingId) {
      const result = await query.where(eq(floors.buildingId, Number(buildingId)));
      return res.json(result);
    }
    res.json(await query);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách tầng" });
  }
});

// GET /api/floors/:id
router.get("/:id", async (req, res) => {
  try {
    const result = await db
      .select()
      .from(floors)
      .where(eq(floors.id, Number(req.params.id)));
    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy tầng" });
    }
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy thông tin tầng" });
  }
});

// POST /api/floors
router.post("/", async (req, res) => {
  try {
    const result = await db.insert(floors).values(req.body).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi thêm tầng" });
  }
});

// PUT /api/floors/:id
router.put("/:id", async (req, res) => {
  try {
    const result = await db
      .update(floors)
      .set({ ...req.body, updatedAt: new Date() })
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
