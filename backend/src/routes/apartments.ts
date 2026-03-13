import { Router } from "express";
import { db } from "../db";
import { apartments } from "../db/schema";
import { eq, and, isNull } from "drizzle-orm";

const router = Router();

// GET /api/apartments?floorId=1 - Lấy danh sách căn hộ (UC08)
router.get("/", async (req, res) => {
  try {
    const { floorId } = req.query;
    const conditions = [isNull(apartments.deletedAt)];
    if (floorId) conditions.push(eq(apartments.floorId, Number(floorId)));

    const result = await db
      .select()
      .from(apartments)
      .where(and(...conditions));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách căn hộ" });
  }
});

// GET /api/apartments/:id - Lấy chi tiết căn hộ
router.get("/:id", async (req, res) => {
  try {
    const result = await db
      .select()
      .from(apartments)
      .where(
        and(eq(apartments.id, Number(req.params.id)), isNull(apartments.deletedAt))
      );
    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy căn hộ" });
    }
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy thông tin căn hộ" });
  }
});

// POST /api/apartments - Thêm căn hộ (UC14)
router.post("/", async (req, res) => {
  try {
    const result = await db.insert(apartments).values(req.body).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi thêm căn hộ" });
  }
});

// PUT /api/apartments/:id - Cập nhật căn hộ (UC15)
router.put("/:id", async (req, res) => {
  try {
    const result = await db
      .update(apartments)
      .set({ ...req.body, updatedAt: new Date() })
      .where(
        and(eq(apartments.id, Number(req.params.id)), isNull(apartments.deletedAt))
      )
      .returning();
    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy căn hộ" });
    }
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi cập nhật căn hộ" });
  }
});

// PATCH /api/apartments/:id/status - Cập nhật trạng thái căn hộ (UC17)
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const result = await db
      .update(apartments)
      .set({ status, updatedAt: new Date() })
      .where(
        and(eq(apartments.id, Number(req.params.id)), isNull(apartments.deletedAt))
      )
      .returning();
    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy căn hộ" });
    }
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi cập nhật trạng thái" });
  }
});

// DELETE /api/apartments/:id - Xóa mềm căn hộ (UC16)
router.delete("/:id", async (req, res) => {
  try {
    const result = await db
      .update(apartments)
      .set({ deletedAt: new Date() })
      .where(
        and(eq(apartments.id, Number(req.params.id)), isNull(apartments.deletedAt))
      )
      .returning();
    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy căn hộ" });
    }
    res.json({ message: "Đã xóa căn hộ" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa căn hộ" });
  }
});

export default router;
