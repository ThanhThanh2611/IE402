import { Request, Response, Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { requireManager } from "../middleware/auth";
import {
  buildings,
  furnitureLayoutTemplates,
  furnitureLayouts,
  furnitureItems,
  users,
} from "../db/schema";

const router = Router();

// GET /furniture-layout-templates/building/:buildingId
router.get("/building/:buildingId", async (req: Request, res: Response) => {
  try {
    const buildingId = Number(req.params.buildingId);

    const templates = await db
      .select({
        id: furnitureLayoutTemplates.id,
        name: furnitureLayoutTemplates.name,
        description: furnitureLayoutTemplates.description,
        isPublished: furnitureLayoutTemplates.isPublished,
        sourceLayoutId: furnitureLayoutTemplates.sourceLayoutId,
        createdById: furnitureLayoutTemplates.createdById,
        createdAt: furnitureLayoutTemplates.createdAt,
        updatedAt: furnitureLayoutTemplates.updatedAt,
        createdBy: {
          id: users.id,
          fullName: users.fullName,
          username: users.username,
        },
      })
      .from(furnitureLayoutTemplates)
      .leftJoin(users, eq(furnitureLayoutTemplates.createdById, users.id))
      .where(eq(furnitureLayoutTemplates.buildingId, buildingId));

    res.json(templates);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách template layout:", error);
    res.status(500).json({ error: "Không thể lấy danh sách template layout" });
  }
});

// GET /furniture-layout-templates/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const templateId = Number(req.params.id);

    const template = await db
      .select({
        id: furnitureLayoutTemplates.id,
        buildingId: furnitureLayoutTemplates.buildingId,
        name: furnitureLayoutTemplates.name,
        description: furnitureLayoutTemplates.description,
        isPublished: furnitureLayoutTemplates.isPublished,
        sourceLayoutId: furnitureLayoutTemplates.sourceLayoutId,
        createdById: furnitureLayoutTemplates.createdById,
        createdAt: furnitureLayoutTemplates.createdAt,
        updatedAt: furnitureLayoutTemplates.updatedAt,
      })
      .from(furnitureLayoutTemplates)
      .where(eq(furnitureLayoutTemplates.id, templateId));

    if (template.length === 0) {
      res.status(404).json({ error: "Không tìm thấy template layout" });
      return;
    }

    res.json(template[0]);
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết template layout:", error);
    res.status(500).json({ error: "Không thể lấy chi tiết template layout" });
  }
});

// POST /furniture-layout-templates — Manager only
// Body: { buildingId, name, description, sourceLayoutId? }
router.post("/", async (req: Request, res: Response) => {
  try {
    const { buildingId, name, description, sourceLayoutId } = req.body;
    const userId = (req as any).user?.id;

    if (!buildingId || !name) {
      res.status(400).json({ error: "buildingId và name là bắt buộc" });
      return;
    }

    // Verify building exists
    const building = await db
      .select({ id: buildings.id })
      .from(buildings)
      .where(eq(buildings.id, buildingId));

    if (building.length === 0) {
      res.status(404).json({ error: "Không tìm thấy tòa nhà" });
      return;
    }

    const result = await db
      .insert(furnitureLayoutTemplates)
      .values({
        buildingId,
        name,
        description: description || null,
        sourceLayoutId: sourceLayoutId ? Number(sourceLayoutId) : null,
        createdById: userId,
        isPublished: true, // Auto publish khi tạo từ user
      })
      .returning();

    // Cập nhật trạng thái của layout nguồn thành 'published'
    if (sourceLayoutId) {
      await db
        .update(furnitureLayouts)
        .set({ status: "published" })
        .where(eq(furnitureLayouts.id, Number(sourceLayoutId)));
    }

    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Lỗi khi tạo template layout:", error);
    res.status(500).json({ error: "Không thể tạo template layout" });
  }
});

