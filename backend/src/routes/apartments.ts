import { Request, Response, Router } from "express";
import {
  and,
  asc,
  desc,
  eq,
  gte,
  inArray,
  isNull,
  or,
  sql,
} from "drizzle-orm";
import { db } from "../db";
import {
  apartmentAccessGrants,
  apartmentSpaces,
  apartments,
  buildings,
  floors,
  furnitureCatalog,
  furnitureItems,
  furnitureLayouts,
  rentalContracts,
  tenants,
  users,
} from "../db/schema";

const router = Router();

function parsePointZ(value: string) {
  const matched = value.match(/POINT\s+Z\s*\(\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s*\)/i);
  if (!matched) return null;

  return {
    x: Number(matched[1]),
    y: Number(matched[2]),
    z: Number(matched[3]),
  };
}

async function validateFurniturePlacement(
  layoutId: number,
  positionWkt: string,
  ignoreItemId?: number
) {
  const position = parsePointZ(positionWkt);
  if (!position) {
    return "Vị trí nội thất phải có định dạng POINT Z(x y z)";
  }

  if (
    Number.isNaN(position.x) ||
    Number.isNaN(position.y) ||
    Number.isNaN(position.z)
  ) {
    return "Tọa độ nội thất không hợp lệ";
  }

  if (position.x < 0 || position.x > 100 || position.y < 0 || position.y > 100) {
    return "Vật thể vượt ra ngoài không gian hợp lệ";
  }

  const existingItems = await db
    .select()
    .from(furnitureItems)
    .where(eq(furnitureItems.layoutId, layoutId));

  for (const item of existingItems) {
    if (ignoreItemId && item.id === ignoreItemId) continue;

    const itemPosition = parsePointZ(item.position);
    if (!itemPosition) continue;

    const sameLevel = Math.abs(itemPosition.z - position.z) <= 1;
    const distance = Math.hypot(itemPosition.x - position.x, itemPosition.y - position.y);

    if (sameLevel && distance < 8) {
      return "Vật thể va chạm với đối tượng khác trong layout";
    }
  }

  return null;
}

async function getApartmentOrNull(apartmentId: number) {
  const result = await db
    .select()
    .from(apartments)
    .where(and(eq(apartments.id, apartmentId), isNull(apartments.deletedAt)));

  return result[0] ?? null;
}

async function getApartmentAccessForUser(apartmentId: number, userId?: number) {
  if (!userId) {
    return null;
  }

  const result = await db
    .select()
    .from(apartmentAccessGrants)
    .where(
      and(
        eq(apartmentAccessGrants.apartmentId, apartmentId),
        eq(apartmentAccessGrants.userId, userId),
        or(
          isNull(apartmentAccessGrants.expiresAt),
          gte(apartmentAccessGrants.expiresAt, new Date())
        )
      )
    );

  return result[0] ?? null;
}

