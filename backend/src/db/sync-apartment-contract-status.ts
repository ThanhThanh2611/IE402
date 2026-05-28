import { and, eq, isNull, lt, sql } from "drizzle-orm";
import { db } from "./index";
import { apartments, rentalContracts } from "./schema";

// Script thủ công đồng bộ trạng thái căn hộ <-> hợp đồng.
// Mục đích: dọn dữ liệu lệch hiện tại (Phương án C).
// - Hợp đồng quá end_date mà còn 'active' -> đổi sang 'expired'.
// - Căn hộ đang 'rented' nhưng không còn hợp đồng 'active' hợp lệ -> đổi sang 'available'
//   (giữ nguyên căn hộ đang 'maintenance').
export async function syncApartmentContractStatus() {
  const today = new Date().toISOString().slice(0, 10);

  const expired = await db
    .update(rentalContracts)
    .set({ status: "expired", updatedAt: new Date() })
    .where(
      and(
        eq(rentalContracts.status, "active"),
        lt(rentalContracts.endDate, today),
        isNull(rentalContracts.deletedAt)
      )
    )
    .returning({ id: rentalContracts.id });

  const released = await db
    .update(apartments)
    .set({ status: "available", updatedAt: new Date() })
    .where(
      and(
        eq(apartments.status, "rented"),
        isNull(apartments.deletedAt),
        sql`NOT EXISTS (
          SELECT 1 FROM ${rentalContracts} c
          WHERE c.apartment_id = ${apartments.id}
            AND c.status = 'active'
            AND c.deleted_at IS NULL
            AND c.start_date <= ${today}
            AND c.end_date >= ${today}
        )`
      )
    )
    .returning({ id: apartments.id });

  return {
    expiredContracts: expired.length,
    releasedApartments: released.length,
  };
}

const isMain = (() => {
  try {
    const entry = process.argv[1] ? process.argv[1].replace(/\\/g, "/") : "";
    return entry.endsWith("sync-apartment-contract-status.ts") ||
      entry.endsWith("sync-apartment-contract-status.js");
  } catch {
    return false;
  }
})();

if (isMain) {
  syncApartmentContractStatus()
    .then((stats) => {
      console.log(
        `[sync-apartment-contract-status] Đã expire ${stats.expiredContracts} hợp đồng, ` +
          `chuyển ${stats.releasedApartments} căn hộ về 'available'.`
      );
      process.exit(0);
    })
    .catch((err) => {
      console.error("[sync-apartment-contract-status] Lỗi:", err);
      process.exit(1);
    });
}
