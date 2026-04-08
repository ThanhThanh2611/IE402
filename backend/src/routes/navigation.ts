import { Router } from "express";
import { db } from "../db";
import { apartments, floors, navigationEdges, navigationNodes } from "../db/schema";
import { and, eq, isNull, sql } from "drizzle-orm";

const router = Router();

const navigationNodeSelect = {
  id: navigationNodes.id,
  floorId: navigationNodes.floorId,
  nodeType: navigationNodes.nodeType,
  label: navigationNodes.label,
  lng: sql<number>`ST_X(${navigationNodes.location})`,
  lat: sql<number>`ST_Y(${navigationNodes.location})`,
  z: sql<number>`ST_Z(${navigationNodes.location})`,
  localX: sql<number | null>`CASE WHEN ${navigationNodes.localX} IS NULL THEN NULL ELSE (${navigationNodes.localX})::float8 END`,
  localY: sql<number | null>`CASE WHEN ${navigationNodes.localY} IS NULL THEN NULL ELSE (${navigationNodes.localY})::float8 END`,
  localZ: sql<number | null>`CASE WHEN ${navigationNodes.localZ} IS NULL THEN NULL ELSE (${navigationNodes.localZ})::float8 END`,
  meshRef: navigationNodes.meshRef,
  metadata: navigationNodes.metadata,
  apartmentId: apartments.id,
  apartmentCode: apartments.code,
  createdAt: navigationNodes.createdAt,
  updatedAt: navigationNodes.updatedAt,
};

// ==================== NODES ====================

// GET /api/navigation/nodes?floorId=1 - Lấy danh sách nodes theo tầng
router.get("/nodes", async (req, res) => {
  try {
    const { floorId } = req.query;
    if (!floorId) {
      return res.status(400).json({ error: "Cần cung cấp floorId" });
    }

    const result = await db
      .select(navigationNodeSelect)
      .from(navigationNodes)
      .leftJoin(
        apartments,
        and(eq(apartments.entryNodeId, navigationNodes.id), isNull(apartments.deletedAt)),
      )
      .where(eq(navigationNodes.floorId, Number(floorId)));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách nodes" });
  }
});

// GET /api/navigation/nodes/:id - Lấy chi tiết node
router.get("/nodes/:id", async (req, res) => {
  try {
    const result = await db
      .select(navigationNodeSelect)
      .from(navigationNodes)
      .leftJoin(
        apartments,
        and(eq(apartments.entryNodeId, navigationNodes.id), isNull(apartments.deletedAt)),
      )
      .where(eq(navigationNodes.id, Number(req.params.id)));

    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy node" });
    }
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy thông tin node" });
  }
});

// POST /api/navigation/nodes - Tạo node mới
router.post("/nodes", async (req, res) => {
  try {
    const { floorId, nodeType, label, lng, lat, z, localX, localY, localZ, meshRef, metadata } = req.body;
    const result = await db
      .insert(navigationNodes)
      .values({
        floorId,
        nodeType,
        label,
        location: sql`ST_SetSRID(ST_MakePoint(${Number(lng)}, ${Number(lat)}, ${Number(z || 0)}), 4326)`,
        localX: localX ?? null,
        localY: localY ?? null,
        localZ: localZ ?? null,
        meshRef: meshRef ?? null,
        metadata: metadata ?? null,
      })
      .returning();

    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi tạo node" });
  }
});

// PUT /api/navigation/nodes/:id - Cập nhật node
router.put("/nodes/:id", async (req, res) => {
  try {
    const { floorId, nodeType, label, lng, lat, z, localX, localY, localZ, meshRef, metadata } = req.body;
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    if (floorId !== undefined) updateData.floorId = floorId;
    if (nodeType !== undefined) updateData.nodeType = nodeType;
    if (label !== undefined) updateData.label = label;
    if (localX !== undefined) updateData.localX = localX;
    if (localY !== undefined) updateData.localY = localY;
    if (localZ !== undefined) updateData.localZ = localZ;
    if (meshRef !== undefined) updateData.meshRef = meshRef;
    if (metadata !== undefined) updateData.metadata = metadata;
    if (lng !== undefined && lat !== undefined) {
      updateData.location = sql`ST_SetSRID(ST_MakePoint(${Number(lng)}, ${Number(lat)}, ${Number(z || 0)}), 4326)`;
    }

    const result = await db
      .update(navigationNodes)
      .set(updateData)
      .where(eq(navigationNodes.id, Number(req.params.id)))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy node" });
    }
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi cập nhật node" });
  }
});