async function getApartmentDetailData(
  apartmentId: number,
  viewer: { id?: number; role: "user" | "manager" }
) {
  const apartment = await getApartmentOrNull(apartmentId);
  if (!apartment) return null;

  const floorResult = await db
    .select()
    .from(floors)
    .where(eq(floors.id, apartment.floorId));
  const floor = floorResult[0] ?? null;

  const buildingResult = floor
    ? await db.select().from(buildings).where(eq(buildings.id, floor.buildingId))
    : [];
  const building = buildingResult[0] ?? null;

  const spaces = await db
    .select({
      id: apartmentSpaces.id,
      apartmentId: apartmentSpaces.apartmentId,
      parentSpaceId: apartmentSpaces.parentSpaceId,
      name: apartmentSpaces.name,
      spaceType: apartmentSpaces.spaceType,
      roomType: apartmentSpaces.roomType,
      lodLevel: apartmentSpaces.lodLevel,
      boundary: sql<string | null>`case when ${apartmentSpaces.boundary} is null then null else ST_AsText(${apartmentSpaces.boundary}) end`,
      model3dUrl: apartmentSpaces.model3dUrl,
      metadata: apartmentSpaces.metadata,
      createdAt: apartmentSpaces.createdAt,
      updatedAt: apartmentSpaces.updatedAt,
    })
    .from(apartmentSpaces)
    .where(eq(apartmentSpaces.apartmentId, apartmentId))
    .orderBy(asc(apartmentSpaces.name));

  const layouts = await db
    .select()
    .from(furnitureLayouts)
    .where(eq(furnitureLayouts.apartmentId, apartmentId))
    .orderBy(desc(furnitureLayouts.updatedAt), desc(furnitureLayouts.id));

  const items =
    layouts.length > 0
      ? await db
          .select({
            id: furnitureItems.id,
            layoutId: furnitureItems.layoutId,
            spaceId: furnitureItems.spaceId,
            catalogId: furnitureItems.catalogId,
            label: furnitureItems.label,
            position: sql<string>`ST_AsText(${furnitureItems.position})`,
            rotationX: furnitureItems.rotationX,
            rotationY: furnitureItems.rotationY,
            rotationZ: furnitureItems.rotationZ,
            scaleX: furnitureItems.scaleX,
            scaleY: furnitureItems.scaleY,
            scaleZ: furnitureItems.scaleZ,
            isLocked: furnitureItems.isLocked,
            metadata: furnitureItems.metadata,
            createdAt: furnitureItems.createdAt,
            updatedAt: furnitureItems.updatedAt,
          })
          .from(furnitureItems)
          .where(inArray(
            furnitureItems.layoutId,
            layouts.map((layout) => layout.id)
          ))
          .orderBy(asc(furnitureItems.id))
      : [];

  const catalog = await db
    .select()
    .from(furnitureCatalog)
    .where(eq(furnitureCatalog.isActive, true))
    .orderBy(asc(furnitureCatalog.name));

  const contracts = await db
    .select()
    .from(rentalContracts)
    .where(
      and(
        eq(rentalContracts.apartmentId, apartmentId),
        isNull(rentalContracts.deletedAt)
      )
    )
    .orderBy(desc(rentalContracts.createdAt), desc(rentalContracts.id));

  const activeContract =
    contracts.find((contract) => contract.status === "active") ??
    contracts[0] ??
    null;

  const tenantRecord = activeContract
    ? (
        await db
          .select()
          .from(tenants)
          .where(
            and(
              eq(tenants.id, activeContract.tenantId),
              isNull(tenants.deletedAt)
            )
          )
      )[0] ?? null
    : null;

  const accessGrant = await getApartmentAccessForUser(apartmentId, viewer.id);
  const isLinkedTenant = tenantRecord?.linkedUserId === viewer.id;
  const canViewTenant =
    viewer.role === "manager" ||
    isLinkedTenant ||
    !!accessGrant?.canViewTenant ||
    !!accessGrant?.canViewContract;
  const canViewContract =
    viewer.role === "manager" ||
    isLinkedTenant ||
    !!accessGrant?.canViewContract;
  const tenant =
    tenantRecord && canViewTenant
      ? tenantRecord
      : tenantRecord
        ? {
            id: tenantRecord.id,
            linkedUserId: tenantRecord.linkedUserId,
            fullName: tenantRecord.fullName,
            phone: null,
            email: null,
            idCard: "",
            address: null,
            createdAt: tenantRecord.createdAt,
            updatedAt: tenantRecord.updatedAt,
          }
        : null;

  return {
    apartment,
    floor,
    building,
    activeContract: canViewContract ? activeContract : null,
    canViewContract,
    canViewTenant,
    tenant,
    spaces,
    layouts: layouts.map((layout) => ({
      ...layout,
      items: items.filter((item) => item.layoutId === layout.id),
    })),
    furnitureCatalog: catalog,
  };
}

function requireManagerForApartmentAdmin(req: Request, res: Response) {
  if (req.user?.role !== "manager") {
    res.status(403).json({ error: "Chỉ Manager mới có quyền quản trị dữ liệu căn hộ" });
    return false;
  }

  return true;
}

