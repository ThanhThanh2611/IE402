# Contracts API

Base URL: `/api/contracts`

> Khi tạo hợp đồng, trạng thái căn hộ tự động chuyển thành `rented`.
> Khi xóa hợp đồng, trạng thái căn hộ tự động chuyển về `available`.

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

**Response:** `200` - Object hợp đồng

**Lỗi:** `404` - Không tìm thấy

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
