import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import {
  authenticate,
  createRefreshTokenExpiry,
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  requireManager,
  verifyRefreshToken,
  type JwtPayload,
} from "./auth";

type MockResponse = Response & {
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
};

function createResponse(): MockResponse {
  const res = {} as MockResponse;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

function createRequest(authorization?: string, user?: JwtPayload): Request {
  return {
    headers: authorization ? { authorization } : {},
    user,
  } as Request;
}

describe("auth middleware", () => {
  it("generateToken tao token hop le cho authenticate", () => {
    const payload: JwtPayload = { id: 1, username: "manager1", role: "manager", sessionId: 10 };
    const token = generateAccessToken(payload);

    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(20);
  });

  it("generateRefreshToken va verifyRefreshToken hoat dong dung", () => {
    const payload: JwtPayload = { id: 1, username: "manager1", role: "manager", sessionId: 10 };
    const token = generateRefreshToken(payload);
    const decoded = verifyRefreshToken(token);

    expect(decoded).toMatchObject({
      id: 1,
      username: "manager1",
      role: "manager",
      sessionId: 10,
      type: "refresh",
    });
  });

  it("hashToken tra ve chuoi bam on dinh", () => {
    expect(hashToken("sample-token")).toBe(hashToken("sample-token"));
    expect(hashToken("sample-token")).not.toBe(hashToken("other-token"));
  });

  it("createRefreshTokenExpiry tao moc het han trong tuong lai", () => {
    const expiresAt = createRefreshTokenExpiry();
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("authenticate tra 401 neu thieu Bearer token", () => {
    const req = createRequest();
    const res = createResponse();
    const next = vi.fn() as NextFunction;

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Chưa đăng nhập" });
    expect(next).not.toHaveBeenCalled();
  });

  it("authenticate tra 401 neu token khong hop le", () => {
    const req = createRequest("Bearer invalid-token");
    const res = createResponse();
    const next = vi.fn() as NextFunction;

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Token không hợp lệ hoặc đã hết hạn" });
    expect(next).not.toHaveBeenCalled();
  });

  it("authenticate gan req.user va goi next voi token hop le", () => {
    const payload: JwtPayload = { id: 2, username: "user1", role: "user", sessionId: 20 };
    const token = generateAccessToken(payload);
    const req = createRequest(`Bearer ${token}`);
    const res = createResponse();
    const next = vi.fn() as NextFunction;

    authenticate(req, res, next);

    expect(req.user).toMatchObject(payload);
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("requireManager chan user khong phai manager", () => {
    const req = createRequest(undefined, { id: 2, username: "user1", role: "user", sessionId: 20 });
    const res = createResponse();
    const next = vi.fn() as NextFunction;

    requireManager(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Chỉ Manager mới có quyền thực hiện" });
    expect(next).not.toHaveBeenCalled();
  });

  it("requireManager cho phep manager di tiep", () => {
    const req = createRequest(undefined, { id: 1, username: "manager1", role: "manager", sessionId: 10 });
    const res = createResponse();
    const next = vi.fn() as NextFunction;

    requireManager(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });
});
