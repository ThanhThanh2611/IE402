import { describe, expect, it } from "vitest";

import {
  contractSchema,
  loginSchema,
  tenantSchema,
  userSchema,
  validateForm,
} from "./validators";
import { formatDate, formatVND } from "./hooks";

describe("validators", () => {
  it("validateForm tra data khi user hop le", () => {
    const result = validateForm(userSchema, {
      username: "manager1",
      password: "123456",
      fullName: "Manager Test",
      email: "manager@example.com",
      role: "manager",
    });

    expect(result).toEqual({
      success: true,
      data: {
        username: "manager1",
        password: "123456",
        fullName: "Manager Test",
        email: "manager@example.com",
        role: "manager",
      },
    });
  });

  it("tenantSchema chan so dien thoai va CCCD sai dinh dang", () => {
    const result = validateForm(tenantSchema, {
      fullName: "Nguyen Van A",
      phone: "123",
      email: "tenant@example.com",
      idCard: "12345",
      address: "HCM",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.phone).toContain("SĐT không hợp lệ");
      expect(result.errors.idCard).toContain("CCCD phải có 12 chữ số");
    }
  });

  it("contractSchema yeu cau ngay ket thuc phai sau ngay bat dau", () => {
    const result = validateForm(contractSchema, {
      apartmentId: 1,
      tenantId: 1,
      startDate: "2026-04-10",
      endDate: "2026-04-01",
      monthlyRent: "12000000",
      deposit: "24000000",
      note: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.endDate).toBe("Ngày kết thúc phải sau ngày bắt đầu");
    }
  });

  it("validateForm chi lay thong diep loi dau tien moi field", () => {
    const result = validateForm(loginSchema, {
      username: "",
      password: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.username).toBe("Vui lòng nhập username");
      expect(result.errors.password).toBe("Vui lòng nhập mật khẩu");
      expect(Object.keys(result.errors)).toHaveLength(2);
    }
  });

  it("tenantSchema chap nhan email rong vi la optional", () => {
    const result = validateForm(tenantSchema, {
      fullName: "Nguyen Van B",
      phone: "0901234567",
      email: "",
      idCard: "012345678912",
      address: "",
    });

    expect(result.success).toBe(true);
  });

  it("contractSchema khong chap nhan ngay ket thuc bang ngay bat dau", () => {
    const result = validateForm(contractSchema, {
      apartmentId: 1,
      tenantId: 1,
      startDate: "2026-04-08",
      endDate: "2026-04-08",
      monthlyRent: "10000000",
      deposit: "",
      note: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.endDate).toBe("Ngày kết thúc phải sau ngày bắt đầu");
    }
  });
});

describe("formatters", () => {
  it("formatVND dinh dang tien te VND", () => {
    expect(formatVND(12500000)).toContain("12.500.000");
    expect(formatVND("1500000")).toContain("1.500.000");
  });

  it("formatDate dinh dang ngay theo vi-VN", () => {
    expect(formatDate("2026-04-08")).toMatch(/08\/04\/2026|8\/4\/2026/);
  });
});
