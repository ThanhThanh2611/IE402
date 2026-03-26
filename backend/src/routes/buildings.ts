import { Router, Request, Response } from "express";
import { db } from "../db";
import { buildings, floors, apartments } from "../db/schema";
import { eq, and, sql, count, SQL } from "drizzle-orm";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// CẤU HÌNH MULTER: Nơi lưu và tên file 3D Model
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/models";
    // Tạo folder nếu chưa tồn tại
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const buildingId = req.params.id;
    const ext = path.extname(file.originalname);
    cb(null, `building-${buildingId}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedExts = [".glb", ".gltf"];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Hệ thống chỉ chấp nhận định dạng mô hình 3D: .glb hoặc .gltf"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // Giới hạn file 50MB
});

// GET /api/buildings - Lấy danh sách tòa nhà (UC03 - Filter)
router.get("/", async (req: Request, res: Response) => {
  try {
    // Dùng typeof để triệt tiêu hoàn toàn lỗi string | string[]
    const district = typeof req.query.district === "string" ? req.query.district : undefined;
    const city = typeof req.query.city === "string" ? req.query.city : undefined;
    const ward = typeof req.query.ward === "string" ? req.query.ward : undefined;
    const minPrice = typeof req.query.minPrice === "string" ? req.query.minPrice : undefined;
    const maxPrice = typeof req.query.maxPrice === "string" ? req.query.maxPrice : undefined;

    const conditions: SQL[] = [];
    
    if (district) conditions.push(eq(buildings.district, district));
    if (city) conditions.push(eq(buildings.city, city));
    if (ward) conditions.push(eq(buildings.ward, ward));

    let result;
    if (conditions.length > 0) {
      result = await db
        .select()
        .from(buildings)
        .where(and(...conditions));
    } else {
      result = await db.select().from(buildings);
    }

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

// GET /api/buildings/geojson - Trả danh sách tòa nhà dạng GeoJSON FeatureCollection
router.get("/geojson", async (req: Request, res: Response) => {
  try {
    const district = typeof req.query.district === "string" ? req.query.district : undefined;
    const city = typeof req.query.city === "string" ? req.query.city : undefined;
    const ward = typeof req.query.ward === "string" ? req.query.ward : undefined;

    const conditions: SQL[] = [];
    
    if (district) conditions.push(eq(buildings.district, district));
    if (city) conditions.push(eq(buildings.city, city));
    if (ward) conditions.push(eq(buildings.ward, ward));

    const result =
      conditions.length > 0
        ? await db
            .select({
              id: buildings.id,
              name: buildings.name,
              address: buildings.address,
              ward: buildings.ward,
              district: buildings.district,
              city: buildings.city,
              totalFloors: buildings.totalFloors,
              imageUrl: buildings.imageUrl,
              model3dUrl: buildings.model3dUrl,
              lng: sql<number>`ST_X(${buildings.location})`,
              lat: sql<number>`ST_Y(${buildings.location})`,
            })
            .from(buildings)
            .where(and(...conditions))
        : await db
            .select({
              id: buildings.id,
              name: buildings.name,
              address: buildings.address,
              ward: buildings.ward,
              district: buildings.district,
              city: buildings.city,
              totalFloors: buildings.totalFloors,
              imageUrl: buildings.imageUrl,
              model3dUrl: buildings.model3dUrl,
              lng: sql<number>`ST_X(${buildings.location})`,
              lat: sql<number>`ST_Y(${buildings.location})`,
            })
            .from(buildings);

    const featureCollection = {
      type: "FeatureCollection" as const,
      features: result.map((b) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [b.lng, b.lat],
        },
        properties: {
          id: b.id,
          name: b.name,
          address: b.address,
          ward: b.ward,
          district: b.district,
          city: b.city,
          totalFloors: b.totalFloors,
          imageUrl: b.imageUrl,
          model3dUrl: b.model3dUrl,
        },
      })),
    };

    res.json(featureCollection);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy dữ liệu GeoJSON" });
  }
});

// GET /api/buildings/nearby?lat=10.79&lng=106.72&radius=5000 - Tìm tòa nhà gần vị trí (PostGIS)
router.get("/nearby", async (req: Request, res: Response) => {
  try {
    const lat = typeof req.query.lat === "string" ? req.query.lat : undefined;
    const lng = typeof req.query.lng === "string" ? req.query.lng : undefined;
    const radius = typeof req.query.radius === "string" ? req.query.radius : undefined;

    if (!lat || !lng) {
      return res.status(400).json({ error: "Cần cung cấp lat và lng" });
    }

    const radiusMeters = Number(radius) || 5000;
    const point = sql`ST_SetSRID(ST_MakePoint(${Number(lng)}, ${Number(lat)}), 4326)`;

    const result = await db
      .select({
        building: buildings,
        distance: sql<number>`ST_Distance(${buildings.location}::geography, ${point}::geography)`.as(
          "distance"
        ),
      })
      .from(buildings)
      .where(
        sql`ST_DWithin(${buildings.location}::geography, ${point}::geography, ${radiusMeters})`
      )
      .orderBy(sql`distance`);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi tìm tòa nhà gần đây" });
  }
});

// GET /api/buildings/:id - Lấy chi tiết tòa nhà
router.get("/:id", async (req: Request, res: Response) => {
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
router.get("/:id/occupancy", async (req: Request, res: Response) => {
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
router.post("/", async (req: Request, res: Response) => {
  try {
    const { longitude, latitude, ...rest } = req.body;
    const result = await db
      .insert(buildings)
      .values({
        ...rest,
        location: sql`ST_SetSRID(ST_MakePoint(${Number(longitude)}, ${Number(latitude)}, 0), 4326)`,
      })
      .returning();
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi thêm tòa nhà" });
  }
});

// PUT /api/buildings/:id - Cập nhật tòa nhà
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { longitude, latitude, ...rest } = req.body;
    const updateData: Record<string, unknown> = {
      ...rest,
      updatedAt: new Date(),
    };
    if (longitude && latitude) {
      updateData.location = sql`ST_SetSRID(ST_MakePoint(${Number(longitude)}, ${Number(latitude)}, 0), 4326)`;
    }

    const result = await db
      .update(buildings)
      .set(updateData)
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
router.delete("/:id", async (req: Request, res: Response) => {
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

// POST /api/buildings/:id/model - Upload File Mô hình 3D (.glb, .gltf)
router.post("/:id/model", upload.single("file"), async (req: Request, res: Response): Promise<void> => {
  try {
    const buildingId = Number(req.params.id);

    if (!req.file) {
      res.status(400).json({ error: "Không tìm thấy tệp mô hình đính kèm." });
      return;
    }

    const model3dUrl = `/uploads/models/${req.file.filename}`;

    const result = await db
      .update(buildings)
      .set({
        model3dUrl,
        updatedAt: new Date(),
      })
      .where(eq(buildings.id, buildingId))
      .returning();

    if (result.length === 0) {
      res.status(404).json({ error: "Không tìm thấy tòa nhà" });
      return;
    }

    res.status(200).json({
      message: "Upload mô hình 3D thành công!",
      data: result[0],
    });
  } catch (error: any) {
    console.error("Lỗi khi upload model 3D:", error);
    res.status(500).json({ error: error.message || "Lỗi khi upload mô hình" });
  }
});

export default router;