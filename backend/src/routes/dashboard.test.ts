import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const selectMock = vi.fn();

vi.mock("../db", () => ({
  db: {
    select: selectMock,
  },
}));

function queueSelectSteps(steps: Array<() => unknown>) {
  selectMock.mockImplementation(() => {
    const next = steps.shift();
    if (!next) {
      throw new Error("No mocked select step left");
    }
    return next();
  });
}

describe("dashboard route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function createApp() {
    const { default: dashboardRouter } = await import("./dashboard");
    const app = express();
    app.use(express.json());
    app.use("/api/dashboard", dashboardRouter);
    return app;
  }

  it("tra ve dashboard overview", async () => {
    queueSelectSteps([
      () => ({ from: vi.fn().mockResolvedValueOnce([{ count: 5 }]) }),
      () => ({ from: vi.fn().mockResolvedValueOnce([{ count: 20 }]) }),
      () => ({
        from: vi.fn(() => ({
          where: vi.fn().mockResolvedValueOnce([{ count: 10 }]),
        })),
      }),
      () => ({
        from: vi.fn(() => ({
          where: vi.fn().mockResolvedValueOnce([{ count: 8 }]),
        })),
      }),
    ]);

    const app = await createApp();
    const response = await request(app).get("/api/dashboard/overview");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      totalBuildings: 5,
      totalApartments: 20,
      rentedApartments: 10,
      occupancyRate: 0.5,
      activeContracts: 8,
    });
  });

  it("tra 400 khi khoang ngay occupancy-history khong hop le", async () => {
    queueSelectSteps([
      () => ({ from: vi.fn().mockResolvedValueOnce([{ count: 10 }]) }),
      () => ({
        from: vi.fn(() => ({
          where: vi.fn().mockResolvedValueOnce([
            {
              startDate: "2026-01-01",
              endDate: "2026-12-31",
              status: "active",
            },
          ]),
        })),
      }),
    ]);

    const app = await createApp();
    const response = await request(app)
      .get("/api/dashboard/occupancy-history?from=2026-06-01&to=2026-01-01");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Khoảng thời gian không hợp lệ" });
  });

  it("tra 400 khi map-snapshot thieu date", async () => {
    const app = await createApp();
    const response = await request(app).get("/api/dashboard/map-snapshot");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Cần cung cấp tham số date (YYYY-MM-DD)" });
  });

  it("tra geojson snapshot theo moc thoi gian", async () => {
    queueSelectSteps([
      () =>
        ({
          from: vi.fn().mockResolvedValueOnce([
            {
              id: 1,
              name: "Tower A",
              address: "1 Nguyen Hue",
              district: "1",
              city: "HCM",
              lng: 106.7,
              lat: 10.7,
            },
          ]),
        }) as unknown,
      () =>
        ({
          from: vi.fn(() => ({
            innerJoin: vi.fn(() => ({
              where: vi.fn().mockResolvedValueOnce([{ count: 10 }]),
            })),
          })),
        }) as unknown,
      () =>
        ({
          from: vi.fn(() => ({
            innerJoin: vi.fn(() => ({
              innerJoin: vi.fn(() => ({
                where: vi.fn().mockResolvedValueOnce([{ count: 6 }]),
              })),
            })),
          })),
        }) as unknown,
    ]);

    const app = await createApp();
    const response = await request(app).get("/api/dashboard/map-snapshot?date=2026-04-08");

    expect(response.status).toBe(200);
    expect(response.body.type).toBe("FeatureCollection");
    expect(response.body.metadata).toEqual({ date: "2026-04-08" });
    expect(response.body.features[0].properties).toMatchObject({
      id: 1,
      name: "Tower A",
      totalApartments: 10,
      rentedApartments: 6,
      availableApartments: 4,
      occupancyRate: 0.6,
    });
  });
});
