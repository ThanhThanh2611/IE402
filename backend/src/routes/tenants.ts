import { Router } from "express";
import { db } from "../db";
import { tenants } from "../db/schema";
import { eq, and, isNull } from "drizzle-orm";

const router = Router();

// GET /api/tenants - Lấy danh sách người thuê
router.get("/", async (_req, res) => {
  try {
    const result = await db
      .select()
      .from(tenants)
      .where(isNull(tenants.deletedAt));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách người thuê" });
  }
});

// GET /api/tenants/:id - Lấy chi tiết người thuê (UC13)
router.get("/:id", async (req, res) => {
  try {
    const result = await db
      .select()
      .from(tenants)
      .where(
        and(eq(tenants.id, Number(req.params.id)), isNull(tenants.deletedAt))
      );
    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy người thuê" });
    }
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy thông tin người thuê" });
  }
});

// POST /api/tenants - Thêm người thuê
router.post("/", async (req, res) => {
  try {
    const result = await db.insert(tenants).values(req.body).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi thêm người thuê" });
  }
});

// PUT /api/tenants/:id - Cập nhật người thuê
router.put("/:id", async (req, res) => {
  try {
    const result = await db
      .update(tenants)
      .set({ ...req.body, updatedAt: new Date() })
      .where(
        and(eq(tenants.id, Number(req.params.id)), isNull(tenants.deletedAt))
      )
      .returning();
    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy người thuê" });
    }
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi cập nhật người thuê" });
  }
});

// DELETE /api/tenants/:id - Xóa mềm người thuê
router.delete("/:id", async (req, res) => {
  try {
    const result = await db
      .update(tenants)
      .set({ deletedAt: new Date() })
      .where(
        and(eq(tenants.id, Number(req.params.id)), isNull(tenants.deletedAt))
      )
      .returning();
    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy người thuê" });
    }
    res.json({ message: "Đã xóa người thuê" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa người thuê" });
  }
});

export default router;