// PUT /furniture-layout-templates/:id — Manager only
router.put("/:id", requireManager, async (req: Request, res: Response) => {
  try {
    const templateId = Number(req.params.id);
    const { name, description, isPublished } = req.body;
    const userId = (req as any).user?.id;

    const result = await db
      .update(furnitureLayoutTemplates)
      .set({
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isPublished !== undefined && { isPublished }),
        updatedById: userId,
        updatedAt: new Date(),
      })
      .where(eq(furnitureLayoutTemplates.id, templateId))
      .returning();

    if (result.length === 0) {
      res.status(404).json({ error: "Không tìm thấy template layout" });
      return;
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Lỗi khi cập nhật template layout:", error);
    res.status(500).json({ error: "Không thể cập nhật template layout" });
  }
});

// DELETE /furniture-layout-templates/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const templateId = Number(req.params.id);
    const user = (req as any).user;

    // Lấy thông tin template để kiểm tra quyền
    const existing = await db
      .select({ createdById: furnitureLayoutTemplates.createdById, sourceLayoutId: furnitureLayoutTemplates.sourceLayoutId })
      .from(furnitureLayoutTemplates)
      .where(eq(furnitureLayoutTemplates.id, templateId));

    if (existing.length === 0) {
      res.status(404).json({ error: "Không tìm thấy template layout" });
      return;
    }

    // Chỉ manager hoặc người tạo ra template mới được xóa
    if (user?.role !== "manager" && existing[0].createdById !== user?.id) {
      res.status(403).json({ error: "Bạn không có quyền xóa template này" });
      return;
    }

    await db
      .delete(furnitureLayoutTemplates)
      .where(eq(furnitureLayoutTemplates.id, templateId));

    // Đổi trạng thái layout nguồn về draft
    if (existing[0].sourceLayoutId) {
      await db
        .update(furnitureLayouts)
        .set({ status: "draft" })
        .where(eq(furnitureLayouts.id, existing[0].sourceLayoutId));
    }

    res.status(204).send();
  } catch (error) {
    console.error("Lỗi khi xóa template layout:", error);
    res.status(500).json({ error: "Không thể xóa template layout" });
  }
});

// POST /furniture-layout-templates/:templateId/apply
// Body: { apartmentId, layoutName }
// Copy items từ template layout sang căn hộ mới — mọi user đã đăng nhập đều có thể dùng
router.post("/:templateId/apply", async (req: Request, res: Response) => {
  try {
    const templateId = Number(req.params.templateId);
    const { apartmentId, layoutName } = req.body;
    const userId = (req as any).user?.id;

    if (!apartmentId || !layoutName) {
      res.status(400).json({ error: "apartmentId và layoutName là bắt buộc" });
      return;
    }

    // Get template
    const template = await db
      .select()
      .from(furnitureLayoutTemplates)
      .where(eq(furnitureLayoutTemplates.id, templateId));

    if (template.length === 0) {
      res.status(404).json({ error: "Không tìm thấy template layout" });
      return;
    }

    // Get source layout items
    const sourceLayout = template[0].sourceLayoutId;
    if (!sourceLayout) {
      res.status(400).json({
        error: "Template layout không có sourceLayoutId (chưa được cấu hình)",
      });
      return;
    }

    const sourceItems = await db
      .select()
      .from(furnitureItems)
      .where(eq(furnitureItems.layoutId, sourceLayout));

    // Create new layout
    const newLayout = await db
      .insert(furnitureLayouts)
      .values({
        apartmentId: Number(apartmentId),
        name: layoutName,
        status: "draft",
        version: 1,
        createdById: userId,
      })
      .returning();

    // Copy items
    if (sourceItems.length > 0) {
      const itemsToCopy = sourceItems.map((item) => ({
        layoutId: newLayout[0].id,
        spaceId: item.spaceId,
        catalogId: item.catalogId,
        label: item.label,
        position: item.position,
        rotationX: item.rotationX,
        rotationY: item.rotationY,
        rotationZ: item.rotationZ,
        scaleX: item.scaleX,
        scaleY: item.scaleY,
        scaleZ: item.scaleZ,
        isLocked: item.isLocked,
        metadata: item.metadata,
      }));

      await db.insert(furnitureItems).values(itemsToCopy);
    }

    res.status(201).json(newLayout[0]);
  } catch (error) {
    console.error("Lỗi khi áp dụng template layout:", error);
    res.status(500).json({ error: "Không thể áp dụng template layout" });
  }
});

export default router;