// GET /api/apartments?floorId=1 - Lấy danh sách căn hộ (UC08)
router.get("/", async (req, res) => {
  try {
    const { floorId } = req.query;
    const conditions = [isNull(apartments.deletedAt)];
    if (floorId) conditions.push(eq(apartments.floorId, Number(floorId)));

    const result = await db
      .select()
      .from(apartments)
      .where(and(...conditions))
      .orderBy(asc(apartments.code));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách căn hộ" });
  }
});

// GET /api/apartments/:id/access-grants - Danh sách quyền xem tenant/hợp đồng theo căn hộ
router.get("/:id/access-grants", async (req, res) => {
  try {
    if (!requireManagerForApartmentAdmin(req, res)) return;

    const apartmentId = Number(req.params.id);
    const apartment = await getApartmentOrNull(apartmentId);
    if (!apartment) {
      return res.status(404).json({ error: "Không tìm thấy căn hộ" });
    }

    const result = await db
      .select({
        id: apartmentAccessGrants.id,
        apartmentId: apartmentAccessGrants.apartmentId,
        userId: apartmentAccessGrants.userId,
        canViewTenant: apartmentAccessGrants.canViewTenant,
        canViewContract: apartmentAccessGrants.canViewContract,
        expiresAt: apartmentAccessGrants.expiresAt,
        note: apartmentAccessGrants.note,
        grantedById: apartmentAccessGrants.grantedById,
        createdAt: apartmentAccessGrants.createdAt,
        updatedAt: apartmentAccessGrants.updatedAt,
        username: users.username,
        fullName: users.fullName,
        email: users.email,
      })
      .from(apartmentAccessGrants)
      .innerJoin(users, eq(users.id, apartmentAccessGrants.userId))
      .where(eq(apartmentAccessGrants.apartmentId, apartmentId))
      .orderBy(asc(users.fullName), asc(users.username));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách quyền truy cập căn hộ" });
  }
});

// POST /api/apartments/:id/access-grants - Cấp quyền xem tenant/hợp đồng cho user
router.post("/:id/access-grants", async (req, res) => {
  try {
    if (!requireManagerForApartmentAdmin(req, res)) return;

    const apartmentId = Number(req.params.id);
    const apartment = await getApartmentOrNull(apartmentId);
    if (!apartment) {
      return res.status(404).json({ error: "Không tìm thấy căn hộ" });
    }

    const userId = Number(req.body.userId);
    if (!userId) {
      return res.status(400).json({ error: "Thiếu userId hợp lệ để cấp quyền" });
    }

    const userResult = await db
      .select()
      .from(users)
      .where(and(eq(users.id, userId), isNull(users.deletedAt)));
    if (userResult.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy người dùng để cấp quyền" });
    }

    const existingGrant = await db
      .select()
      .from(apartmentAccessGrants)
      .where(
        and(
          eq(apartmentAccessGrants.apartmentId, apartmentId),
          eq(apartmentAccessGrants.userId, userId)
        )
      );

    const values = {
      canViewTenant: !!req.body.canViewTenant,
      canViewContract: !!req.body.canViewContract,
      expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null,
      note: req.body.note ?? null,
      grantedById: req.user?.id ?? null,
      updatedAt: new Date(),
    };

    const result =
      existingGrant.length > 0
        ? await db
            .update(apartmentAccessGrants)
            .set(values)
            .where(eq(apartmentAccessGrants.id, existingGrant[0].id))
            .returning()
        : await db
            .insert(apartmentAccessGrants)
            .values({
              apartmentId,
              userId,
              ...values,
            })
            .returning();

    res.status(existingGrant.length > 0 ? 200 : 201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi cấp quyền truy cập căn hộ" });
  }
});

// PUT /api/apartments/:id/access-grants/:grantId - Cập nhật quyền truy cập căn hộ
router.put("/:id/access-grants/:grantId", async (req, res) => {
  try {
    if (!requireManagerForApartmentAdmin(req, res)) return;

    const apartmentId = Number(req.params.id);
    const grantId = Number(req.params.grantId);

    const result = await db
      .update(apartmentAccessGrants)
      .set({
        canViewTenant: !!req.body.canViewTenant,
        canViewContract: !!req.body.canViewContract,
        expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null,
        note: req.body.note ?? null,
        grantedById: req.user?.id ?? null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(apartmentAccessGrants.id, grantId),
          eq(apartmentAccessGrants.apartmentId, apartmentId)
        )
      )
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy quyền truy cập căn hộ" });
    }

    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi cập nhật quyền truy cập căn hộ" });
  }
});

