import { Router } from "express";
import { db } from "../db";
import { payments } from "../db/schema";
import { eq, and, isNull } from "drizzle-orm";

const router = Router();

// GET /api/payments?contractId=1 - Lấy danh sách thanh toán
router.get("/", async (req, res) => {
  try {
    const { contractId } = req.query;
    if (contractId) {
      const result = await db
        .select()
        .from(payments)
        .where(
          and(
            eq(payments.contractId, Number(contractId)),
            isNull(payments.deletedAt)
          )
        );
      return res.json(result);
    }
    res.json(
      await db.select().from(payments).where(isNull(payments.deletedAt))
    );
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách thanh toán" });
  }
});

// GET /api/payments/:id
router.get("/:id", async (req, res) => {
  try {
    const result = await db
      .select()
      .from(payments)
      .where(
        and(eq(payments.id, Number(req.params.id)), isNull(payments.deletedAt))
      );
    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy thanh toán" });
    }
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy thông tin thanh toán" });
  }
});

// POST /api/payments
router.post("/", async (req, res) => {
  try {
    const result = await db.insert(payments).values(req.body).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi thêm thanh toán" });
  }
});

// PUT /api/payments/:id
router.put("/:id", async (req, res) => {
  try {
    const result = await db
      .update(payments)
      .set(req.body)
      .where(
        and(eq(payments.id, Number(req.params.id)), isNull(payments.deletedAt))
      )
      .returning();
    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy thanh toán" });
    }
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi cập nhật thanh toán" });
  }
});

// DELETE /api/payments/:id - Xóa mềm
router.delete("/:id", async (req, res) => {
  try {
    const result = await db
      .update(payments)
      .set({ deletedAt: new Date() })
      .where(
        and(eq(payments.id, Number(req.params.id)), isNull(payments.deletedAt))
      )
      .returning();
    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy thanh toán" });
    }
    res.json({ message: "Đã xóa thanh toán" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa thanh toán" });
  }
});

export default router;
