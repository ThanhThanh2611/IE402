import { Router } from "express";
import { db } from "../db";
import { buildings, floors, apartments } from "../db/schema";
import { eq, and, sql, count } from "drizzle-orm";

const router = Router();

// GET /api/buildings - Lấy danh sách tòa nhà (UC03 - Filter)
// Query params: district, city, ward, minPrice, maxPrice
router.get("/", async (req, res) => {
  try {
    const { district, city, ward, minPrice, maxPrice } = req.query;

    const conditions = [];
    if (district) conditions.push(eq(buildings.district, String(district)));
    if (city) conditions.push(eq(buildings.city, String(city)));
    if (ward) conditions.push(eq(buildings.ward, String(ward)));

    let result;
    if (conditions.length > 0) {
      result = await db
        .select()
        .from(buildings)
        .where(and(...conditions));
    } else {
      result = await db.select().from(buildings);
    }

    // Lọc theo giá thuê trung bình nếu có minPrice/maxPrice
    if (minPrice || maxPrice) {
      const buildingsWithPrice = await db
        .select({
          buildingId: buildings.id,
          avgPrice: sql<string>`avg(${apartments.rentalPrice}::numeric)`,
        })
        .from(buildings)
        .leftJoin(floors, eq(floors.buildingId, buildings.id))
        .leftJoin(apartments, eq(apartments.floorId, floors.id))
        .groupBy(buildings.id);

      const validIds = buildingsWithPrice
        .filter((b) => {
          const avg = Number(b.avgPrice);
          if (minPrice && avg < Number(minPrice)) return false;
          if (maxPrice && avg > Number(maxPrice)) return false;
          return true;
        })
        .map((b) => b.buildingId);

      result = result.filter((b) => validIds.includes(b.id));
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách tòa nhà" });
  }
});

// GET /api/buildings/nearby?lat=10.79&lng=106.72&radius=5 - Tìm tòa nhà gần vị trí (GIS)
// radius tính bằng km
router.get("/nearby", async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: "Cần cung cấp lat và lng" });
    }

    const radiusKm = Number(radius) || 5;

    // Haversine formula trong SQL
    const result = await db
      .select({
        building: buildings,
        distance: sql<number>`
          6371 * acos(
            cos(radians(${Number(lat)})) * cos(radians(${buildings.latitude}::numeric))
            * cos(radians(${buildings.longitude}::numeric) - radians(${Number(lng)}))
            + sin(radians(${Number(lat)})) * sin(radians(${buildings.latitude}::numeric))
          )
        `.as("distance"),
      })
      .from(buildings)
      .where(
        sql`
          6371 * acos(
            cos(radians(${Number(lat)})) * cos(radians(${buildings.latitude}::numeric))
            * cos(radians(${buildings.longitude}::numeric) - radians(${Number(lng)}))
            + sin(radians(${Number(lat)})) * sin(radians(${buildings.latitude}::numeric))
          ) <= ${radiusKm}
        `
      )
      .orderBy(sql`distance`);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi tìm tòa nhà gần đây" });
  }
});

// GET /api/buildings/:id - Lấy chi tiết tòa nhà
router.get("/:id", async (req, res) => {
  try {
    const result = await db
      .select()
      .from(buildings)
      .where(eq(buildings.id, Number(req.params.id)));
    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy tòa nhà" });
    }
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy thông tin tòa nhà" });
  }
});

// GET /api/buildings/:id/occupancy - Tỷ lệ lấp đầy của tòa nhà (UC04)
router.get("/:id/occupancy", async (req, res) => {
  try {
    const result = await db
      .select({
        total: count(apartments.id),
        rented: sql<number>`count(case when ${apartments.status} = 'rented' then 1 end)`,
      })
      .from(apartments)
      .innerJoin(floors, eq(apartments.floorId, floors.id))
      .where(eq(floors.buildingId, Number(req.params.id)));

    const { total, rented } = result[0];
    res.json({
      totalApartments: total,
      rentedApartments: rented,
      occupancyRate:
        Number(total) > 0
          ? ((Number(rented) / Number(total)) * 100).toFixed(1)
          : "0",
    });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy tỷ lệ lấp đầy" });
  }
});

// POST /api/buildings - Thêm tòa nhà
router.post("/", async (req, res) => {
  try {
    const result = await db.insert(buildings).values(req.body).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi thêm tòa nhà" });
  }
});

// PUT /api/buildings/:id - Cập nhật tòa nhà
router.put("/:id", async (req, res) => {
  try {
    const result = await db
      .update(buildings)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(buildings.id, Number(req.params.id)))
      .returning();
    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy tòa nhà" });
    }
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi cập nhật tòa nhà" });
  }
});

// DELETE /api/buildings/:id - Xóa tòa nhà
router.delete("/:id", async (req, res) => {
  try {
    const result = await db
      .delete(buildings)
      .where(eq(buildings.id, Number(req.params.id)))
      .returning();
    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy tòa nhà" });
    }
    res.json({ message: "Đã xóa tòa nhà" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa tòa nhà" });
  }
});

export default router;