// DELETE /api/apartments/:id/access-grants/:grantId - Thu hồi quyền truy cập căn hộ
router.delete("/:id/access-grants/:grantId", async (req, res) => {
  try {
    if (!requireManagerForApartmentAdmin(req, res)) return;

    const apartmentId = Number(req.params.id);
    const grantId = Number(req.params.grantId);

    const result = await db
      .delete(apartmentAccessGrants)
      .where(
        and(
          eq(apartmentAccessGrants.id, grantId),
          eq(apartmentAccessGrants.apartmentId, apartmentId)
        )
      )
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy quyền truy cập căn hộ" });
    }

    res.json({ message: "Đã thu hồi quyền truy cập căn hộ" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi thu hồi quyền truy cập căn hộ" });
  }
});

// GET /api/apartments/:id/details - Chi tiết căn hộ + dữ liệu indoor/layout
router.get("/:id/details", async (req, res) => {
  try {
    const apartmentId = Number(req.params.id);
    const detail = await getApartmentDetailData(
      apartmentId,
      {
        id: req.user?.id,
        role: req.user?.role === "manager" ? "manager" : "user",
      }
    );

    if (!detail) {
      return res.status(404).json({ error: "Không tìm thấy căn hộ" });
    }

    res.json(detail);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy dữ liệu chi tiết căn hộ" });
  }
});

// GET /api/apartments/:id - Lấy chi tiết căn hộ
router.get("/:id", async (req, res) => {
  try {
    const result = await db
      .select()
      .from(apartments)
      .where(
        and(eq(apartments.id, Number(req.params.id)), isNull(apartments.deletedAt))
      );
    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy căn hộ" });
    }
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy thông tin căn hộ" });
  }
});

// POST /api/apartments - Thêm căn hộ (UC14)
router.post("/", async (req, res) => {
  try {
    const result = await db.insert(apartments).values(req.body).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi thêm căn hộ" });
  }
});

// PUT /api/apartments/:id - Cập nhật căn hộ (UC15)
router.put("/:id", async (req, res) => {
  try {
    const result = await db
      .update(apartments)
      .set({ ...req.body, updatedAt: new Date() })
      .where(
        and(eq(apartments.id, Number(req.params.id)), isNull(apartments.deletedAt))
      )
      .returning();
    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy căn hộ" });
    }
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi cập nhật căn hộ" });
  }
});

// PATCH /api/apartments/:id/status - Cập nhật trạng thái căn hộ (UC17)
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const result = await db
      .update(apartments)
      .set({ status, updatedAt: new Date() })
      .where(
        and(eq(apartments.id, Number(req.params.id)), isNull(apartments.deletedAt))
      )
      .returning();
    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy căn hộ" });
    }
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi cập nhật trạng thái" });
  }
});

// POST /api/apartments/:id/spaces - Thêm không gian indoor
router.post("/:id/spaces", async (req, res) => {
  try {
    if (!requireManagerForApartmentAdmin(req, res)) return;

    const apartmentId = Number(req.params.id);
    const apartment = await getApartmentOrNull(apartmentId);
    if (!apartment) {
      return res.status(404).json({ error: "Không tìm thấy căn hộ" });
    }

    const result = await db
      .insert(apartmentSpaces)
      .values({ ...req.body, apartmentId, updatedAt: new Date() })
      .returning();

    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi thêm không gian căn hộ" });
  }
});

