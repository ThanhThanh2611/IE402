import { Router } from "express";
import { db } from "../db";
import { navigationNodes, navigationEdges } from "../db/schema";
import { eq, sql } from "drizzle-orm";

const router = Router();

// ==================== NODES ====================

// GET /api/navigation/nodes?floorId=1 - Lấy danh sách nodes theo tầng
router.get("/nodes", async (req, res) => {
  try {
    const { floorId } = req.query;
    if (!floorId) {
      return res.status(400).json({ error: "Cần cung cấp floorId" });
    }

    const result = await db
      .select({
        id: navigationNodes.id,
        floorId: navigationNodes.floorId,
        nodeType: navigationNodes.nodeType,
        label: navigationNodes.label,
        lng: sql<number>`ST_X(${navigationNodes.location})`,
        lat: sql<number>`ST_Y(${navigationNodes.location})`,
        z: sql<number>`ST_Z(${navigationNodes.location})`,
        createdAt: navigationNodes.createdAt,
        updatedAt: navigationNodes.updatedAt,
      })
      .from(navigationNodes)
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
      .select({
        id: navigationNodes.id,
        floorId: navigationNodes.floorId,
        nodeType: navigationNodes.nodeType,
        label: navigationNodes.label,
        lng: sql<number>`ST_X(${navigationNodes.location})`,
        lat: sql<number>`ST_Y(${navigationNodes.location})`,
        z: sql<number>`ST_Z(${navigationNodes.location})`,
        createdAt: navigationNodes.createdAt,
        updatedAt: navigationNodes.updatedAt,
      })
      .from(navigationNodes)
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
    const { floorId, nodeType, label, lng, lat, z } = req.body;
    const result = await db
      .insert(navigationNodes)
      .values({
        floorId,
        nodeType,
        label,
        location: sql`ST_SetSRID(ST_MakePoint(${Number(lng)}, ${Number(lat)}, ${Number(z || 0)}), 4326)`,
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
    const { floorId, nodeType, label, lng, lat, z } = req.body;
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    if (floorId !== undefined) updateData.floorId = floorId;
    if (nodeType !== undefined) updateData.nodeType = nodeType;
    if (label !== undefined) updateData.label = label;
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
      SELECT n.id, n.floor_id, n.node_type, n.label,
             ST_X(n.location) as lng, ST_Y(n.location) as lat, ST_Z(n.location) as z,
             n.created_at, n.updated_at
      FROM navigation_nodes n
      JOIN floors f ON n.floor_id = f.id
      WHERE f.building_id = ${buildingId}
    `);

    const edges = await db.execute(sql`
      SELECT e.*
      FROM navigation_edges e
      JOIN navigation_nodes n ON e.start_node_id = n.id
      JOIN floors f ON n.floor_id = f.id
      WHERE f.building_id = ${buildingId}
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
