import { db } from "./index";
import {
  users,
  buildings,
  floors,
  navigationNodes,
  navigationEdges,
  apartments,
  apartmentSpaces,
  authSessions,
  furnitureCatalog,
  furnitureLayouts,
  furnitureItems,
  tenants,
  rentalContracts,
  payments,
  apartmentStatusHistory,
} from "./schema";
import { sql, eq, type SQL } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  // Clear existing data (reverse order of dependencies)
  console.log("Clearing old data...");
  await db.delete(payments);
  await db.delete(authSessions);
  await db.delete(furnitureItems);
  await db.delete(furnitureLayouts);
  await db.delete(rentalContracts);
  await db.delete(apartmentStatusHistory);
  await db.delete(apartmentSpaces);
  await db.delete(apartments);
  await db.delete(furnitureCatalog);
  await db.delete(navigationEdges);
  await db.delete(navigationNodes);
  await db.delete(floors);
  await db.delete(buildings);
  await db.delete(tenants);
  await db.delete(users);
  console.log("Old data cleared.");

  // Reset sequences
  await db.execute(sql`ALTER SEQUENCE users_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE buildings_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE floors_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE apartments_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE tenants_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE rental_contracts_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE payments_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE auth_sessions_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE apartment_status_history_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE navigation_nodes_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE navigation_edges_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE apartment_spaces_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE furniture_catalog_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE furniture_layouts_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE furniture_items_id_seq RESTART WITH 1`);
  console.log("Sequences reset.");

  // 1. Users (hash passwords)
  const hashPw = async (pw: string) => bcrypt.hash(pw, 10);
  const insertedUsers = await db
    .insert(users)
    .values([
      { username: "manager1", password: await hashPw("manager123"), fullName: "Nguyễn Văn Admin", email: "manager1@gis-apartment.vn", role: "manager" },
      { username: "manager2", password: await hashPw("manager123"), fullName: "Trần Thị Quản Lý", email: "manager2@gis-apartment.vn", role: "manager" },
      { username: "user1", password: await hashPw("user123"), fullName: "Lê Văn Người Dùng", email: "user1@gis-apartment.vn", role: "user" },
      { username: "user2", password: await hashPw("user123"), fullName: "Phạm Thị Hoa", email: "user2@gis-apartment.vn", role: "user" },
      { username: "user3", password: await hashPw("user123"), fullName: "Hoàng Minh Tuấn", email: "user3@gis-apartment.vn", role: "user", isActive: false },
    ])
    .returning();
  console.log(`Inserted ${insertedUsers.length} users`);

  // 2. Buildings (TP.HCM area) — totalFloors = số tầng thực tế sẽ seed
  const buildingDefs = [
    { name: "Sunrise Tower", address: "123 Nguyễn Hữu Thọ, Phường Tân Hưng", ward: "Tân Hưng", district: "Quận 7", city: "TP. Hồ Chí Minh", lng: 106.7004, lat: 10.7379, totalFloors: 5, description: "Chung cư cao cấp với view sông Sài Gòn", prefix: "SR", aptsPerFloor: 4, basePrice: 7000000 },
    { name: "Golden Palace", address: "456 Võ Văn Kiệt, Phường Cầu Kho", ward: "Cầu Kho", district: "Quận 1", city: "TP. Hồ Chí Minh", lng: 106.6942, lat: 10.7626, totalFloors: 5, description: "Tổ hợp căn hộ thương mại trung tâm thành phố", prefix: "GP", aptsPerFloor: 3, basePrice: 12000000 },
    { name: "Thủ Thiêm Residence", address: "789 Mai Chí Thọ, Phường An Phú", ward: "An Phú", district: "Thành phố Thủ Đức", city: "TP. Hồ Chí Minh", lng: 106.7219, lat: 10.7868, totalFloors: 4, description: "Khu căn hộ xanh gần khu đô thị Thủ Thiêm", prefix: "TT", aptsPerFloor: 3, basePrice: 8000000 },
    { name: "Phú Mỹ Hưng Tower", address: "321 Nguyễn Lương Bằng, Phường Tân Phú", ward: "Tân Phú", district: "Quận 7", city: "TP. Hồ Chí Minh", lng: 106.7196, lat: 10.7291, totalFloors: 5, description: "Căn hộ cao cấp khu Phú Mỹ Hưng", prefix: "PM", aptsPerFloor: 4, basePrice: 15000000 },
    { name: "Bình Thạnh Center", address: "55 Xô Viết Nghệ Tĩnh, Phường 26", ward: "Phường 26", district: "Quận Bình Thạnh", city: "TP. Hồ Chí Minh", lng: 106.7132, lat: 10.8014, totalFloors: 4, description: "Chung cư tiện ích gần trung tâm", prefix: "BT", aptsPerFloor: 3, basePrice: 5000000 },
  ];

  const insertedBuildings = await db
    .insert(buildings)
    .values(
      buildingDefs.map((b) => ({
        name: b.name,
        address: b.address,
        ward: b.ward,
        district: b.district,
        city: b.city,
        location: sql`ST_SetSRID(ST_MakePoint(${b.lng}, ${b.lat}, 0), 4326)`,
        totalFloors: b.totalFloors,
        description: b.description,
      })),
    )
    .returning();
  console.log(`Inserted ${insertedBuildings.length} buildings`);

  // 3. Floors — tạo đúng totalFloors tầng cho mỗi tòa
  const floorValues: { buildingId: number; floorNumber: number; description: string }[] = [];
  for (const building of insertedBuildings) {
    for (let i = 1; i <= building.totalFloors; i++) {
      floorValues.push({
        buildingId: building.id,
        floorNumber: i,
        description: `Tầng ${i} - ${building.name}`,
      });
    }
  }
  const insertedFloors = await db.insert(floors).values(floorValues).returning();
  console.log(`Inserted ${insertedFloors.length} floors`);

  // 4. Apartments — tự động generate cho MỖI tầng, đều nhau
  const aptLayouts = [
    { area: "45.0", numBedrooms: 1, numBathrooms: 1 },
    { area: "65.5", numBedrooms: 2, numBathrooms: 1 },
    { area: "80.0", numBedrooms: 3, numBathrooms: 2 },
    { area: "100.0", numBedrooms: 3, numBathrooms: 2 },
  ];
  const statusPool: ("available" | "rented" | "maintenance")[] = [
    "rented", "available", "rented", "maintenance", "rented", "available", "rented", "available",
    "rented", "rented", "available", "rented", "maintenance", "available", "rented", "rented",
  ];

  const apartmentData: {
    floorId: number;
    code: string;
    area: string;
    numBedrooms: number;
    numBathrooms: number;
    rentalPrice: string;
    status: "available" | "rented" | "maintenance";
  }[] = [];

  let statusIdx = 0;
  for (let bi = 0; bi < insertedBuildings.length; bi++) {
    const bDef = buildingDefs[bi];
    const bFloors = insertedFloors.filter((f) => f.buildingId === insertedBuildings[bi].id);

    for (const floor of bFloors) {
      for (let ai = 1; ai <= bDef.aptsPerFloor; ai++) {
        const layout = aptLayouts[(ai - 1) % aptLayouts.length];
        const priceMultiplier = 1 + (floor.floorNumber - 1) * 0.05; // tầng cao giá cao hơn 5%
        const price = Math.round(bDef.basePrice * priceMultiplier / 100000) * 100000;
        const code = `${bDef.prefix}-${floor.floorNumber}${String(ai).padStart(2, "0")}`;

        apartmentData.push({
          floorId: floor.id,
          code,
          area: layout.area,
          numBedrooms: layout.numBedrooms,
          numBathrooms: layout.numBathrooms,
          rentalPrice: String(price),
          status: statusPool[statusIdx % statusPool.length],
        });
        statusIdx++;
      }
    }
  }

  const insertedApartments = await db
    .insert(apartments)
    .values(apartmentData.map((a) => ({ ...a, createdById: 1 })))
    .returning();
  console.log(`Inserted ${insertedApartments.length} apartments`);

  // 4b. Navigation Nodes — tạo mạng lưới topology cho mỗi tòa nhà
  // Mỗi tầng có: 1 sảnh (junction), 1 thang máy, 1 cầu thang, và 1 cửa (door) cho mỗi căn hộ
  const FLOOR_HEIGHT = 3.5; // mét giữa các tầng
  const buildingBaseCoords: Record<number, { lng: number; lat: number }> = {};
  insertedBuildings.forEach((building, index) => {
    const definition = buildingDefs[index];
    if (!definition) return;
    buildingBaseCoords[building.id] = {
      lng: definition.lng,
      lat: definition.lat,
    };
  });

  // Tạo nodes cho mỗi tầng đã seed
  const nodeInserts: {
    floorId: number;
    nodeType: "junction" | "elevator" | "stairs" | "door";
    label: string;
    lng: number;
    lat: number;
    z: number;
  }[] = [];

  // Map để theo dõi node theo tầng: floorId -> { junction, elevator, stairs, doors[] }
  const floorNodeMap: Record<number, { junctionIdx: number; elevatorIdx: number; stairsIdx: number; doorIdxes: number[] }> = {};

  for (const floor of insertedFloors) {
    const buildingId = floor.buildingId;
    const base = buildingBaseCoords[buildingId];
    if (!base) {
      throw new Error(`Không tìm thấy tọa độ gốc cho buildingId=${buildingId} khi seed navigation`);
    }
    const z = floor.floorNumber * FLOOR_HEIGHT;
    const offset = 0.0001; // ~11m offset giữa các node

    const junctionIdx = nodeInserts.length;
    nodeInserts.push({
      floorId: floor.id,
      nodeType: "junction",
      label: `Sảnh tầng ${floor.floorNumber}`,
      lng: base.lng,
      lat: base.lat,
      z,
    });

    const elevatorIdx = nodeInserts.length;
    nodeInserts.push({
      floorId: floor.id,
      nodeType: "elevator",
      label: `Thang máy tầng ${floor.floorNumber}`,
      lng: base.lng + offset,
      lat: base.lat,
      z,
    });

    const stairsIdx = nodeInserts.length;
    nodeInserts.push({
      floorId: floor.id,
      nodeType: "stairs",
      label: `Cầu thang tầng ${floor.floorNumber}`,
      lng: base.lng - offset,
      lat: base.lat,
      z,
    });

    // Tạo door nodes cho các căn hộ thuộc tầng này
    const floorApartments = insertedApartments.filter((a) => a.floorId === floor.id);
    const doorIdxes: number[] = [];
    floorApartments.forEach((apt, i) => {
      const doorIdx = nodeInserts.length;
      doorIdxes.push(doorIdx);
      nodeInserts.push({
        floorId: floor.id,
        nodeType: "door",
        label: `Cửa căn ${apt.code}`,
        lng: base.lng + offset * (i + 2),
        lat: base.lat + offset,
        z,
      });
    });

    floorNodeMap[floor.id] = { junctionIdx, elevatorIdx, stairsIdx, doorIdxes };
  }

  // Insert tất cả nodes
  const insertedNodes: Array<{
    id: number;
    floorId: number;
    nodeType: "junction" | "elevator" | "stairs" | "door";
    label: string | null;
    location: string;
    createdAt: Date | null;
    updatedAt: Date | null;
  }> = [];
  for (const node of nodeInserts) {
    const result = await db
      .insert(navigationNodes)
      .values({
        floorId: node.floorId,
        nodeType: node.nodeType,
        label: node.label,
        location: sql`ST_SetSRID(ST_MakePoint(${node.lng}, ${node.lat}, ${node.z}), 4326)`,
      })
      .returning();
    insertedNodes.push(result[0]);
  }
  console.log(`Inserted ${insertedNodes.length} navigation nodes`);

  // 4c. Navigation Edges — kết nối nodes
  const edgeInserts: {
    startNodeId: number;
    endNodeId: number;
    edgeType: "hallway" | "stairs" | "elevator";
    distance: string;
    isAccessible: boolean;
  }[] = [];

  // Trong mỗi tầng: junction <-> elevator, junction <-> stairs, junction <-> mỗi door
  for (const floor of insertedFloors) {
    const map = floorNodeMap[floor.id];
    const junctionId = insertedNodes[map.junctionIdx].id;
    const elevatorId = insertedNodes[map.elevatorIdx].id;
    const stairsId = insertedNodes[map.stairsIdx].id;

    // Junction <-> Elevator (khoảng 10m)
    edgeInserts.push({ startNodeId: junctionId, endNodeId: elevatorId, edgeType: "hallway", distance: "10.00", isAccessible: true });
    // Junction <-> Stairs (khoảng 10m)
    edgeInserts.push({ startNodeId: junctionId, endNodeId: stairsId, edgeType: "hallway", distance: "10.00", isAccessible: true });
    // Junction <-> mỗi Door (khoảng 15-25m)
    map.doorIdxes.forEach((doorIdx, i) => {
      const doorId = insertedNodes[doorIdx].id;
      edgeInserts.push({
        startNodeId: junctionId,
        endNodeId: doorId,
        edgeType: "hallway",
        distance: String(15 + i * 5) + ".00",
        isAccessible: true,
      });
    });
  }

  // Nối tầng: elevator n <-> elevator n+1, stairs n <-> stairs n+1
  for (const building of insertedBuildings) {
    const buildingFloors = insertedFloors
      .filter((f) => f.buildingId === building.id)
      .sort((a, b) => a.floorNumber - b.floorNumber);

    for (let i = 0; i < buildingFloors.length - 1; i++) {
      const currentMap = floorNodeMap[buildingFloors[i].id];
      const nextMap = floorNodeMap[buildingFloors[i + 1].id];

      // Elevator liên tầng
      edgeInserts.push({
        startNodeId: insertedNodes[currentMap.elevatorIdx].id,
        endNodeId: insertedNodes[nextMap.elevatorIdx].id,
        edgeType: "elevator",
        distance: String(FLOOR_HEIGHT),
        isAccessible: true,
      });
      // Stairs liên tầng
      edgeInserts.push({
        startNodeId: insertedNodes[currentMap.stairsIdx].id,
        endNodeId: insertedNodes[nextMap.stairsIdx].id,
        edgeType: "stairs",
        distance: String(FLOOR_HEIGHT * 1.5), // cầu thang dài hơn thang máy
        isAccessible: true,
      });
    }
  }

  const insertedEdges = await db.insert(navigationEdges).values(edgeInserts).returning();
  console.log(`Inserted ${insertedEdges.length} navigation edges`);

  // 4d. Liên kết apartments với entry_node_id (door node tương ứng)
  for (const floor of insertedFloors) {
    const map = floorNodeMap[floor.id];
    const floorApartments = insertedApartments.filter((a) => a.floorId === floor.id);
    for (let i = 0; i < floorApartments.length; i++) {
      if (i < map.doorIdxes.length) {
        await db
          .update(apartments)
          .set({ entryNodeId: insertedNodes[map.doorIdxes[i]].id })
          .where(eq(apartments.id, floorApartments[i].id));
      }
    }
  }
  console.log("Linked apartments with entry nodes");

  // 4e. Furniture catalog
  const insertedFurnitureCatalog = await db
    .insert(furnitureCatalog)
    .values([
      {
        code: "SOFA-01",
        name: "Sofa chữ I",
        category: "sofa",
        model3dUrl: "/uploads/furniture/sofa-01.glb",
        defaultWidth: "2.20",
        defaultDepth: "0.90",
        defaultHeight: "0.85",
        metadata: { color: "gray", material: "fabric" },
      },
      {
        code: "TABLE-01",
        name: "Bàn ăn 4 ghế",
        category: "table",
        model3dUrl: "/uploads/furniture/table-01.glb",
        defaultWidth: "1.40",
        defaultDepth: "0.80",
        defaultHeight: "0.75",
        metadata: { seats: 4 },
      },
      {
        code: "BED-01",
        name: "Giường đôi",
        category: "bed",
        model3dUrl: "/uploads/furniture/bed-01.glb",
        defaultWidth: "1.80",
        defaultDepth: "2.00",
        defaultHeight: "0.65",
        metadata: { size: "queen" },
      },
      {
        code: "CABINET-01",
        name: "Tủ quần áo",
        category: "cabinet",
        model3dUrl: "/uploads/furniture/cabinet-01.glb",
        defaultWidth: "1.60",
        defaultDepth: "0.60",
        defaultHeight: "2.10",
        metadata: { doorType: "sliding" },
      },
    ])
    .returning();
  console.log(`Inserted ${insertedFurnitureCatalog.length} furniture catalog items`);

  // 4f. Apartment spaces + sample layouts/items cho một số căn hộ
  const sampleApartments = insertedApartments.slice(0, 6);
  const insertedSpaces: Array<{
    id: number;
    apartmentId: number;
    parentSpaceId: number | null;
    name: string;
  }> = [];

  for (const apartment of sampleApartments) {
    const unit = await db
      .insert(apartmentSpaces)
      .values({
        apartmentId: apartment.id,
        name: `Không gian căn ${apartment.code}`,
        spaceType: "unit",
        lodLevel: "lod4",
        metadata: { apartmentCode: apartment.code },
      })
      .returning();

    const livingRoom = await db
      .insert(apartmentSpaces)
      .values({
        apartmentId: apartment.id,
        parentSpaceId: unit[0].id,
        name: "Phòng khách",
        spaceType: "room",
        roomType: "living_room",
        lodLevel: "lod4",
        metadata: { width: 40, depth: 35 },
      })
      .returning();

    const bedroom = await db
      .insert(apartmentSpaces)
      .values({
        apartmentId: apartment.id,
        parentSpaceId: unit[0].id,
        name: "Phòng ngủ",
        spaceType: "room",
        roomType: "bedroom",
        lodLevel: "lod4",
        metadata: { width: 30, depth: 30 },
      })
      .returning();

    insertedSpaces.push(
      { id: unit[0].id, apartmentId: apartment.id, parentSpaceId: null, name: unit[0].name },
      { id: livingRoom[0].id, apartmentId: apartment.id, parentSpaceId: unit[0].id, name: livingRoom[0].name },
      { id: bedroom[0].id, apartmentId: apartment.id, parentSpaceId: unit[0].id, name: bedroom[0].name },
    );
  }
  console.log(`Inserted ${insertedSpaces.length} apartment spaces`);

  // 5. Tenants
  const insertedTenants = await db
    .insert(tenants)
    .values([
      { fullName: "Nguyễn Văn An", phone: "0901234567", email: "nguyenvanan@gmail.com", idCard: "079201001234", address: "12 Lê Lợi, Q.1, TP.HCM" },
      { fullName: "Trần Thị Bích", phone: "0912345678", email: "tranbich@gmail.com", idCard: "079201005678", address: "45 Trần Hưng Đạo, Q.5, TP.HCM" },
      { fullName: "Lê Hoàng Cường", phone: "0923456789", email: "lehoangcuong@gmail.com", idCard: "079201009012", address: "78 Nguyễn Trãi, Q.1, TP.HCM" },
      { fullName: "Phạm Minh Đức", phone: "0934567890", email: "phamminhduc@gmail.com", idCard: "079201003456", address: "100 Hai Bà Trưng, Q.3, TP.HCM" },
      { fullName: "Hoàng Thị Ema", phone: "0945678901", email: "hoangthiema@gmail.com", idCard: "079201007890", address: "23 Pasteur, Q.1, TP.HCM" },
      { fullName: "Võ Văn Phúc", phone: "0956789012", email: "vovanphuc@gmail.com", idCard: "079201002345", address: "56 Lý Tự Trọng, Q.1, TP.HCM" },
      { fullName: "Đặng Thị Giang", phone: "0967890123", email: "dangthigiang@gmail.com", idCard: "079201006789", address: "89 Cách Mạng Tháng 8, Q.3, TP.HCM" },
      { fullName: "Bùi Quốc Hưng", phone: "0978901234", email: "buiquochung@gmail.com", idCard: "079201000123", address: "34 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM" },
      { fullName: "Ngô Thị Ích", phone: "0989012345", email: "ngothiich@gmail.com", idCard: "079201004567", address: "67 Võ Văn Tần, Q.3, TP.HCM" },
      { fullName: "Lý Văn Kiệt", phone: "0990123456", email: "lyvankhiet@gmail.com", idCard: "079201008901", address: "11 Nguyễn Thị Minh Khai, Q.1, TP.HCM" },
      { fullName: "Mai Thị Lan", phone: "0901122334", email: "maithilan@gmail.com", idCard: "079201001122", address: "22 Bùi Viện, Q.1, TP.HCM" },
      { fullName: "Trịnh Công Minh", phone: "0912233445", email: "trinhcongminh@gmail.com", idCard: "079201003344", address: "55 Phan Đình Phùng, Q.Phú Nhuận, TP.HCM" },
    ])
    .returning();
  console.log(`Inserted ${insertedTenants.length} tenants`);

  // 6. Rental Contracts — rải đều nhiều thời điểm để timeline có nhiều mốc
  const rentedApartments = insertedApartments.filter((a) => a.status === "rented");

  // Mỗi hợp đồng bắt đầu ở tháng khác nhau (từ 2024-06 → 2025-12)
  const contractStartDates = [
    "2024-06-01", "2024-08-01", "2024-09-01", "2024-11-01",
    "2025-01-01", "2025-02-01", "2025-03-01", "2025-05-01",
    "2025-06-01", "2025-07-01", "2025-09-01", "2025-10-01",
    "2025-12-01",
  ];

  const contractValues = rentedApartments.map((apt, idx) => {
    const startDate = contractStartDates[idx % contractStartDates.length];
    // Hợp đồng kéo dài 12 tháng
    const startParts = startDate.split("-");
    const endYear = Number(startParts[0]) + 1;
    const endDate = `${endYear}-${startParts[1]}-${startParts[2]}`;

    return {
      apartmentId: apt.id,
      tenantId: insertedTenants[idx % insertedTenants.length].id,
      startDate,
      endDate,
      monthlyRent: apt.rentalPrice,
      deposit: String(Number(apt.rentalPrice) * 2),
      status: "active" as const,
      note: `Hợp đồng thuê căn ${apt.code}`,
      createdById: 1,
    };
  });

  const insertedContracts = await db.insert(rentalContracts).values(contractValues).returning();
  console.log(`Inserted ${insertedContracts.length} contracts`);

  // 7. Payments — tạo thanh toán hàng tháng từ ngày bắt đầu HĐ đến 2026-03
  const paymentValues: {
    contractId: number;
    amount: string;
    paymentDate: string;
    status: "paid" | "pending" | "overdue";
    note: string;
  }[] = [];

  const CUTOFF_YEAR = 2026;
  const CUTOFF_MONTH = 3; // tháng hiện tại

  for (let ci = 0; ci < insertedContracts.length; ci++) {
    const contract = insertedContracts[ci];
    const startDate = contractValues[ci].startDate;
    const [sYear, sMonth] = startDate.split("-").map(Number);

    let year = sYear;
    let month = sMonth;

    while (year < CUTOFF_YEAR || (year === CUTOFF_YEAR && month <= CUTOFF_MONTH)) {
      const payDate = `${year}-${String(month).padStart(2, "0")}-05`;
      const isPast = year < CUTOFF_YEAR || (year === CUTOFF_YEAR && month < CUTOFF_MONTH);
      const isCurrent = year === CUTOFF_YEAR && month === CUTOFF_MONTH;

      let status: "paid" | "pending" | "overdue";
      if (isPast) {
        status = "paid";
      } else if (isCurrent) {
        status = "pending";
      } else {
        status = "pending";
      }

      paymentValues.push({
        contractId: contract.id,
        amount: contract.monthlyRent,
        paymentDate: payDate,
        status,
        note: `Thanh toán tháng ${month}/${year}`,
      });

      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
    }
  }

  const insertedPayments = await db.insert(payments).values(paymentValues).returning();
  console.log(`Inserted ${insertedPayments.length} payments`);

  const insertedLayouts = await db
    .insert(furnitureLayouts)
    .values(
      sampleApartments.map((apartment, index) => ({
        apartmentId: apartment.id,
        name: `Layout mặc định ${apartment.code}`,
        status: (index % 2 === 0 ? "published" : "draft") as
          | "draft"
          | "published"
          | "archived",
        version: 1,
        createdById: 1,
        updatedById: 1,
      })),
    )
    .returning();
  console.log(`Inserted ${insertedLayouts.length} furniture layouts`);

  const furnitureItemValues: Array<{
    layoutId: number;
    spaceId: number | null;
    catalogId: number;
    label: string;
    position: SQL;
    rotationX: string;
    rotationY: string;
    rotationZ: string;
    scaleX: string;
    scaleY: string;
    scaleZ: string;
    isLocked: boolean;
    metadata: Record<string, unknown>;
  }> = [];

  insertedLayouts.forEach((layout) => {
    const apartmentSpaceRows = insertedSpaces.filter((space) => space.apartmentId === layout.apartmentId);
    const livingRoom = apartmentSpaceRows.find((space) => space.name === "Phòng khách");
    const bedroom = apartmentSpaceRows.find((space) => space.name === "Phòng ngủ");

    if (livingRoom) {
      furnitureItemValues.push(
        {
          layoutId: layout.id,
          spaceId: livingRoom.id,
          catalogId: insertedFurnitureCatalog[0].id,
          label: "Sofa chính",
          position: sql`ST_SetSRID(ST_MakePoint(20, 25, 0), 4326)`,
          rotationX: "0",
          rotationY: "0",
          rotationZ: "0",
          scaleX: "1",
          scaleY: "1",
          scaleZ: "1",
          isLocked: false,
          metadata: { seed: true },
        },
        {
          layoutId: layout.id,
          spaceId: livingRoom.id,
          catalogId: insertedFurnitureCatalog[1].id,
          label: "Bàn ăn",
          position: sql`ST_SetSRID(ST_MakePoint(65, 25, 0), 4326)`,
          rotationX: "0",
          rotationY: "0",
          rotationZ: "0",
          scaleX: "1",
          scaleY: "1",
          scaleZ: "1",
          isLocked: false,
          metadata: { seed: true },
        },
      );
    }

    if (bedroom) {
      furnitureItemValues.push(
        {
          layoutId: layout.id,
          spaceId: bedroom.id,
          catalogId: insertedFurnitureCatalog[2].id,
          label: "Giường chính",
          position: sql`ST_SetSRID(ST_MakePoint(30, 65, 0), 4326)`,
          rotationX: "0",
          rotationY: "0",
          rotationZ: "90",
          scaleX: "1",
          scaleY: "1",
          scaleZ: "1",
          isLocked: false,
          metadata: { seed: true },
        },
        {
          layoutId: layout.id,
          spaceId: bedroom.id,
          catalogId: insertedFurnitureCatalog[3].id,
          label: "Tủ quần áo",
          position: sql`ST_SetSRID(ST_MakePoint(72, 70, 0), 4326)`,
          rotationX: "0",
          rotationY: "0",
          rotationZ: "0",
          scaleX: "1",
          scaleY: "1",
          scaleZ: "1",
          isLocked: true,
          metadata: { seed: true },
        },
      );
    }
  });

  const insertedFurnitureItems = await db
    .insert(furnitureItems)
    .values(furnitureItemValues)
    .returning();
  console.log(`Inserted ${insertedFurnitureItems.length} furniture items`);

  console.log("\nSeed completed successfully!");
  console.log(`Summary:
  - Users: ${insertedUsers.length}
  - Buildings: ${insertedBuildings.length}
  - Floors: ${insertedFloors.length}
  - Navigation Nodes: ${insertedNodes.length}
  - Navigation Edges: ${insertedEdges.length}
  - Apartments: ${insertedApartments.length}
  - Apartment Spaces: ${insertedSpaces.length}
  - Furniture Catalog: ${insertedFurnitureCatalog.length}
  - Furniture Layouts: ${insertedLayouts.length}
  - Furniture Items: ${insertedFurnitureItems.length}
  - Tenants: ${insertedTenants.length}
  - Contracts: ${insertedContracts.length}
  - Payments: ${insertedPayments.length}
  `);

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
