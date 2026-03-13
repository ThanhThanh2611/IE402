import { Router } from "express";
import { db } from "../db";
import { users } from "../db/schema";
import { eq, and, isNull } from "drizzle-orm";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, password, fullName, email, role } = req.body;

    const existing = await db
      .select()
      .from(users)
      .where(and(eq(users.username, username), isNull(users.deletedAt)));
    if (existing.length > 0) {
      return res.status(400).json({ error: "Username đã tồn tại" });
    }

    const result = await db
      .insert(users)
      .values({ username, password, fullName, email, role })
      .returning({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
      });

    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi đăng ký" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await db
      .select()
      .from(users)
      .where(and(eq(users.username, username), isNull(users.deletedAt)));

    if (result.length === 0 || result[0].password !== password) {
      return res.status(401).json({ error: "Sai username hoặc password" });
    }

    const user = result[0];
    res.json({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi đăng nhập" });
  }
});

// GET /api/auth/users - Lấy danh sách users
router.get("/users", async (_req, res) => {
  try {
    const result = await db
      .select({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(isNull(users.deletedAt));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách users" });
  }
});

export default router;
