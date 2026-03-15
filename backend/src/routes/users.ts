import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { users } from "../db/schema";
import { eq, and, isNull } from "drizzle-orm";

const router = Router();

const userFields = {
  id: users.id,
  username: users.username,
  fullName: users.fullName,
  email: users.email,
  role: users.role,
  isActive: users.isActive,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

// GET /api/users - Danh sách người dùng (UC26)
router.get("/", async (_req, res) => {
  try {
    const result = await db
      .select(userFields)
      .from(users)
      .where(isNull(users.deletedAt));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách người dùng" });
  }
});

// GET /api/users/:id - Chi tiết người dùng
router.get("/:id", async (req, res) => {
  try {
    const result = await db
      .select(userFields)
      .from(users)
      .where(
        and(eq(users.id, Number(req.params.id)), isNull(users.deletedAt))
      );
    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy thông tin người dùng" });
  }
});

// POST /api/users - Thêm người dùng (UC27)
router.post("/", async (req, res) => {
  try {
    const { username, password, fullName, email, role } = req.body;

    const existing = await db
      .select()
      .from(users)
      .where(and(eq(users.username, username), isNull(users.deletedAt)));
    if (existing.length > 0) {
      return res.status(400).json({ error: "Username đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db
      .insert(users)
      .values({ username, password: hashedPassword, fullName, email, role })
      .returning(userFields);

    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi thêm người dùng" });
  }
});

// PUT /api/users/:id - Cập nhật thông tin người dùng (UC28)
router.put("/:id", async (req, res) => {
  try {
    const { username, fullName, email, role } = req.body;
    const result = await db
      .update(users)
      .set({ username, fullName, email, role, updatedAt: new Date() })
      .where(
        and(eq(users.id, Number(req.params.id)), isNull(users.deletedAt))
      )
      .returning(userFields);
    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi cập nhật người dùng" });
  }
});

// DELETE /api/users/:id - Xóa người dùng (UC29)
router.delete("/:id", async (req, res) => {
  try {
    const result = await db
      .update(users)
      .set({ deletedAt: new Date() })
      .where(
        and(eq(users.id, Number(req.params.id)), isNull(users.deletedAt))
      )
      .returning();
    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }
    res.json({ message: "Đã xóa người dùng" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa người dùng" });
  }
});

// PATCH /api/users/:id/activate - Kích hoạt tài khoản (UC30)
router.patch("/:id/activate", async (req, res) => {
  try {
    const result = await db
      .update(users)
      .set({ isActive: true, updatedAt: new Date() })
      .where(
        and(eq(users.id, Number(req.params.id)), isNull(users.deletedAt))
      )
      .returning(userFields);
    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi kích hoạt tài khoản" });
  }
});

// PATCH /api/users/:id/deactivate - Vô hiệu hóa tài khoản (UC31)
router.patch("/:id/deactivate", async (req, res) => {
  try {
    const result = await db
      .update(users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(
        and(eq(users.id, Number(req.params.id)), isNull(users.deletedAt))
      )
      .returning(userFields);
    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi vô hiệu hóa tài khoản" });
  }
});

export default router;
