import { Router } from "express";
import { db } from "../db";
import {
  apartmentAccessGrants,
  apartments,
  rentalContracts,
  tenants,
} from "../db/schema";
import { and, eq, gte, isNull, or } from "drizzle-orm";

const router = Router();

function requireManagerAction(req: any, res: any) {
  if (req.user?.role !== "manager") {
    res.status(403).json({ error: "Chỉ Manager mới có quyền quản lý hợp đồng" });
    return false;
  }

  return true;
}

async function canViewerAccessContract(contractId: number, viewer?: { id?: number; role?: string }) {
  const contractResult = await db
    .select()
    .from(rentalContracts)
    .where(and(eq(rentalContracts.id, contractId), isNull(rentalContracts.deletedAt)));

  const contract = contractResult[0] ?? null;
  if (!contract) {
    return { contract: null, allowed: false };
  }

  if (viewer?.role === "manager") {
    return { contract, allowed: true };
  }

  const tenantResult = await db
    .select()
    .from(tenants)
    .where(and(eq(tenants.id, contract.tenantId), isNull(tenants.deletedAt)));
  const tenant = tenantResult[0] ?? null;

  if (tenant?.linkedUserId === viewer?.id) {
    return { contract, allowed: true };
  }

  if (!viewer?.id) {
    return { contract, allowed: false };
  }

  const grantResult = await db
    .select()
    .from(apartmentAccessGrants)
    .where(
      and(
        eq(apartmentAccessGrants.apartmentId, contract.apartmentId),
        eq(apartmentAccessGrants.userId, viewer.id),
        eq(apartmentAccessGrants.canViewContract, true),
        or(
          isNull(apartmentAccessGrants.expiresAt),
          gte(apartmentAccessGrants.expiresAt, new Date())
        )
      )
    );

  return { contract, allowed: grantResult.length > 0 };
}

// GET /api/contracts - Lấy danh sách hợp đồng
router.get("/", async (req, res) => {
  try {
    if (!requireManagerAction(req, res)) return;

    const result = await db
      .select()
      .from(rentalContracts)
      .where(isNull(rentalContracts.deletedAt));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách hợp đồng" });
  }
});

// GET /api/contracts/:id - Lấy chi tiết hợp đồng (UC21)
router.get("/:id", async (req, res) => {
  try {
    const contractId = Number(req.params.id);
    const { contract, allowed } = await canViewerAccessContract(contractId, req.user);

    if (!contract) {
      return res.status(404).json({ error: "Không tìm thấy hợp đồng" });
    }

    if (!allowed) {
      return res.status(403).json({ error: "Bạn không có quyền xem hợp đồng này" });
    }

    res.json(contract);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy thông tin hợp đồng" });
  }
});

// POST /api/contracts - Thêm hợp đồng thuê (UC18)
router.post("/", async (req, res) => {
  try {
    if (!requireManagerAction(req, res)) return;

    const contract = await db
      .insert(rentalContracts)
      .values(req.body)
      .returning();

    // Cập nhật trạng thái căn hộ thành "rented"
    await db
      .update(apartments)
      .set({ status: "rented", updatedAt: new Date() })
      .where(eq(apartments.id, req.body.apartmentId));

    res.status(201).json(contract[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi tạo hợp đồng" });
  }
});

// PUT /api/contracts/:id - Chỉnh sửa hợp đồng (UC19)
router.put("/:id", async (req, res) => {
  try {
    if (!requireManagerAction(req, res)) return;

    const result = await db
      .update(rentalContracts)
      .set({ ...req.body, updatedAt: new Date() })
      .where(
        and(
          eq(rentalContracts.id, Number(req.params.id)),
          isNull(rentalContracts.deletedAt)
        )
      )
      .returning();
    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy hợp đồng" });
    }
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi cập nhật hợp đồng" });
  }
});

// DELETE /api/contracts/:id - Xóa mềm hợp đồng (UC20)
router.delete("/:id", async (req, res) => {
  try {
    if (!requireManagerAction(req, res)) return;

    const existing = await db
      .select()
      .from(rentalContracts)
      .where(
        and(
          eq(rentalContracts.id, Number(req.params.id)),
          isNull(rentalContracts.deletedAt)
        )
      );
    if (existing.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy hợp đồng" });
    }

    await db
      .update(rentalContracts)
      .set({ deletedAt: new Date() })
      .where(eq(rentalContracts.id, Number(req.params.id)));

    // Cập nhật trạng thái căn hộ thành "available"
    await db
      .update(apartments)
      .set({ status: "available", updatedAt: new Date() })
      .where(eq(apartments.id, existing[0].apartmentId));

    res.json({ message: "Đã xóa hợp đồng" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa hợp đồng" });
  }
});

export default router;
