import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, api } from "./api";
import { useApiMutation, useApiQuery } from "./hooks";

const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

describe("useApiQuery", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    toastSuccessMock.mockReset();
    toastErrorMock.mockReset();
  });

  it("khong goi api khi endpoint la null", async () => {
    const getSpy = vi.spyOn(api, "get");

    const { result } = renderHook(() => useApiQuery<unknown>(null));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(getSpy).not.toHaveBeenCalled();
  });

  it("tai du lieu thanh cong va cap nhat state", async () => {
    vi.spyOn(api, "get").mockResolvedValueOnce({ id: 1, name: "demo" });

    const { result } = renderHook(() => useApiQuery<{ id: number; name: string }>("/items"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual({ id: 1, name: "demo" });
    });
    expect(result.current.error).toBeNull();
  });

  it("luu loi tu ApiError vao state", async () => {
    vi.spyOn(api, "get").mockRejectedValueOnce(new ApiError(500, "Khong the tai"));

    const { result } = renderHook(() => useApiQuery("/items"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe("Khong the tai");
    });
  });

  it("refetch goi lai api va cap nhat du lieu moi", async () => {
    const getSpy = vi
      .spyOn(api, "get")
      .mockResolvedValueOnce({ id: 1, name: "first" })
      .mockResolvedValueOnce({ id: 2, name: "second" });

    const { result } = renderHook(() => useApiQuery<{ id: number; name: string }>("/items"));

    await waitFor(() => expect(result.current.data).toEqual({ id: 1, name: "first" }));

    await act(async () => {
      await result.current.refetch();
    });

    expect(getSpy).toHaveBeenCalledTimes(2);
    expect(result.current.data).toEqual({ id: 2, name: "second" });
  });
});

describe("useApiMutation", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    toastSuccessMock.mockReset();
    toastErrorMock.mockReset();
  });

  it("goi api, toast success va onSuccess khi mutate thanh cong", async () => {
    const onSuccess = vi.fn();
    vi.spyOn(api, "post").mockResolvedValueOnce({ id: 10, name: "created" });

    const { result } = renderHook(() =>
      useApiMutation<{ name: string }, { id: number; name: string }>("post", "/items", {
        successMessage: "Thanh cong",
        onSuccess,
      }),
    );

    await act(async () => {
      const response = await result.current.mutate({ name: "created" });
      expect(response).toEqual({ id: 10, name: "created" });
    });

    expect(toastSuccessMock).toHaveBeenCalledWith("Thanh cong");
    expect(onSuccess).toHaveBeenCalledWith({ id: 10, name: "created" });
    expect(result.current.loading).toBe(false);
  });

  it("toast error va nem lai loi khi mutate that bai", async () => {
    vi.spyOn(api, "delete").mockRejectedValueOnce(new ApiError(404, "Khong ton tai"));

    const { result } = renderHook(() =>
      useApiMutation<undefined, { ok: boolean }>("delete", "/items/1"),
    );

    await expect(
      act(async () => {
        await result.current.mutate(undefined);
      }),
    ).rejects.toThrow();

    expect(toastErrorMock).toHaveBeenCalledWith("Khong ton tai");
    expect(result.current.loading).toBe(false);
  });
});
