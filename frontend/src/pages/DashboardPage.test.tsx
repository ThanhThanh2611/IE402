import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DashboardPage from "./DashboardPage";

const useApiQueryMock = vi.fn();

vi.mock("@/lib/hooks", () => ({
  useApiQuery: (...args: unknown[]) => useApiQueryMock(...args),
  formatVND: (value: string | number) => `VND ${value}`,
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    useApiQueryMock.mockReset();
  });

  it("hien thong bao loi than thien khi mot khoi du lieu loi", () => {
    useApiQueryMock.mockImplementation((endpoint: string) => {
      if (endpoint === "/dashboard/overview") {
        return {
          data: null,
          loading: false,
          error: "Không tải được overview",
          refetch: vi.fn(),
        };
      }

      if (endpoint === "/dashboard/occupancy") {
        return { data: [], loading: false, error: null, refetch: vi.fn() };
      }

      if (endpoint.includes("/dashboard/revenue-by-month")) {
        return { data: [], loading: false, error: null, refetch: vi.fn() };
      }

      if (endpoint.includes("/dashboard/revenue?")) {
        return {
          data: { totalRevenue: "0", totalPayments: 0 },
          loading: false,
          error: null,
          refetch: vi.fn(),
        };
      }

      if (endpoint.includes("/dashboard/occupancy-history")) {
        return { data: [], loading: false, error: null, refetch: vi.fn() };
      }

      return {
        data: { metadata: { date: "2026-04-08" }, features: [] },
        loading: false,
        error: null,
        refetch: vi.fn(),
      };
    });

    render(<DashboardPage />);

    expect(screen.getByText("Một số khối dữ liệu dashboard đang tải lỗi")).not.toBeNull();
    expect(screen.getByText("Không tải được overview")).not.toBeNull();
  });

  it("render snapshot occupancy tren dashboard", () => {
    useApiQueryMock.mockImplementation((endpoint: string) => {
      if (endpoint === "/dashboard/overview") {
        return {
          data: {
            totalBuildings: 2,
            totalApartments: 10,
            rentedApartments: 6,
            occupancyRate: 0.6,
            activeContracts: 6,
          },
          loading: false,
          error: null,
          refetch: vi.fn(),
        };
      }

      if (endpoint === "/dashboard/occupancy") {
        return {
          data: [
            { buildingId: 1, buildingName: "A", totalApartments: 5, rentedApartments: 4, occupancyRate: 0.8 },
          ],
          loading: false,
          error: null,
          refetch: vi.fn(),
        };
      }

      if (endpoint.includes("/dashboard/revenue-by-month")) {
        return {
          data: [{ month: "2026-04", revenue: "10000000", count: 2 }],
          loading: false,
          error: null,
          refetch: vi.fn(),
        };
      }

      if (endpoint.includes("/dashboard/revenue?")) {
        return {
          data: { totalRevenue: "10000000", totalPayments: 2 },
          loading: false,
          error: null,
          refetch: vi.fn(),
        };
      }

      if (endpoint.includes("/dashboard/occupancy-history")) {
        return {
          data: [
            { month: "2026-03", newContracts: 1, activeContracts: 4, occupancyRate: 0.4 },
            { month: "2026-04", newContracts: 2, activeContracts: 6, occupancyRate: 0.6 },
          ],
          loading: false,
          error: null,
          refetch: vi.fn(),
        };
      }

      return {
        data: {
          metadata: { date: "2026-04-08" },
          features: [
            {
              type: "Feature",
              geometry: { type: "Point", coordinates: [106.7, 10.7] },
              properties: {
                id: 1,
                name: "Sunrise Tower",
                address: "1 Nguyen Hue",
                district: "1",
                city: "HCM",
                totalApartments: 5,
                rentedApartments: 4,
                availableApartments: 1,
                occupancyRate: 0.8,
              },
            },
          ],
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      };
    });

    render(<DashboardPage />);

    expect(screen.getByText("Snapshot occupancy theo mốc thời gian")).not.toBeNull();
    expect(screen.getByText("Sunrise Tower")).not.toBeNull();
    expect(screen.getByText("4/5 căn đã được lấp đầy tại mốc này")).not.toBeNull();
  });
});
