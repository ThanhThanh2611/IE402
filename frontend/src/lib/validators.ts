import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Vui lòng nhập username"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export const userSchema = z.object({
  username: z.string().min(3, "Username tối thiểu 3 ký tự"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  fullName: z.string().min(1, "Vui lòng nhập họ tên"),
  email: z.string().email("Email không hợp lệ").or(z.literal("")),
  role: z.enum(["user", "manager"]),
});

export const userUpdateSchema = userSchema.omit({ password: true });

export const apartmentSchema = z.object({
  floorId: z.number({ required_error: "Vui lòng chọn tầng" }),
  code: z.string().min(1, "Vui lòng nhập mã căn hộ"),
  area: z.string().min(1, "Vui lòng nhập diện tích"),
  numBedrooms: z.number().nullable(),
  numBathrooms: z.number().nullable(),
  rentalPrice: z.string().min(1, "Vui lòng nhập giá thuê"),
  description: z.string().optional(),
});

export const tenantSchema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ tên"),
  phone: z
    .string()
    .min(1, "Vui lòng nhập SĐT")
    .regex(/^0\d{9}$/, "SĐT không hợp lệ (VD: 0901234567)"),
  email: z.string().email("Email không hợp lệ").or(z.literal("")).optional(),
  idCard: z
    .string()
    .min(1, "Vui lòng nhập CCCD")
    .regex(/^\d{12}$/, "CCCD phải có 12 chữ số"),
  address: z.string().optional(),
});

export const contractSchema = z
  .object({
    apartmentId: z.number({ required_error: "Vui lòng chọn căn hộ" }),
    tenantId: z.number({ required_error: "Vui lòng chọn người thuê" }),
    startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
    endDate: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
    monthlyRent: z.string().min(1, "Vui lòng nhập tiền thuê"),
    deposit: z.string().optional(),
    note: z.string().optional(),
  })
  .refine((d) => d.endDate > d.startDate, {
    message: "Ngày kết thúc phải sau ngày bắt đầu",
    path: ["endDate"],
  });

export const paymentSchema = z.object({
  contractId: z.number({ required_error: "Vui lòng chọn hợp đồng" }),
  amount: z.string().min(1, "Vui lòng nhập số tiền"),
  paymentDate: z.string().min(1, "Vui lòng chọn ngày thanh toán"),
  status: z.enum(["pending", "paid", "overdue"]),
  note: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type ApartmentInput = z.infer<typeof apartmentSchema>;
export type TenantInput = z.infer<typeof tenantSchema>;
export type ContractInput = z.infer<typeof contractSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;

export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, data: result.data };

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join(".");
    if (!errors[key]) errors[key] = issue.message;
  }
  return { success: false, errors };
}
