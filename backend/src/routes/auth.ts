import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { authSessions, users } from "../db/schema";
import { eq, and, isNull } from "drizzle-orm";
import {
  createRefreshTokenExpiry,
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyRefreshToken,
} from "../middleware/auth";

const router = Router();

function serializeUser(user: {
  id: number;
  username: string;
  fullName: string;
  email: string | null;
  role: "user" | "manager";
  isActive: boolean;
}) {
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };
}

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

    const [session] = await db
      .insert(authSessions)
      .values({
        userId: user.id,
        refreshTokenHash: hashToken(
          `${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`
        ),
        expiresAt: createRefreshTokenExpiry(),
        userAgent: req.headers["user-agent"] || null,
        ipAddress: req.ip || null,
      })
      .returning();

    const tokenPayload = {
      id: user.id,
      username: user.username,
      role: user.role,
      sessionId: session.id,
    } as const;

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await db
      .update(authSessions)
      .set({
        refreshTokenHash: hashToken(refreshToken),
        updatedAt: new Date(),
      })
      .where(eq(authSessions.id, session.id));

    res.json({
      user: serializeUser(user),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi đăng nhập" });
  }
});

// POST /api/auth/refresh
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body ?? {};
    if (!refreshToken || typeof refreshToken !== "string") {
      return res.status(401).json({ error: "Thiếu refresh token" });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const hashedToken = hashToken(refreshToken);

    const sessions = await db
      .select()
      .from(authSessions)
      .where(eq(authSessions.id, decoded.sessionId));

    if (sessions.length === 0) {
      return res.status(401).json({ error: "Refresh token không hợp lệ" });
    }

    const session = sessions[0];
    if (
      session.userId !== decoded.id ||
      session.refreshTokenHash !== hashedToken ||
      session.revokedAt ||
      new Date(session.expiresAt) < new Date()
    ) {
      return res.status(401).json({ error: "Refresh token không hợp lệ hoặc đã hết hạn" });
    }

    const userResult = await db
      .select()
      .from(users)
      .where(and(eq(users.id, decoded.id), isNull(users.deletedAt)));

    if (userResult.length === 0) {
      return res.status(401).json({ error: "Người dùng không còn hợp lệ" });
    }

    const user = userResult[0];
    if (!user.isActive) {
      return res.status(403).json({ error: "Tài khoản đã bị vô hiệu hóa" });
    }

    const tokenPayload = {
      id: user.id,
      username: user.username,
      role: user.role,
      sessionId: session.id,
    } as const;

    const nextAccessToken = generateAccessToken(tokenPayload);
    const nextRefreshToken = generateRefreshToken(tokenPayload);

    await db
      .update(authSessions)
      .set({
        refreshTokenHash: hashToken(nextRefreshToken),
        expiresAt: createRefreshTokenExpiry(),
        lastUsedAt: new Date(),
        updatedAt: new Date(),
        userAgent: req.headers["user-agent"] || session.userAgent,
        ipAddress: req.ip || session.ipAddress,
      })
      .where(eq(authSessions.id, session.id));

    res.json({
      user: serializeUser(user),
      accessToken: nextAccessToken,
      refreshToken: nextRefreshToken,
    });
  } catch {
    res.status(401).json({ error: "Refresh token không hợp lệ hoặc đã hết hạn" });
  }
});

// POST /api/auth/logout
router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body ?? {};

    if (typeof refreshToken === "string" && refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        await db
          .update(authSessions)
          .set({
            revokedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(authSessions.id, decoded.sessionId));
      } catch {
        // Logout nên idempotent; client vẫn nên được xóa phiên cục bộ
      }
    }

    res.json({ message: "Đăng xuất thành công" });
  } catch {
    res.status(500).json({ error: "Lỗi khi đăng xuất" });
  }
});

export default router;
