import { Router } from "express";
import { db } from "../db";
import {
  buildings,
  floors,
  apartments,
  rentalContracts,
  payments,
} from "../db/schema";
import { eq, sql, and, gte, lte, count } from "drizzle-orm";

const router = Router();

function toMonthKey(value: string | Date): string {
  const date = new Date(value);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function startOfMonth(value: string | Date): Date {
  const date = new Date(value);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function endOfMonth(value: string | Date): Date {
  const date = new Date(value);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
}

function toDateOnlyString(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function buildMonthRange(from: Date, to: Date): string[] {
  const result: string[] = [];
  const cursor = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), 1));
  const end = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), 1));

  while (cursor <= end) {
    result.push(toMonthKey(cursor));
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return result;
}

// GET /api/dashboard/overview - Tổng quan (UC22)
router.get("/overview", async (_req, res) => {
  try {
    const [buildingCount] = await db
      .select({ count: count() })
      .from(buildings);
    const [apartmentCount] = await db
      .select({ count: count() })
      .from(apartments);
    const [rentedCount] = await db
      .select({ count: count() })
      .from(apartments)
      .where(eq(apartments.status, "rented"));
    const [contractCount] = await db
      .select({ count: count() })
      .from(rentalContracts)
      .where(eq(rentalContracts.status, "active"));

    res.json({
      totalBuildings: buildingCount.count,
      totalApartments: apartmentCount.count,
      rentedApartments: rentedCount.count,
      occupancyRate:
        apartmentCount.count > 0
          ? Number((Number(rentedCount.count) / Number(apartmentCount.count)).toFixed(3))
          : 0,
      activeContracts: contractCount.count,
    });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy dữ liệu tổng quan" });
  }
});

// GET /api/dashboard/occupancy - Tỷ lệ lấp đầy theo tòa nhà (UC23)
router.get("/occupancy", async (_req, res) => {
  try {
    const result = await db
      .select({
        buildingId: buildings.id,
        buildingName: buildings.name,
        totalApartments: count(apartments.id),
        rentedApartments: sql<number>`count(case when ${apartments.status} = 'rented' then 1 end)`,
      })
      .from(buildings)
      .leftJoin(floors, eq(floors.buildingId, buildings.id))
      .leftJoin(apartments, eq(apartments.floorId, floors.id))
      .groupBy(buildings.id, buildings.name);

    const data = result.map((row) => ({
      ...row,
      occupancyRate:
        Number(row.totalApartments) > 0
          ? Number((Number(row.rentedApartments) / Number(row.totalApartments)).toFixed(3))
          : 0,
    }));

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy thống kê tỷ lệ lấp đầy" });
  }
});

// GET /api/dashboard/revenue?from=2025-01-01&to=2025-12-31 - Thống kê doanh thu (UC24)
router.get("/revenue", async (req, res) => {
  try {
    const { from, to } = req.query;

    const conditions = [];
    if (from) conditions.push(gte(payments.paymentDate, String(from)));
    if (to) conditions.push(lte(payments.paymentDate, String(to)));
    conditions.push(eq(payments.status, "paid"));

    const result = await db
      .select({
        totalRevenue: sql<string>`coalesce(sum(${payments.amount}), 0)`,
        totalPayments: count(),
      })
      .from(payments)
      .where(and(...conditions));

    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy thống kê doanh thu" });
  }
});

// GET /api/dashboard/revenue-by-month?year=2025 - Doanh thu theo tháng (UC25)
router.get("/revenue-by-month", async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();

    const result = await db
      .select({
        month: sql<string>`to_char(${payments.paymentDate}::date, 'YYYY-MM')`,
        revenue: sql<string>`coalesce(sum(${payments.amount}), 0)`,
        count: count(),
      })
      .from(payments)
      .where(
        and(
          eq(payments.status, "paid"),
          sql`extract(year from ${payments.paymentDate}::date) = ${Number(year)}`
        )
      )
      .groupBy(sql`to_char(${payments.paymentDate}::date, 'YYYY-MM')`)
      .orderBy(sql`to_char(${payments.paymentDate}::date, 'YYYY-MM')`);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy doanh thu theo tháng" });
  }
});

