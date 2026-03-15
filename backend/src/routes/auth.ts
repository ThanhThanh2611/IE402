import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { users } from "../db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { generateToken } from "../middleware/auth";

const router = Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await db
      .select()
      .from(users)
      .where(and(eq(users.username, username), isNull(users.deletedAt)));

    if (result.length === 0) {
      return res.status(401).json({ error: "Sai username hoặc password" });
    }

    const user = result[0];

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Sai username hoặc password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: "Tài khoản đã bị vô hiệu hóa" });
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi đăng nhập" });
  }
});

export default router;
