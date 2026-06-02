# Contracts API

Base URL: `/api/contracts`

> Hợp đồng và trạng thái căn hộ được **đồng bộ hai chiều** — thay đổi một bên sẽ kéo bên kia cập nhật theo.
> Hợp đồng dùng **soft delete**.

---

## Danh sách hợp đồng

```
GET /api/contracts
```

**Response:** `200`

```json
[
  {
    "id": 1,
    "apartmentId": 1,
    "tenantId": 1,
    "startDate": "2025-01-01",
    "endDate": "2025-12-31",
    "monthlyRent": "8000000.00",
    "deposit": "16000000.00",
    "status": "active",
    "note": null,
    "createdById": 1,
    "updatedById": null,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

## Chi tiết hợp đồng (UC21)

```
GET /api/contracts/:id
```

**Quyền truy cập:**
- `Manager`
- `User` là tenant liên kết của hợp đồng
- `User` được cấp grant `canViewContract` trên căn hộ tương ứng

**Response:** `200` - Object hợp đồng

**Lỗi:** `403` - Không có quyền xem, `404` - Không tìm thấy

---

## Thêm hợp đồng (UC18)

```
POST /api/contracts
```

**Body:**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| apartmentId | number | Yes | ID căn hộ |
| tenantId | number | Yes | ID người thuê |
| startDate | string | Yes | Ngày bắt đầu (YYYY-MM-DD) |
| endDate | string | Yes | Ngày kết thúc (YYYY-MM-DD) |
| monthlyRent | number | Yes | Giá thuê thực tế (VND/tháng) |
| deposit | number | No | Tiền đặt cọc (VND) |
| note | string | No | Ghi chú |
| createdById | number | No | ID manager tạo |

**Response:** `201` - Object hợp đồng đã tạo

---

## Chỉnh sửa hợp đồng (UC19)

```
PUT /api/contracts/:id
```

**Body:** Các field cần cập nhật

Đồng bộ trạng thái căn hộ theo thay đổi:

| Tình huống | Hành động với căn hộ |
| --- | --- |
| `status` đổi thành `active` | Căn hộ → `rented`, cập nhật `rentalPrice` |
| `status` đổi thành `cancelled` hoặc `expired` | Căn hộ → `available` |
| Đổi sang căn hộ khác (`apartmentId` thay đổi) | Căn hộ cũ → `available`; căn hộ mới → `rented` |
| Chỉ đổi `monthlyRent`, không đổi `status` | Căn hộ cập nhật `rentalPrice` |

**Response:** `200` - Object hợp đồng đã cập nhật

**Lỗi:** `404` - Không tìm thấy

---

## Xóa hợp đồng (UC20)

```
DELETE /api/contracts/:id
```

**Response:** `200`

```json
{ "message": "Đã xóa hợp đồng" }
```

**Lỗi:** `404` - Không tìm thấy
