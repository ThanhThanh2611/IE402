import { db } from "./index";
import {
  users,
  buildings,
  floors,
  apartments,
  tenants,
  rentalContracts,
  payments,
} from "./schema";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  // Clear existing data (reverse order of dependencies)
  await db.delete(payments);
  await db.delete(rentalContracts);
  await db.delete(apartments);
  await db.delete(floors);
  await db.delete(buildings);
  await db.delete(tenants);
  await db.delete(users);

  // Reset sequences
  await db.execute(sql`ALTER SEQUENCE users_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE buildings_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE floors_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE apartments_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE tenants_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE rental_contracts_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE payments_id_seq RESTART WITH 1`);

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

  // 2. Buildings (TP.HCM area)
  const insertedBuildings = await db
    .insert(buildings)
    .values([
      {
        name: "Sunrise Tower",
        address: "123 Nguyễn Hữu Thọ, Phường Tân Hưng",
        ward: "Tân Hưng",
        district: "Quận 7",
        city: "TP. Hồ Chí Minh",
        location: sql`ST_SetSRID(ST_MakePoint(106.7004, 10.7379), 4326)`,
        totalFloors: 25,
        description: "Chung cư cao cấp với view sông Sài Gòn",
      },
      {
        name: "Golden Palace",
        address: "456 Võ Văn Kiệt, Phường Cầu Kho",
        ward: "Cầu Kho",
        district: "Quận 1",
        city: "TP. Hồ Chí Minh",
        location: sql`ST_SetSRID(ST_MakePoint(106.6942, 10.7626), 4326)`,
        totalFloors: 30,
        description: "Tổ hợp căn hộ thương mại trung tâm thành phố",
      },
      {
        name: "Thủ Thiêm Residence",
        address: "789 Mai Chí Thọ, Phường An Phú",
        ward: "An Phú",
        district: "Thành phố Thủ Đức",
        city: "TP. Hồ Chí Minh",
        location: sql`ST_SetSRID(ST_MakePoint(106.7219, 10.7868), 4326)`,
        totalFloors: 20,
        description: "Khu căn hộ xanh gần khu đô thị Thủ Thiêm",
      },
      {
        name: "Phú Mỹ Hưng Tower",
        address: "321 Nguyễn Lương Bằng, Phường Tân Phú",
        ward: "Tân Phú",
        district: "Quận 7",
        city: "TP. Hồ Chí Minh",
        location: sql`ST_SetSRID(ST_MakePoint(106.7196, 10.7291), 4326)`,
        totalFloors: 35,
        description: "Căn hộ cao cấp khu Phú Mỹ Hưng",
      },
      {
        name: "Bình Thạnh Center",
        address: "55 Xô Viết Nghệ Tĩnh, Phường 26",
        ward: "Phường 26",
        district: "Quận Bình Thạnh",
        city: "TP. Hồ Chí Minh",
        location: sql`ST_SetSRID(ST_MakePoint(106.7132, 10.8014), 4326)`,
        totalFloors: 18,
        description: "Chung cư tiện ích gần trung tâm",
      },
    ])
    .returning();
  console.log(`Inserted ${insertedBuildings.length} buildings`);

  // 3. Floors (tạo tầng cho mỗi tòa nhà, chỉ tạo vài tầng đại diện)
  const floorValues: { buildingId: number; floorNumber: number; description: string }[] = [];
  for (const building of insertedBuildings) {
    const numFloors = Math.min(building.totalFloors, 5); // Seed tối đa 5 tầng mỗi tòa
    for (let i = 1; i <= numFloors; i++) {
      floorValues.push({
        buildingId: building.id,
        floorNumber: i,
        description: `Tầng ${i} - ${building.name}`,
      });
    }
  }
  const insertedFloors = await db.insert(floors).values(floorValues).returning();
  console.log(`Inserted ${insertedFloors.length} floors`);

  // 4. Apartments
  const apartmentData = [
    // Sunrise Tower (building 1)
    { floorId: 1, code: "SR-101", area: "65.5", numBedrooms: 2, numBathrooms: 1, rentalPrice: "8000000", status: "rented" as const },
    { floorId: 1, code: "SR-102", area: "45.0", numBedrooms: 1, numBathrooms: 1, rentalPrice: "5500000", status: "available" as const },
    { floorId: 1, code: "SR-103", area: "80.0", numBedrooms: 3, numBathrooms: 2, rentalPrice: "12000000", status: "rented" as const },
    { floorId: 2, code: "SR-201", area: "65.5", numBedrooms: 2, numBathrooms: 1, rentalPrice: "8500000", status: "available" as const },
    { floorId: 2, code: "SR-202", area: "45.0", numBedrooms: 1, numBathrooms: 1, rentalPrice: "5800000", status: "maintenance" as const },
    { floorId: 3, code: "SR-301", area: "90.0", numBedrooms: 3, numBathrooms: 2, rentalPrice: "15000000", status: "rented" as const },
    { floorId: 3, code: "SR-302", area: "65.5", numBedrooms: 2, numBathrooms: 1, rentalPrice: "9000000", status: "available" as const },
    // Golden Palace (building 2)
    { floorId: 6, code: "GP-101", area: "75.0", numBedrooms: 2, numBathrooms: 2, rentalPrice: "15000000", status: "rented" as const },
    { floorId: 6, code: "GP-102", area: "55.0", numBedrooms: 1, numBathrooms: 1, rentalPrice: "10000000", status: "rented" as const },
    { floorId: 6, code: "GP-103", area: "120.0", numBedrooms: 3, numBathrooms: 2, rentalPrice: "25000000", status: "available" as const },
    { floorId: 7, code: "GP-201", area: "75.0", numBedrooms: 2, numBathrooms: 2, rentalPrice: "15500000", status: "rented" as const },
    { floorId: 7, code: "GP-202", area: "55.0", numBedrooms: 1, numBathrooms: 1, rentalPrice: "10500000", status: "available" as const },
    // Thủ Thiêm Residence (building 3)
    { floorId: 11, code: "TT-101", area: "70.0", numBedrooms: 2, numBathrooms: 1, rentalPrice: "9000000", status: "rented" as const },
    { floorId: 11, code: "TT-102", area: "50.0", numBedrooms: 1, numBathrooms: 1, rentalPrice: "6500000", status: "available" as const },
    { floorId: 12, code: "TT-201", area: "85.0", numBedrooms: 3, numBathrooms: 2, rentalPrice: "13000000", status: "rented" as const },
    { floorId: 12, code: "TT-202", area: "70.0", numBedrooms: 2, numBathrooms: 1, rentalPrice: "9500000", status: "maintenance" as const },
    // Phú Mỹ Hưng Tower (building 4)
    { floorId: 16, code: "PM-101", area: "100.0", numBedrooms: 3, numBathrooms: 2, rentalPrice: "20000000", status: "rented" as const },
    { floorId: 16, code: "PM-102", area: "60.0", numBedrooms: 2, numBathrooms: 1, rentalPrice: "12000000", status: "available" as const },
    { floorId: 17, code: "PM-201", area: "100.0", numBedrooms: 3, numBathrooms: 2, rentalPrice: "21000000", status: "rented" as const },
    { floorId: 17, code: "PM-202", area: "60.0", numBedrooms: 2, numBathrooms: 1, rentalPrice: "12500000", status: "rented" as const },
    // Bình Thạnh Center (building 5)
    { floorId: 21, code: "BT-101", area: "55.0", numBedrooms: 2, numBathrooms: 1, rentalPrice: "7000000", status: "rented" as const },
    { floorId: 21, code: "BT-102", area: "40.0", numBedrooms: 1, numBathrooms: 1, rentalPrice: "4500000", status: "available" as const },
    { floorId: 22, code: "BT-201", area: "55.0", numBedrooms: 2, numBathrooms: 1, rentalPrice: "7500000", status: "available" as const },
    { floorId: 22, code: "BT-202", area: "40.0", numBedrooms: 1, numBathrooms: 1, rentalPrice: "4800000", status: "rented" as const },
  ];

  const insertedApartments = await db
    .insert(apartments)
    .values(apartmentData.map((a) => ({ ...a, createdById: 1 })))
    .returning();
  console.log(`Inserted ${insertedApartments.length} apartments`);

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

  // 6. Rental Contracts (cho các apartment đã rented)
  const rentedApartments = insertedApartments.filter((a) => a.status === "rented");
  const contractValues = rentedApartments.map((apt, idx) => ({
    apartmentId: apt.id,
    tenantId: insertedTenants[idx % insertedTenants.length].id,
    startDate: "2025-01-01",
    endDate: "2026-01-01",
    monthlyRent: apt.rentalPrice,
    deposit: String(Number(apt.rentalPrice) * 2),
    status: "active" as const,
    note: `Hợp đồng thuê căn ${apt.code}`,
    createdById: 1,
  }));

  const insertedContracts = await db.insert(rentalContracts).values(contractValues).returning();
  console.log(`Inserted ${insertedContracts.length} contracts`);

  // 7. Payments (tạo thanh toán cho vài tháng)
  const paymentValues: {
    contractId: number;
    amount: string;
    paymentDate: string;
    status: "paid" | "pending" | "overdue";
    note: string;
  }[] = [];

  for (const contract of insertedContracts) {
    // Tạo thanh toán cho 3 tháng gần đây
    const months = ["2025-11-05", "2025-12-05", "2026-01-05"];
    const statuses: ("paid" | "pending" | "overdue")[] = ["paid", "paid", "pending"];

    months.forEach((date, i) => {
      paymentValues.push({
        contractId: contract.id,
        amount: contract.monthlyRent,
        paymentDate: date,
        status: statuses[i],
        note: `Thanh toán tháng ${11 + i}/2025`,
      });
    });
  }

  const insertedPayments = await db.insert(payments).values(paymentValues).returning();
  console.log(`Inserted ${insertedPayments.length} payments`);

  console.log("\nSeed completed successfully!");
  console.log(`Summary:
  - Users: ${insertedUsers.length}
  - Buildings: ${insertedBuildings.length}
  - Floors: ${insertedFloors.length}
  - Apartments: ${insertedApartments.length}
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
