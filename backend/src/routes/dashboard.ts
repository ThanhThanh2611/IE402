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
          ? ((Number(rentedCount.count) / Number(apartmentCount.count)) * 100).toFixed(1)
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
          ? ((Number(row.rentedApartments) / Number(row.totalApartments)) * 100).toFixed(1)
          : "0",
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

    const conditions = [];
    if (from)
      conditions.push(
        gte(sql`${rentalContracts.startDate}::date`, String(from))
      );
    if (to)
      conditions.push(lte(sql`${rentalContracts.startDate}::date`, String(to)));

    const result = await db
      .select({
        month: sql<string>`to_char(${rentalContracts.startDate}::date, 'YYYY-MM')`,
        newContracts: count(),
      })
      .from(rentalContracts)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(sql`to_char(${rentalContracts.startDate}::date, 'YYYY-MM')`)
      .orderBy(sql`to_char(${rentalContracts.startDate}::date, 'YYYY-MM')`);

    res.json(result);
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

    // Lấy tất cả buildings kèm tọa độ
    const allBuildings = await db.select().from(buildings);

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
          latitude: building.latitude,
          longitude: building.longitude,
          totalApartments: total,
          rentedApartments: rented,
          availableApartments: total - rented,
          occupancyRate: total > 0 ? ((rented / total) * 100).toFixed(1) : "0",
        };
      })
    );

    res.json({ date: snapshotDate, buildings: result });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy dữ liệu bản đồ theo thời gian" });
  }
});

export default router;