// PUT /api/apartments/:id/spaces/:spaceId - Cập nhật không gian indoor
router.put("/:id/spaces/:spaceId", async (req, res) => {
  try {
    if (!requireManagerForApartmentAdmin(req, res)) return;

    const apartmentId = Number(req.params.id);
    const spaceId = Number(req.params.spaceId);

    const result = await db
      .update(apartmentSpaces)
      .set({ ...req.body, apartmentId, updatedAt: new Date() })
      .where(
        and(
          eq(apartmentSpaces.id, spaceId),
          eq(apartmentSpaces.apartmentId, apartmentId)
        )
      )
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy không gian căn hộ" });
    }

    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi cập nhật không gian căn hộ" });
  }
});

// DELETE /api/apartments/:id/spaces/:spaceId - Xóa không gian indoor
router.delete("/:id/spaces/:spaceId", async (req, res) => {
  try {
    if (!requireManagerForApartmentAdmin(req, res)) return;

    const apartmentId = Number(req.params.id);
    const spaceId = Number(req.params.spaceId);

    const existingItems = await db
      .select()
      .from(furnitureItems)
      .where(eq(furnitureItems.spaceId, spaceId));

    if (existingItems.length > 0) {
      return res.status(400).json({
        error: "Không thể xóa không gian đang chứa item nội thất",
      });
    }

    const result = await db
      .delete(apartmentSpaces)
      .where(
        and(
          eq(apartmentSpaces.id, spaceId),
          eq(apartmentSpaces.apartmentId, apartmentId)
        )
      )
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy không gian căn hộ" });
    }

    res.json({ message: "Đã xóa không gian căn hộ" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa không gian căn hộ" });
  }
});

// POST /api/apartments/:id/layouts - Thêm layout nội thất
router.post("/:id/layouts", async (req, res) => {
  try {
    const apartmentId = Number(req.params.id);
    const apartment = await getApartmentOrNull(apartmentId);
    if (!apartment) {
      return res.status(404).json({ error: "Không tìm thấy căn hộ" });
    }

    const result = await db
      .insert(furnitureLayouts)
      .values({
        ...req.body,
        apartmentId,
        createdById: req.user?.id ?? null,
        updatedById: req.user?.id ?? null,
        updatedAt: new Date(),
      })
      .returning();

    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi tạo layout nội thất" });
  }
});

// PUT /api/apartments/:id/layouts/:layoutId - Cập nhật layout nội thất
router.put("/:id/layouts/:layoutId", async (req, res) => {
  try {
    const apartmentId = Number(req.params.id);
    const layoutId = Number(req.params.layoutId);

    const result = await db
      .update(furnitureLayouts)
      .set({
        ...req.body,
        apartmentId,
        updatedById: req.user?.id ?? null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(furnitureLayouts.id, layoutId),
          eq(furnitureLayouts.apartmentId, apartmentId)
        )
      )
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy layout nội thất" });
    }

    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi cập nhật layout nội thất" });
  }
});

