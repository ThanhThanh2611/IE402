import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";

export function useApiQuery<T>(endpoint: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!endpoint) return;
    setLoading(true);
    setError(null);
    try {
      const result = await api.get<T>(endpoint);
      setData(result);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Lỗi tải dữ liệu";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useApiMutation<TInput, TResult = unknown>(
  method: "post" | "put" | "patch" | "delete",
  endpoint: string,
  options?: { successMessage?: string; onSuccess?: (data: TResult) => void },
) {
  const [loading, setLoading] = useState(false);

  const mutate = useCallback(
    async (data?: TInput) => {
      setLoading(true);
      try {
        const result = await api[method]<TResult>(endpoint, data);
        if (options?.successMessage) toast.success(options.successMessage);
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : "Có lỗi xảy ra";
        toast.error(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [method, endpoint, options],
  );

  return { mutate, loading };
}

export function formatVND(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num);
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}
