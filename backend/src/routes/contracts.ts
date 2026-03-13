import { Router } from "express";
import { db } from "../db";
import { rentalContracts, apartments } from "../db/schema";
import { eq, and, isNull } from "drizzle-orm";

const router = Router();

// GET /api/contracts - Lấy danh sách hợp đồng
router.get("/", async (_req, res) => {
  try {
    const result = await db
      .select()
      .from(rentalContracts)
      .where(isNull(rentalContracts.deletedAt));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách hợp đồng" });
  }
});

// GET /api/contracts/:id - Lấy chi tiết hợp đồng (UC21)
router.get("/:id", async (req, res) => {
  try {
    const result = await db
      .select()
      .from(rentalContracts)
      .where(
        and(
          eq(rentalContracts.id, Number(req.params.id)),
          isNull(rentalContracts.deletedAt)
        )
      );
    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy hợp đồng" });
    }
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy thông tin hợp đồng" });
  }
});

// POST /api/contracts - Thêm hợp đồng thuê (UC18)
router.post("/", async (req, res) => {
  try {
    const contract = await db
      .insert(rentalContracts)
      .values(req.body)
      .returning();

    // Cập nhật trạng thái căn hộ thành "rented"
    await db
      .update(apartments)
      .set({ status: "rented", updatedAt: new Date() })
      .where(eq(apartments.id, req.body.apartmentId));

    res.status(201).json(contract[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi tạo hợp đồng" });
  }
});

// PUT /api/contracts/:id - Chỉnh sửa hợp đồng (UC19)
router.put("/:id", async (req, res) => {
  try {
    const result = await db
      .update(rentalContracts)
      .set({ ...req.body, updatedAt: new Date() })
      .where(
        and(
          eq(rentalContracts.id, Number(req.params.id)),
          isNull(rentalContracts.deletedAt)
        )
      )
      .returning();
    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy hợp đồng" });
    }
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi cập nhật hợp đồng" });
  }
});

// DELETE /api/contracts/:id - Xóa mềm hợp đồng (UC20)
router.delete("/:id", async (req, res) => {
  try {
    const existing = await db
      .select()
      .from(rentalContracts)
      .where(
        and(
          eq(rentalContracts.id, Number(req.params.id)),
          isNull(rentalContracts.deletedAt)
        )
      );
    if (existing.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy hợp đồng" });
    }

    await db
      .update(rentalContracts)
      .set({ deletedAt: new Date() })
      .where(eq(rentalContracts.id, Number(req.params.id)));

    // Cập nhật trạng thái căn hộ thành "available"
    await db
      .update(apartments)
      .set({ status: "available", updatedAt: new Date() })
      .where(eq(apartments.id, existing[0].apartmentId));

    res.json({ message: "Đã xóa hợp đồng" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa hợp đồng" });
  }
});

export default router;
