import { Router } from "express";
import { db } from "../db";
import { apartmentStatusHistory } from "../db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// GET /api/status-history?apartmentId=1 - Lấy lịch sử trạng thái căn hộ
router.get("/", async (req, res) => {
  try {
    const { apartmentId } = req.query;
    if (apartmentId) {
      const result = await db
        .select()
        .from(apartmentStatusHistory)
        .where(eq(apartmentStatusHistory.apartmentId, Number(apartmentId)))
        .orderBy(apartmentStatusHistory.changedAt);
      return res.json(result);
    }
    res.json(await db.select().from(apartmentStatusHistory));
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy lịch sử trạng thái" });
  }
});

// POST /api/status-history
router.post("/", async (req, res) => {
  try {
    const result = await db
      .insert(apartmentStatusHistory)
      .values(req.body)
      .returning();
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi thêm lịch sử trạng thái" });
  }
});

export default router;
