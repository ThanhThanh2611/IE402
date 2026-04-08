import { beforeEach, describe, expect, it, vi } from "vitest";

import { api, clearStoredAuth, setStoredAuth } from "./api";

describe("api client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("gui Authorization va Content-Type JSON cho request post", async () => {
    localStorage.setItem("accessToken", "abc123");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await api.post<{ ok: boolean }>("/test", { name: "demo" });

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/test",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "demo" }),
        headers: expect.objectContaining({
          Authorization: "Bearer abc123",
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("co the luu va xoa accessToken/refreshToken moi", () => {
    setStoredAuth({
      accessToken: "access-1",
      refreshToken: "refresh-1",
      user: { id: 1 },
    });

    expect(localStorage.getItem("accessToken")).toBe("access-1");
    expect(localStorage.getItem("refreshToken")).toBe("refresh-1");
    expect(localStorage.getItem("user")).toBe(JSON.stringify({ id: 1 }));

    clearStoredAuth();

    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("khong tu dat Content-Type khi gui FormData", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ uploaded: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const formData = new FormData();
    formData.append("file", new Blob(["demo"]), "demo.txt");

    await api.postFormData<{ uploaded: boolean }>("/upload", formData);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/upload",
      expect.objectContaining({
        method: "POST",
        body: formData,
        headers: {},
      }),
    );
  });

  it("nem ApiError voi noi dung tu backend neu request that bai", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Khong the tai du lieu" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(api.get("/broken")).rejects.toMatchObject({
      name: "ApiError",
      status: 400,
      message: "Khong the tai du lieu",
    });
  });

  it("tu dong refresh access token khi request gap 401", async () => {
    localStorage.setItem("accessToken", "expired-access");
    localStorage.setItem("refreshToken", "valid-refresh");

    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "expired" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            user: { id: 1, username: "user1", fullName: "User One", email: null, role: "user", isActive: true },
            accessToken: "new-access",
            refreshToken: "new-refresh",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

    const result = await api.get<{ ok: boolean }>("/protected");

    expect(result).toEqual({ ok: true });
    expect(localStorage.getItem("accessToken")).toBe("new-access");
    expect(localStorage.getItem("refreshToken")).toBe("new-refresh");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