// DELETE /api/apartments/:id/layouts/:layoutId - Xóa layout và items liên quan
router.delete("/:id/layouts/:layoutId", async (req, res) => {
  try {
    const apartmentId = Number(req.params.id);
    const layoutId = Number(req.params.layoutId);

    const existingLayout = await db
      .select()
      .from(furnitureLayouts)
      .where(
        and(
          eq(furnitureLayouts.id, layoutId),
          eq(furnitureLayouts.apartmentId, apartmentId)
        )
      );

    if (existingLayout.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy layout nội thất" });
    }

    await db.delete(furnitureItems).where(eq(furnitureItems.layoutId, layoutId));
    await db.delete(furnitureLayouts).where(eq(furnitureLayouts.id, layoutId));

    res.json({ message: "Đã xóa layout nội thất" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa layout nội thất" });
  }
});

// POST /api/apartments/:id/layouts/:layoutId/items - Thêm item nội thất
router.post("/:id/layouts/:layoutId/items", async (req, res) => {
  try {
    const apartmentId = Number(req.params.id);
    const layoutId = Number(req.params.layoutId);

    const existingLayout = await db
      .select()
      .from(furnitureLayouts)
      .where(
        and(
          eq(furnitureLayouts.id, layoutId),
          eq(furnitureLayouts.apartmentId, apartmentId)
        )
      );

    if (existingLayout.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy layout nội thất" });
    }

    const placementError = await validateFurniturePlacement(layoutId, req.body.position);
    if (placementError) {
      return res.status(400).json({ error: placementError });
    }

    const result = await db
      .insert(furnitureItems)
      .values({ ...req.body, layoutId, updatedAt: new Date() })
      .returning();

    await db
      .update(furnitureLayouts)
      .set({ updatedAt: new Date(), updatedById: req.user?.id ?? null })
      .where(eq(furnitureLayouts.id, layoutId));

    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi thêm item nội thất" });
  }
});

// PUT /api/apartments/:id/layouts/:layoutId/items/:itemId - Cập nhật item nội thất
router.put("/:id/layouts/:layoutId/items/:itemId", async (req, res) => {
  try {
    const apartmentId = Number(req.params.id);
    const layoutId = Number(req.params.layoutId);
    const itemId = Number(req.params.itemId);

    const existingLayout = await db
      .select()
      .from(furnitureLayouts)
      .where(
        and(
          eq(furnitureLayouts.id, layoutId),
          eq(furnitureLayouts.apartmentId, apartmentId)
        )
      );

    if (existingLayout.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy layout nội thất" });
    }

    const placementError = await validateFurniturePlacement(
      layoutId,
      req.body.position,
      itemId
    );
    if (placementError) {
      return res.status(400).json({ error: placementError });
    }

    const result = await db
      .update(furnitureItems)
      .set({ ...req.body, layoutId, updatedAt: new Date() })
      .where(
        and(
          eq(furnitureItems.id, itemId),
          eq(furnitureItems.layoutId, layoutId)
        )
      )
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy item nội thất" });
    }

    await db
      .update(furnitureLayouts)
      .set({ updatedAt: new Date(), updatedById: req.user?.id ?? null })
      .where(eq(furnitureLayouts.id, layoutId));

    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi cập nhật item nội thất" });
  }
});

// DELETE /api/apartments/:id/layouts/:layoutId/items/:itemId - Xóa item nội thất
router.delete("/:id/layouts/:layoutId/items/:itemId", async (req, res) => {
  try {
    const apartmentId = Number(req.params.id);
    const layoutId = Number(req.params.layoutId);
    const itemId = Number(req.params.itemId);

    const existingLayout = await db
      .select()
      .from(furnitureLayouts)
      .where(
        and(
          eq(furnitureLayouts.id, layoutId),
          eq(furnitureLayouts.apartmentId, apartmentId)
        )
      );

    if (existingLayout.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy layout nội thất" });
    }

    const result = await db
      .delete(furnitureItems)
      .where(
        and(
          eq(furnitureItems.id, itemId),
          eq(furnitureItems.layoutId, layoutId)
        )
      )
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy item nội thất" });
    }

    await db
      .update(furnitureLayouts)
      .set({ updatedAt: new Date(), updatedById: req.user?.id ?? null })
      .where(eq(furnitureLayouts.id, layoutId));

    res.json({ message: "Đã xóa item nội thất" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa item nội thất" });
  }
});

// DELETE /api/apartments/:id - Xóa mềm căn hộ (UC16)
router.delete("/:id", async (req, res) => {
  try {
    const result = await db
      .update(apartments)
      .set({ deletedAt: new Date() })
      .where(
        and(eq(apartments.id, Number(req.params.id)), isNull(apartments.deletedAt))
      )
      .returning();
    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy căn hộ" });
    }
    res.json({ message: "Đã xóa căn hộ" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa căn hộ" });
  }
});

export default router;