// GET /api/dashboard/occupancy-history?from=2025-01-01&to=2025-12-31 - Tỷ lệ lấp đầy theo thời gian (UC25)
router.get("/occupancy-history", async (req, res) => {
  try {
    const { from, to } = req.query;
    const [apartmentCount] = await db
      .select({ count: count() })
      .from(apartments);
    const totalApartments = Number(apartmentCount.count);

    const contracts = await db
      .select({
        startDate: rentalContracts.startDate,
        endDate: rentalContracts.endDate,
        status: rentalContracts.status,
      })
      .from(rentalContracts)
      .where(eq(rentalContracts.status, "active"));

    if (contracts.length === 0) {
      return res.json([]);
    }

    const requestedFrom = from ? startOfMonth(String(from)) : null;
    const requestedTo = to ? endOfMonth(String(to)) : null;

    const sortedStartDates = contracts
      .map((contract) => new Date(contract.startDate))
      .sort((a, b) => a.getTime() - b.getTime());

    const defaultFrom = startOfMonth(sortedStartDates[0]);
    const defaultTo = endOfMonth(new Date());

    const rangeFrom = requestedFrom ?? defaultFrom;
    const rangeTo = requestedTo ?? defaultTo;

    if (rangeFrom > rangeTo) {
      return res.status(400).json({ error: "Khoảng thời gian không hợp lệ" });
    }

    const monthKeys = buildMonthRange(rangeFrom, rangeTo);
    const monthData = monthKeys.map((month) => {
      const newContracts = contracts.filter(
        (contract) => toMonthKey(contract.startDate) === month
      ).length;

      const snapshotDate = toDateOnlyString(endOfMonth(`${month}-01`));
      const activeContracts = contracts.filter((contract) => {
        const startDate = String(contract.startDate);
        const endDate = String(contract.endDate);
        return startDate <= snapshotDate && endDate >= snapshotDate;
      }).length;

      return {
        month,
        newContracts,
        activeContracts,
        occupancyRate:
          totalApartments > 0
            ? Number((activeContracts / totalApartments).toFixed(3))
            : 0,
      };
    });

    res.json(monthData);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy lịch sử lấp đầy" });
  }
});

// GET /api/dashboard/map-snapshot?date=2025-06-01 - Dữ liệu bản đồ tại thời điểm cụ thể
// Trả về tất cả buildings kèm tỷ lệ lấp đầy tại thời điểm đó
router.get("/map-snapshot", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: "Cần cung cấp tham số date (YYYY-MM-DD)" });
    }

    const snapshotDate = String(date);

    // Lấy tất cả buildings kèm tọa độ (PostGIS ST_X, ST_Y)
    const allBuildings = await db
      .select({
        id: buildings.id,
        name: buildings.name,
        address: buildings.address,
        district: buildings.district,
        city: buildings.city,
        lng: sql<number>`ST_X(${buildings.location})`,
        lat: sql<number>`ST_Y(${buildings.location})`,
      })
      .from(buildings);

    // Với mỗi building, tính số căn hộ có hợp đồng active tại thời điểm đó
    const result = await Promise.all(
      allBuildings.map(async (building) => {
        // Tổng căn hộ của tòa nhà
        const [totalResult] = await db
          .select({ count: count() })
          .from(apartments)
          .innerJoin(floors, eq(apartments.floorId, floors.id))
          .where(eq(floors.buildingId, building.id));

        // Số căn hộ đang được thuê tại thời điểm date
        // (có hợp đồng active mà start_date <= date và end_date >= date)
        const [rentedResult] = await db
          .select({ count: count() })
          .from(rentalContracts)
          .innerJoin(apartments, eq(rentalContracts.apartmentId, apartments.id))
          .innerJoin(floors, eq(apartments.floorId, floors.id))
          .where(
            and(
              eq(floors.buildingId, building.id),
              lte(rentalContracts.startDate, snapshotDate),
              gte(rentalContracts.endDate, snapshotDate),
              eq(rentalContracts.status, "active")
            )
          );

        const total = Number(totalResult.count);
        const rented = Number(rentedResult.count);

        return {
          id: building.id,
          name: building.name,
          address: building.address,
          district: building.district,
          city: building.city,
          lng: building.lng,
          lat: building.lat,
          totalApartments: total,
          rentedApartments: rented,
          availableApartments: total - rented,
          occupancyRate: total > 0 ? Number((rented / total).toFixed(3)) : 0,
        };
      })
    );

    // Trả về dạng GeoJSON FeatureCollection
    res.json({
      type: "FeatureCollection",
      metadata: { date: snapshotDate },
      features: result.map((b) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [b.lng, b.lat],
        },
        properties: {
          id: b.id,
          name: b.name,
          address: b.address,
          district: b.district,
          city: b.city,
          totalApartments: b.totalApartments,
          rentedApartments: b.rentedApartments,
          availableApartments: b.availableApartments,
          occupancyRate: b.occupancyRate,
        },
      })),
    });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy dữ liệu bản đồ theo thời gian" });
  }
});

export default router;