// DELETE /api/navigation/nodes/:id - Xóa node
router.delete("/nodes/:id", async (req, res) => {
  try {
    const result = await db
      .delete(navigationNodes)
      .where(eq(navigationNodes.id, Number(req.params.id)))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy node" });
    }
    res.json({ message: "Đã xóa node" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa node" });
  }
});

// ==================== EDGES ====================

// GET /api/navigation/edges?floorId=1 - Lấy edges (lọc theo nodes thuộc tầng)
router.get("/edges", async (req, res) => {
  try {
    const { floorId } = req.query;

    if (floorId) {
      // Lấy edges có ít nhất 1 node thuộc tầng đó
      const result = await db.execute(sql`
        SELECT e.*
        FROM navigation_edges e
        JOIN navigation_nodes n1 ON e.start_node_id = n1.id
        JOIN navigation_nodes n2 ON e.end_node_id = n2.id
        WHERE n1.floor_id = ${Number(floorId)} OR n2.floor_id = ${Number(floorId)}
      `);
      return res.json(result);
    }

    const result = await db.select().from(navigationEdges);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách edges" });
  }
});

// GET /api/navigation/edges/:id - Lấy chi tiết edge
router.get("/edges/:id", async (req, res) => {
  try {
    const result = await db
      .select()
      .from(navigationEdges)
      .where(eq(navigationEdges.id, Number(req.params.id)));

    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy edge" });
    }
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy thông tin edge" });
  }
});

// POST /api/navigation/edges - Tạo edge mới
router.post("/edges", async (req, res) => {
  try {
    const result = await db
      .insert(navigationEdges)
      .values(req.body)
      .returning();

    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi tạo edge" });
  }
});

// PUT /api/navigation/edges/:id - Cập nhật edge
router.put("/edges/:id", async (req, res) => {
  try {
    const result = await db
      .update(navigationEdges)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(navigationEdges.id, Number(req.params.id)))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy edge" });
    }
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi cập nhật edge" });
  }
});

// DELETE /api/navigation/edges/:id - Xóa edge
router.delete("/edges/:id", async (req, res) => {
  try {
    const result = await db
      .delete(navigationEdges)
      .where(eq(navigationEdges.id, Number(req.params.id)))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy edge" });
    }
    res.json({ message: "Đã xóa edge" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa edge" });
  }
});

// ==================== GRAPH QUERY ====================

// GET /api/navigation/graph/:buildingId - Lấy toàn bộ graph (nodes + edges) của tòa nhà
router.get("/graph/:buildingId", async (req, res) => {
  try {
    const buildingId = Number(req.params.buildingId);

    const nodes = await db.execute(sql`
      SELECT
        n.id,
        n.floor_id AS "floorId",
        n.node_type AS "nodeType",
        n.label,
        ST_X(n.location) AS lng,
        ST_Y(n.location) AS lat,
        ST_Z(n.location) AS z,
        CASE WHEN n.local_x IS NULL THEN NULL ELSE n.local_x::float8 END AS "localX",
        CASE WHEN n.local_y IS NULL THEN NULL ELSE n.local_y::float8 END AS "localY",
        CASE WHEN n.local_z IS NULL THEN NULL ELSE n.local_z::float8 END AS "localZ",
        n.mesh_ref AS "meshRef",
        n.metadata,
        a.id AS "apartmentId",
        a.code AS "apartmentCode",
        n.created_at AS "createdAt",
        n.updated_at AS "updatedAt"
      FROM navigation_nodes n
      INNER JOIN floors f ON n.floor_id = f.id
      LEFT JOIN apartments a ON a.entry_node_id = n.id AND a.deleted_at IS NULL
      WHERE f.building_id = ${buildingId}
      ORDER BY f.floor_number ASC, n.id ASC
    `);

    const edges = await db.execute(sql`
      SELECT DISTINCT
        e.id,
        e.start_node_id AS "startNodeId",
        e.end_node_id AS "endNodeId",
        e.edge_type AS "edgeType",
        e.distance,
        e.travel_time AS "travelTime",
        e.is_accessible AS "isAccessible",
        e.created_at AS "createdAt",
        e.updated_at AS "updatedAt"
      FROM navigation_edges e
      INNER JOIN navigation_nodes n ON e.start_node_id = n.id
      INNER JOIN floors f ON n.floor_id = f.id
      WHERE f.building_id = ${buildingId}
      ORDER BY e.id ASC
    `);

    res.json({
      nodes,
      edges,
    });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy graph tòa nhà" });
  }
});

export default router;
