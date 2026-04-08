import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const compareMock = vi.fn();
const whereMock = vi.fn();
const fromMock = vi.fn(() => ({ where: whereMock }));
const selectMock = vi.fn(() => ({ from: fromMock }));
const returningInsertMock = vi.fn();
const valuesInsertMock = vi.fn(() => ({ returning: returningInsertMock }));
const insertMock = vi.fn(() => ({ values: valuesInsertMock }));
const whereUpdateMock = vi.fn();
const setUpdateMock = vi.fn(() => ({ where: whereUpdateMock }));
const updateMock = vi.fn(() => ({ set: setUpdateMock }));

vi.mock("bcryptjs", () => ({
  default: {
    compare: compareMock,
  },
}));

vi.mock("../db", () => ({
  db: {
    select: selectMock,
    insert: insertMock,
    update: updateMock,
  },
}));

describe("auth route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function createApp() {
    const { default: authRouter } = await import("./auth");
    const app = express();
    app.use(express.json());
    app.use("/api/auth", authRouter);
    return app;
  }

  it("dang nhap thanh cong va tra ve user + token", async () => {
    whereMock.mockResolvedValueOnce([
      {
        id: 1,
        username: "manager1",
        password: "hashed",
        fullName: "Manager One",
        email: "manager1@example.com",
        role: "manager",
        isActive: true,
      },
    ]);
    compareMock.mockResolvedValueOnce(true);
    returningInsertMock.mockResolvedValueOnce([{ id: 99 }]);
    whereUpdateMock.mockResolvedValueOnce([]);

    const app = await createApp();
    const response = await request(app).post("/api/auth/login").send({
      username: "manager1",
      password: "manager123",
    });

    expect(response.status).toBe(200);
    expect(response.body.user).toMatchObject({
      id: 1,
      username: "manager1",
      fullName: "Manager One",
      email: "manager1@example.com",
      role: "manager",
      isActive: true,
    });
    expect(typeof response.body.accessToken).toBe("string");
    expect(typeof response.body.refreshToken).toBe("string");
    expect(response.body.accessToken.length).toBeGreaterThan(20);
    expect(response.body.refreshToken.length).toBeGreaterThan(20);
  });

  it("tra 401 khi khong tim thay user", async () => {
    whereMock.mockResolvedValueOnce([]);

    const app = await createApp();
    const response = await request(app).post("/api/auth/login").send({
      username: "missing",
      password: "wrong",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Sai username hoặc password" });
    expect(compareMock).not.toHaveBeenCalled();
  });

  it("tra 401 khi password sai", async () => {
    whereMock.mockResolvedValueOnce([
      {
        id: 2,
        username: "user1",
        password: "hashed",
        fullName: "User One",
        email: "user1@example.com",
        role: "user",
        isActive: true,
      },
    ]);
    compareMock.mockResolvedValueOnce(false);

    const app = await createApp();
    const response = await request(app).post("/api/auth/login").send({
      username: "user1",
      password: "wrong",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Sai username hoặc password" });
  });

  it("tra 403 khi tai khoan bi vo hieu hoa", async () => {
    whereMock.mockResolvedValueOnce([
      {
        id: 3,
        username: "user3",
        password: "hashed",
        fullName: "User Three",
        email: "user3@example.com",
        role: "user",
        isActive: false,
      },
    ]);
    compareMock.mockResolvedValueOnce(true);

    const app = await createApp();
    const response = await request(app).post("/api/auth/login").send({
      username: "user3",
      password: "user123",
    });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: "Tài khoản đã bị vô hiệu hóa" });
  });

  it("tra 500 neu database nem loi", async () => {
    whereMock.mockRejectedValueOnce(new Error("db failure"));

    const app = await createApp();
    const response = await request(app).post("/api/auth/login").send({
      username: "manager1",
      password: "manager123",
    });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Lỗi khi đăng nhập" });
  });

  it("refresh token thanh cong va rotate token", async () => {
    const app = await createApp();
    const loginSession = { id: 55 };
    returningInsertMock.mockResolvedValueOnce([loginSession]);
    whereUpdateMock.mockResolvedValueOnce([]);
    whereMock
      .mockResolvedValueOnce([
        {
          id: 1,
          username: "manager1",
          password: "hashed",
          fullName: "Manager One",
          email: "manager1@example.com",
          role: "manager",
          isActive: true,
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 55,
          userId: 1,
          refreshTokenHash: "",
          expiresAt: new Date(Date.now() + 86400000),
          revokedAt: null,
          userAgent: null,
          ipAddress: null,
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 1,
          username: "manager1",
          fullName: "Manager One",
          email: "manager1@example.com",
          role: "manager",
          isActive: true,
        },
      ]);
    compareMock.mockResolvedValueOnce(true);

    const loginResponse = await request(app).post("/api/auth/login").send({
      username: "manager1",
      password: "manager123",
    });

    whereMock.mockReset();
    whereMock
      .mockResolvedValueOnce([
        {
          id: 55,
          userId: 1,
          refreshTokenHash: "",
          expiresAt: new Date(Date.now() + 86400000),
          revokedAt: null,
          userAgent: null,
          ipAddress: null,
        },
      ]);
    const { hashToken } = await import("../middleware/auth");
    const oldRefreshToken = loginResponse.body.refreshToken;
    whereMock.mockReset();
    whereMock
      .mockResolvedValueOnce([
        {
          id: 55,
          userId: 1,
          refreshTokenHash: hashToken(oldRefreshToken),
          expiresAt: new Date(Date.now() + 86400000),
          revokedAt: null,
          userAgent: null,
          ipAddress: null,
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 1,
          username: "manager1",
          fullName: "Manager One",
          email: "manager1@example.com",
        role: "manager",
        isActive: true,
      },
    ]);
    whereUpdateMock.mockResolvedValueOnce([]);

    const response = await request(app).post("/api/auth/refresh").send({
      refreshToken: oldRefreshToken,
    });

    expect(response.status).toBe(200);
    expect(typeof response.body.accessToken).toBe("string");
    expect(typeof response.body.refreshToken).toBe("string");
  });

  it("logout thanh cong ke ca khi refresh token khong hop le", async () => {
    const app = await createApp();
    const response = await request(app).post("/api/auth/logout").send({
      refreshToken: "invalid-refresh-token",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Đăng xuất thành công" });
  });
});
